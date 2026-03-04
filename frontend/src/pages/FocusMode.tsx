import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppLayout from "../layouts/AppLayout";
import api from "../api/client";
import {
  Play,
  Pause,
  Square,
  Zap,
  Clock,
  ArrowLeft,
  Loader2,
} from "lucide-react";

export default function FocusMode() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const res = await api.get(`/tasks/${taskId}`);
      return res.data;
    },
  });

  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(accumulatedTime + elapsed);
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isActive, startTime, accumulatedTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && isActive && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setSeconds(accumulatedTime + elapsed);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isActive, startTime, accumulatedTime]);

  const toggleTimer = () => {
    if (!isActive) {
      setStartTime(Date.now());
      setIsActive(true);
    } else {
      setAccumulatedTime(seconds);
      setStartTime(null);
      setIsActive(false);
    }
  };

  const logTimeMutation = useMutation({
    mutationFn: (minutes: number) =>
      api.post("/time-blocks", {
        taskId: Number(taskId),
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["time-blocks"] });
      navigate(-1); 
    },
  });

  const handleFinish = () => {
    const minutesEarned = Math.floor(seconds / 60);
    if (minutesEarned > 0) {
      logTimeMutation.mutate(minutesEarned);
    } else {
      navigate(-1); 
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading)
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full text-neon-blue font-mono">
          <Loader2 className="animate-spin mr-2" /> ESTABLISHING NEURAL LINK...
        </div>
      </AppLayout>
    );

  return (
    <AppLayout>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-secondary hover:text-white mb-8 transition-colors font-mono text-xs uppercase tracking-widest"
      >
        <ArrowLeft size={14} /> Abort Session
      </button>

      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto text-center">
        <div className="flex items-center gap-3 mb-6 bg-neon-blue/10 px-4 py-2 rounded-full border border-neon-blue/20">
          <Zap className="text-neon-blue" fill="currentColor" size={16} />
          <span className="text-neon-blue font-mono text-xs font-bold tracking-widest uppercase">
            Focus Protocol Active
          </span>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-2 uppercase tracking-tight">
          {task?.title || "Unknown Objective"}
        </h2>

        <div className="flex items-center gap-2 text-text-secondary font-mono text-sm mb-12">
          <Clock size={14} />
          <span>
            Previous allocation: {task?.actualMinutes || 0}m /{" "}
            {task?.estimatedMinutes || 0}m
          </span>
        </div>

        <div className="text-8xl md:text-9xl font-light font-mono text-text-primary tracking-tighter mb-16 tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center gap-8">
          <button
            onClick={toggleTimer}
            className="w-20 h-20 rounded-full bg-surface border border-border flex items-center justify-center hover:border-neon-blue hover:bg-neon-blue/5 transition-all text-white"
          >
            {isActive ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play size={32} fill="currentColor" className="ml-2" />
            )}
          </button>

          <button
            onClick={handleFinish}
            disabled={logTimeMutation.isPending}
            className="w-20 h-20 rounded-full bg-neon-green text-black flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50"
          >
            {logTimeMutation.isPending ? (
              <Loader2 className="animate-spin text-black" size={32} />
            ) : (
              <Square size={24} fill="currentColor" />
            )}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
