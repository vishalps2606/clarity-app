import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Play, Pause, Square, CheckCircle, ArrowLeft } from 'lucide-react-native';
import client from '../api/client';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FocusModeScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { taskId, initialTitle, currentActualMinutes } = route.params;

  // Timer State
  const [secondsLeft, setSecondsLeft] = useState(25 * 60); // Default 25 mins
  const [isActive, setIsActive] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0); // Tracked in this session
  const [saving, setSaving] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer Logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            Alert.alert("Focus Cycle Complete", "Take a breather.");
            return 0;
          }
          return prev - 1;
        });
        // Track accumulated time every minute (roughly)
        // Better logic: store startTime, but this is simple enough for V1
      }, 1000);
    } else if (!isActive && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive]);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleToggle = () => setIsActive(!isActive);

  const handleFinish = async () => {
    // 1. Calculate time spent in this session
    // (Start Time - End Time is better, but simpler math for now: 
    // Default 25m (1500s) - Left (e.g. 300s) = 1200s used = 20 mins)
    const usedSeconds = (25 * 60) - secondsLeft;
    const usedMinutes = Math.floor(usedSeconds / 60);

    if (usedMinutes < 1) {
        Alert.alert("Abort?", "Session too short to record. Exit without saving?", [
            { text: "Stay", style: "cancel" },
            { text: "Exit", style: "destructive", onPress: () => navigation.goBack() }
        ]);
        return;
    }

    setSaving(true);
    try {
        // 2. Fetch latest task state (to get fresh Goal ID and Data)
        // We need this because PUT requires ALL fields (Title, GoalID, etc.)
        const taskRes = await client.get(`/tasks/${taskId}`);
        const task = taskRes.data;

        // 3. Update with new total time
        const newTotal = (task.actualMinutes || 0) + usedMinutes;

        await client.put(`/tasks/${taskId}`, {
            title: task.title,
            goalId: task.goal.id,
            estimatedMinutes: task.estimatedMinutes,
            dueDatetime: task.dueDatetime,
            actualMinutes: newTotal, // <--- SAVING PROGRESS
            status: 'IN_PROGRESS' // Auto-update status
        });

        Alert.alert("Session Recorded", `+${usedMinutes} minutes logged.`);
        navigation.goBack();
    } catch (err) {
        console.error(err);
        Alert.alert("Sync Error", "Could not save progress.");
    } finally {
        setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={isActive}>
            <ArrowLeft size={24} color={isActive ? "#333" : "#888"} />
        </TouchableOpacity>
        <Text style={styles.statusText}>{isActive ? "FOCUS LINK: ACTIVE" : "SYSTEM IDLE"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.taskLabel}>CURRENT OBJECTIVE</Text>
        <Text style={styles.taskTitle} numberOfLines={2}>{initialTitle}</Text>

        {/* The Timer Display */}
        <View style={[styles.timerCircle, isActive ? styles.timerActive : styles.timerIdle]}>
            <Text style={[styles.timerText, isActive ? styles.textActive : styles.textIdle]}>
                {formatTime(secondsLeft)}
            </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
            <TouchableOpacity 
                style={[styles.btn, styles.playBtn]} 
                onPress={handleToggle}
            >
                {isActive ? <Pause size={32} color="#000" /> : <Play size={32} color="#000" fill="#000" />}
            </TouchableOpacity>

            {!isActive && secondsLeft !== 25 * 60 && (
                <TouchableOpacity style={[styles.btn, styles.stopBtn]} onPress={handleFinish} disabled={saving}>
                    {saving ? <ActivityIndicator color="#000" /> : <CheckCircle size={32} color="#000" />}
                </TouchableOpacity>
            )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  statusText: { color: '#888', fontFamily: 'monospace', letterSpacing: 2, fontSize: 10 },
  
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  taskLabel: { color: '#00F0FF', fontSize: 12, fontWeight: 'bold', letterSpacing: 2, marginBottom: 12 },
  taskTitle: { color: '#EDEDED', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 48 },

  timerCircle: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    marginBottom: 64,
  },
  timerActive: { borderColor: '#0AFF60', shadowColor: '#0AFF60', shadowRadius: 20, shadowOpacity: 0.3, elevation: 10 },
  timerIdle: { borderColor: '#333' },
  
  timerText: { fontSize: 64, fontWeight: 'bold', fontVariant: ['tabular-nums'] },
  textActive: { color: '#0AFF60' },
  textIdle: { color: '#444' },

  controls: { flexDirection: 'row', gap: 32 },
  btn: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center' },
  playBtn: { backgroundColor: '#EDEDED' },
  stopBtn: { backgroundColor: '#0AFF60' },
});