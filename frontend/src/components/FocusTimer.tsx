import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Square } from 'lucide-react';
import { Button } from './Button';
import { clsx } from 'clsx';

interface FocusTimerProps {
  durationMinutes: number;
  onComplete: (actualDuration: number) => void;
}

export default function FocusTimer({ durationMinutes, onComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    let interval: any;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished naturally
      setIsActive(false);
      handleFinish();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive && !startTime) {
      setStartTime(new Date()); // Log start time on first play
    }
    setIsActive(!isActive);
  };

  const handleFinish = () => {
    setIsActive(false);
    // Calculate minutes spent
    const spent = durationMinutes - Math.floor(timeLeft / 60);
    onComplete(spent === 0 ? 1 : spent); // Minimum 1 minute
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((durationMinutes * 60 - timeLeft) / (durationMinutes * 60)) * 100;

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      {/* GLOWING RING BACKGROUND */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-surface" />
        
        {/* Progress Ring (SVG) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="transparent"
            stroke="currentColor"
            strokeWidth="4"
            className="text-neon-blue transition-all duration-1000 ease-linear"
            strokeDasharray={753} // Circumference of r=120
            strokeDashoffset={753 - (753 * progress) / 100}
            strokeLinecap="round"
          />
        </svg>

        {/* The Time Display */}
        <div className={clsx(
            "text-6xl font-mono font-bold tracking-widest z-10",
            isActive ? "text-neon-blue drop-shadow-[0_0_10px_rgba(0,240,255,0.5)]" : "text-text-muted"
        )}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* CONTROLS */}
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

        <Button variant="danger" onClick={handleFinish} title="End Session Early">
           <Square size={18} fill="currentColor" />
        </Button>
      </div>
    </div>
  );
}