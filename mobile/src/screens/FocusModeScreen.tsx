import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Play, Pause, Square, CheckCircle, ArrowLeft } from 'lucide-react-native';
import { Audio } from 'expo-av';
import client from '../api/client';

export default function FocusModeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { taskId, initialTitle, currentActualMinutes } = route.params;

  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);
  const [saving, setSaving] = useState(false);

  // Refs for interval and background keeping
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Auto-start on entry
    startTimer();
    return () => stopTimer();
  }, []);

  const startTimer = () => {
    if (!isActive) {
      if (!sessionStart) setSessionStart(new Date()); 
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsActive(false);
  };

  const toggleTimer = () => {
    isActive ? stopTimer() : startTimer();
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndSession = async (markComplete: boolean) => {
    stopTimer();
    if (seconds < 60) {
      Alert.alert("Session Too Short", "Focus time must be at least 1 minute to log.");
      return;
    }

    setSaving(true);
    try {
        const endTime = new Date();
        const startTime = sessionStart || new Date(); // Fallback

        // 1. Create TimeBlock (The Record of Work)
        await client.post('/time-blocks', {
            taskId: taskId,
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        });

        // 2. Update Task Status (If Complete)
        if (markComplete) {
            await client.put(`/tasks/${taskId}/complete`);
        }

        // 3. Success Feedback
        if (markComplete) {
            Alert.alert("Mission Accomplished", "Task closed. Session recorded.");
        } else {
            Alert.alert("Session Logged", "Focus time added to your records.");
        }
        
        navigation.goBack();

    } catch (err) {
        console.error(err);
        Alert.alert("Error", "Failed to save session data.");
    } finally {
        setSaving(false);
    }
  };

  // Confirmation Wrapper
  const confirmEnd = (markComplete: boolean) => {
    Alert.alert(
        markComplete ? "Complete Mission?" : "Pause Session?",
        markComplete 
            ? "This will mark the objective as DONE and save your time." 
            : "This will save your current focus time and leave the objective OPEN.",
        [
            { text: "Cancel", style: "cancel", onPress: () => isActive && startTimer() },
            { text: "Confirm", onPress: () => handleEndSession(markComplete) }
        ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
            <ArrowLeft size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FOCUS MODE</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Task Title */}
        <Text style={styles.taskTitle}>{initialTitle}</Text>
        
        {/* Timer Display */}
        <View style={[styles.timerCircle, isActive ? styles.activeCircle : styles.inactiveCircle]}>
            <Text style={styles.timerText}>{formatTime(seconds)}</Text>
            <Text style={styles.subText}>SESSION TIME</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
            <Text style={styles.statLabel}>PREVIOUSLY LOGGED:</Text>
            <Text style={styles.statValue}>{currentActualMinutes}m</Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
            {/* Toggle Play/Pause */}
            <TouchableOpacity onPress={toggleTimer} style={styles.playBtn}>
                {isActive ? <Pause size={48} color="#000" fill="#000" /> : <Play size={48} color="#000" fill="#000" />}
            </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
            {/* STOP & SAVE (Keep Open) */}
            <TouchableOpacity 
                style={[styles.btn, styles.stopBtn]} 
                onPress={() => confirmEnd(false)}
                disabled={saving}
            >
                <Square size={20} color="#FF003C" fill="#FF003C" />
                <Text style={[styles.btnText, { color: '#FF003C' }]}>STOP & SAVE</Text>
            </TouchableOpacity>

            {/* COMPLETE (Close Task) */}
            <TouchableOpacity 
                style={[styles.btn, styles.completeBtn]} 
                onPress={() => confirmEnd(true)}
                disabled={saving}
            >
                {saving ? <ActivityIndicator color="#000" /> : (
                    <>
                        <CheckCircle size={20} color="#000" />
                        <Text style={[styles.btnText, { color: '#000' }]}>COMPLETE TASK</Text>
                    </>
                )}
            </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, paddingTop: 60, alignItems: 'center' },
  headerTitle: { color: '#666', fontWeight: 'bold', letterSpacing: 2 },
  
  content: { flex: 1, justifyContent: 'space-between', padding: 30, paddingBottom: 60 },
  
  taskTitle: { color: '#EDEDED', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  
  timerCircle: { 
    width: 280, height: 280, borderRadius: 140, 
    borderWidth: 4, 
    justifyContent: 'center', alignItems: 'center', alignSelf: 'center',
    marginBottom: 40
  },
  activeCircle: { borderColor: '#00F0FF', backgroundColor: 'rgba(0, 240, 255, 0.05)' },
  inactiveCircle: { borderColor: '#333', backgroundColor: 'transparent' },
  
  timerText: { color: '#EDEDED', fontSize: 64, fontWeight: 'bold', fontFamily: 'monospace' },
  subText: { color: '#666', fontSize: 12, marginTop: 8, letterSpacing: 2 },

  statsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  statLabel: { color: '#666' },
  statValue: { color: '#EDEDED', fontWeight: 'bold' },

  controls: { alignItems: 'center', marginBottom: 40 },
  playBtn: { 
    width: 80, height: 80, borderRadius: 40, 
    backgroundColor: '#EDEDED', 
    justifyContent: 'center', alignItems: 'center' 
  },

  actions: { gap: 16 },
  btn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 18, borderRadius: 12, gap: 12, borderWidth: 1 },
  stopBtn: { borderColor: '#333', backgroundColor: '#111' },
  completeBtn: { backgroundColor: '#00F0FF', borderColor: '#00F0FF' },
  btnText: { fontWeight: 'bold', fontSize: 16, letterSpacing: 1 }
});