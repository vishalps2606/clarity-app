import { useEffect, useState, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface FocusTimerProps {
  durationMinutes: number;
  onComplete: (actualDuration: number) => void;
}

export default function FocusTimer({ durationMinutes, onComplete }: FocusTimerProps) {
  const initialSeconds = durationMinutes * 60;
  
  // Bulletproof State
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [accumulatedTime, setAccumulatedTime] = useState(0);
  
  const timerRef = useRef<number | null>(null);

  // 1. ENGINE: Absolute time calculation
  useEffect(() => {
    if (isActive && startTime) {
      timerRef.current = window.setInterval(() => {
        const elapsedNow = Math.floor((Date.now() - startTime) / 1000);
        const newTimeLeft = Math.max(0, initialSeconds - accumulatedTime - elapsedNow);
        setTimeLeft(newTimeLeft);

        // Natural Completion Trigger
        if (newTimeLeft <= 0) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setIsActive(false);
          onComplete(Math.floor(initialSeconds / 60)); // Log full allocated time
        }
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) window.clearInterval(timerRef.current); };
  }, [isActive, startTime, accumulatedTime, initialSeconds, onComplete]);

  // 2. ANTI-THROTTLING: Sync UI immediately when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && startTime) {
        const elapsedNow = Math.floor((Date.now() - startTime) / 1000);
        setTimeLeft(Math.max(0, initialSeconds - accumulatedTime - elapsedNow));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, startTime, accumulatedTime, initialSeconds]);

  const toggleTimer = () => {
    if (!isActive) {
      setStartTime(Date.now());
      setIsActive(true);
    } else {
      if (startTime) {
        const elapsedNow = Math.floor((Date.now() - startTime) / 1000);
        setAccumulatedTime(prev => prev + elapsedNow);
      }
      setStartTime(null);
      setIsActive(false);
    }
  };

  // Triggered only when the user manually presses the STOP button
  const handleFinishEarly = () => {
    setIsActive(false);
    if (timerRef.current) window.clearInterval(timerRef.current);

    // Calculate exactly how many minutes were spent based on total elapsed
    const secondsSpent = initialSeconds - timeLeft;
    const minutesSpent = Math.floor(secondsSpent / 60);

    onComplete(minutesSpent);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-surface" />
        
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-neon-blue transition-all duration-1000 ease-linear"
            strokeDasharray={753}
            strokeDashoffset={753 - (753 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>

        <div className={clsx(
            "text-6xl font-mono font-bold tracking-widest z-10",
            isActive ? "text-neon-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "text-text-muted"
        )}>
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
            onClick={toggleTimer} 
            className={clsx("w-32", isActive ? "border-neon-purple text-neon-purple" : "bg-neon-blue text-black")}
            variant={isActive ? "outline" : "primary"}
        >
          {isActive ? (
             <span className="flex items-center gap-2"><Pause size={18} /> PAUSE</span>
          ) : (
             <span className="flex items-center gap-2"><Play size={18} /> FOCUS</span>
          )}
        </Button>

        <Button variant="danger" onClick={handleFinishEarly} title="End Session Early">
           <Square size={18} fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}