"use client";

import { useEffect, useState } from "react";
import { Clock, Zap } from "lucide-react";

interface SessionTimerProps {
  onComplete?: () => void;
  limitSeconds?: number;
}

export function SessionTimer({
  onComplete,
  limitSeconds = 300,
}: SessionTimerProps) {
  const [seconds, setSeconds] = useState(limitSeconds);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    if (seconds <= 0) {
      onComplete?.();
      return;
    }
    const timer = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [seconds, isPaused, onComplete]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((limitSeconds - seconds) / limitSeconds) * 100;

  return (
    <div className="flex items-center gap-3 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
      <Clock className="h-4 w-4 text-zinc-500" />
      <div className="relative h-2 w-24 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-1000"
          style={{ width: `${100 - progress}%` }}
        />
      </div>
      <span className="min-w-12 font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {mins}:{secs.toString().padStart(2, "0")}
      </span>
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="text-xs text-zinc-400 hover:text-zinc-600"
      >
        {isPaused ? "▶" : "⏸"}
      </button>
    </div>
  );
}

export function XPDisplay({
  xp = 0,
  streak = 0,
}: {
  xp?: number;
  streak?: number;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 dark:bg-amber-950/30">
        <Zap className="h-4 w-4 text-amber-500" />
        <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
          {xp.toLocaleString()} XP
        </span>
      </div>
      {streak > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 dark:bg-orange-950/30">
          <span className="text-lg">🔥</span>
          <span className="font-mono text-sm font-bold text-orange-600 dark:text-orange-400">
            {streak}
          </span>
        </div>
      )}
    </div>
  );
}
