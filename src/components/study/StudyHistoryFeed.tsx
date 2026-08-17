"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock, Zap, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface StudySessionRecord {
  id: string;
  deckId: string;
  deckName: string;
  cardsReviewed: number;
  xpEarned: number;
  accuracy: number;
  duration: number;
  completedAt: string;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function StudyHistoryFeed() {
  const router = useRouter();
  const [sessions, setSessions] = useState<StudySessionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/study-history?limit=7");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
        <Clock className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          No study sessions yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sessions.map((s) => (
        <button
          key={s.id}
          onClick={() => router.push(`/deck/${s.deckId}`)}
          className="flex w-full items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
            <Zap className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {s.deckName}
            </p>
            <p className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
              <span>{s.cardsReviewed} cards</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-emerald-500" />
                {Math.round(s.accuracy)}%
              </span>
              {s.xpEarned > 0 && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Zap className="h-3 w-3" />+{s.xpEarned}
                  </span>
                </>
              )}
            </p>
          </div>
          <span className="shrink-0 text-xs text-zinc-400">
            {timeAgo(s.completedAt)}
          </span>
        </button>
      ))}
    </div>
  );
}
