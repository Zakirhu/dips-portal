import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertTriangle, ShieldAlert, Timer } from 'lucide-react';

interface QuizCountdownTimerProps {
  totalSeconds: number;
  initialRemainingSeconds?: number;
  isActive: boolean;
  isExamMode: boolean;
  onTimeExpired: () => void;
  onTick?: (remaining: number) => void;
  className?: string;
}

export const QuizCountdownTimer: React.FC<QuizCountdownTimerProps> = ({
  totalSeconds,
  initialRemainingSeconds,
  isActive,
  isExamMode,
  onTimeExpired,
  onTick,
  className = ''
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(
    initialRemainingSeconds !== undefined ? initialRemainingSeconds : totalSeconds
  );
  const [hasExpired, setHasExpired] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const expiredHandledRef = useRef<boolean>(false);

  // Sync when initial duration changes
  useEffect(() => {
    setSecondsLeft(initialRemainingSeconds !== undefined ? initialRemainingSeconds : totalSeconds);
    setHasExpired(false);
    expiredHandledRef.current = false;
  }, [totalSeconds, initialRemainingSeconds]);

  // Main countdown interval
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (!expiredHandledRef.current) {
            expiredHandledRef.current = true;
            setHasExpired(true);
            // Trigger auto-submit callback on next tick
            setTimeout(() => {
              onTimeExpired();
            }, 0);
          }
          if (onTick) onTick(0);
          return 0;
        }

        const next = prev - 1;
        if (onTick) onTick(next);
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, onTimeExpired, onTick]);

  // Percentage for progress ring/bar
  const percentage = Math.max(0, Math.min(100, (secondsLeft / Math.max(1, totalSeconds)) * 100));
  const isUrgent = isExamMode && secondsLeft <= 60 && secondsLeft > 0;
  const isWarning = isExamMode && secondsLeft <= 180 && secondsLeft > 60;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Color thematic classes
  let statusColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40';
  let badgeColor = 'bg-emerald-500';
  let labelText = 'Time Remaining';

  if (isUrgent) {
    statusColor = 'text-rose-400 border-rose-500/70 bg-rose-950/60 shadow-lg shadow-rose-900/40 ring-2 ring-rose-500/50 animate-pulse';
    badgeColor = 'bg-rose-500';
    labelText = 'Urgent: Auto-Submitting Soon';
  } else if (isWarning) {
    statusColor = 'text-amber-300 border-amber-500/50 bg-amber-950/50 shadow-xs shadow-amber-900/30';
    badgeColor = 'bg-amber-400';
    labelText = 'Time Running Down';
  }

  // Circular progress calculation
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`flex flex-col items-end ${className}`}>
      <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl border transition-all duration-300 ${statusColor}`}>
        {/* Mini SVG circular progress ring */}
        <div className="relative w-7 h-7 shrink-0 flex items-center justify-center">
          <svg className="w-7 h-7 -rotate-90 transform" viewBox="0 0 40 40">
            {/* Background circle */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              className="text-slate-700/60"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="20"
              cy="20"
              r={radius}
              className={`transition-all duration-1000 ease-linear ${
                isUrgent ? 'text-rose-500' : isWarning ? 'text-amber-400' : 'text-emerald-400'
              }`}
              strokeWidth="3.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isUrgent ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <Clock className="w-3.5 h-3.5 text-slate-300" />
            )}
          </div>
        </div>

        {/* Text countdown */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5 font-mono text-base font-black tracking-wider text-white">
            <span>{formattedTime}</span>
            {isExamMode && (
              <span className="text-[10px] uppercase font-sans font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Auto-Submit
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium text-slate-400">
            {isUrgent ? (
              <span className="text-rose-300 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                Final Minute!
              </span>
            ) : (
              labelText
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
