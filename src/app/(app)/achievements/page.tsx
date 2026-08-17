"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Lock, Trophy } from "lucide-react";

interface AchievementItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  max: number;
}

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/achievements");
        if (res.ok) {
          const data = await res.json();
          setAchievements(data.achievements || []);
          setUnlockedCount(data.unlockedCount || 0);
          setTotalCount(data.totalCount || 0);
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
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
        </div>

        <div className="mb-8 text-center">
          <Trophy className="mx-auto h-12 w-12 text-amber-500" />
          <h1 className="mt-3 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Achievements
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {unlockedCount} / {totalCount} unlocked
          </p>
          {totalCount > 0 && (
            <div className="mx-auto mt-3 h-2 w-48 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                style={{
                  width: `${(unlockedCount / totalCount) * 100}%`,
                }}
              />
            </div>
          )}
        </div>

        <div className="space-y-3">
          {achievements.map((a) => (
            <div
              key={a.id}
              className={`rounded-xl border p-4 transition-colors ${
                a.unlocked
                  ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20"
                  : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl ${
                    a.unlocked
                      ? "bg-amber-100 dark:bg-amber-900/40"
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                >
                  {a.unlocked ? a.icon : <Lock className="h-5 w-5 text-zinc-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold ${
                        a.unlocked
                          ? "text-amber-800 dark:text-amber-300"
                          : "text-zinc-700 dark:text-zinc-300"
                      }`}
                    >
                      {a.name}
                    </p>
                    {a.unlocked && (
                      <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-800 dark:text-amber-200">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {a.description}
                  </p>
                  {a.max > 1 && (
                    <div className="mt-2 h-1.5 w-full max-w-40 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                      <div
                        className={`h-full rounded-full transition-all ${
                          a.unlocked
                            ? "bg-amber-500"
                            : "bg-violet-400 dark:bg-violet-600"
                        }`}
                        style={{
                          width: `${Math.min((a.progress / a.max) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  )}
                  {a.max > 1 && !a.unlocked && (
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {a.progress} / {a.max}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
