import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  AppState,
  ActivityIndicator,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { Play, Pause, Square, Zap, Clock } from "lucide-react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import client from "../api/client";

export default function FocusModeScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { taskId, initialTitle, currentActualMinutes } = route.params;

  // Timer State
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const appState = useRef(AppState.currentState);

  // 1. APP STATE LISTENER: Fixes timer drift when backgrounded
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active" &&
        isActive &&
        startTime
      ) {
        // App returned to foreground: Recalculate precisely
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(accumulatedTime + elapsed);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [isActive, startTime, accumulatedTime]);

  // 2. THE TIMER ENGINE
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(accumulatedTime + elapsed);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, startTime]);

  const toggleFocus = () => {
    if (!isActive) {
      setStartTime(Date.now());
      setIsActive(true);
    } else {
      setAccumulatedTime(seconds);
      setStartTime(null);
      setIsActive(false);
    }
  };

  // 3. LOGGING MUTATION
  const logTimeMutation = useMutation({
    mutationFn: (minutes: number) =>
      client.post("/time-blocks", {
        taskId,
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      navigation.goBack();
    },
  });

  const handleFinish = () => {
    const minutesEarned = Math.floor(seconds / 60);
    if (minutesEarned > 0) {
      logTimeMutation.mutate(minutesEarned);
    } else {
      navigation.goBack();
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Zap color="#00F0FF" size={24} fill="#00F0FF" />
        <Text style={styles.headerTitle}>NEURAL SYNC ACTIVE</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.taskTitle}>{initialTitle}</Text>
        <Text style={styles.timerText}>{formatTime(seconds)}</Text>

        <View style={styles.statRow}>
          <Clock color="#444" size={14} />
          <Text style={styles.statText}>
            PREVIOUS SESSION: {currentActualMinutes}M
          </Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlBtn, styles.pauseBtn]}
            onPress={toggleFocus}
          >
            {isActive ? (
              <Pause color="#FFF" fill="#FFF" size={32} />
            ) : (
              <Play color="#FFF" fill="#FFF" size={32} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlBtn, styles.stopBtn]}
            onPress={handleFinish}
            disabled={logTimeMutation.isPending}
          >
            {logTimeMutation.isPending ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Square color="#000" fill="#000" size={24} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  header: { paddingTop: 60, paddingBottom: 20, alignItems: "center", gap: 10 },
  headerTitle: {
    color: "#00F0FF",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  taskTitle: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  timerText: {
    color: "#FFF",
    fontSize: 80,
    fontWeight: "100",
    fontFamily: "monospace",
    marginBottom: 20,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    opacity: 0.5,
    marginBottom: 60,
  },
  statText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  controls: { flexDirection: "row", gap: 30, alignItems: "center" },
  controlBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  pauseBtn: { backgroundColor: "#1A1A1A", borderWidth: 1, borderColor: "#333" },
  stopBtn: { backgroundColor: "#0AFF60" },
});
