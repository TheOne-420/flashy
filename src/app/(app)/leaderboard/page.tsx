"use client";

import { useState, useEffect, useCallback } from "react";
import { Trophy, RefreshCw, Medal, Star, Flame, BookOpen } from "lucide-react";
import type { LeaderboardEntry } from "@/types/flashcard";

const RANK_STYLES = [
  { bg: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Medal },
  { bg: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400", icon: Medal },
  { bg: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: Medal },
];

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leaderboard?limit=50");
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            <Trophy className="h-7 w-7 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Top users ranked by total XP
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : entries.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <Trophy className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
              No data yet
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              Start studying to earn XP and climb the ranks!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    User
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    Level
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400">
                    XP
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400 sm:table-cell">
                    Streak
                  </th>
                  <th className="hidden px-4 py-3 text-right text-xs font-medium uppercase text-zinc-500 dark:text-zinc-400 md:table-cell">
                    Cards
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {entries.map((entry) => {
                  const rankStyle = entry.rank <= 3 ? RANK_STYLES[entry.rank - 1] : null;
                  const RankIcon = rankStyle?.icon || Medal;

                  return (
                    <tr
                      key={entry.userId}
                      className="bg-white transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-4 py-4">
                        {entry.rank <= 3 ? (
                          <span
                            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${rankStyle?.bg}`}
                          >
                            {entry.rank}
                          </span>
                        ) : (
                          <span className="text-sm text-zinc-500 dark:text-zinc-400">
                            {entry.rank}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {entry.image ? (
                            <img
                              src={entry.image}
                              alt=""
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-sm font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                              {entry.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {entry.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                          <Star className="h-3 w-3" />
                          {entry.level}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-zinc-900 dark:text-zinc-100">
                        {entry.xp.toLocaleString()}
                      </td>
                      <td className="hidden px-4 py-4 text-right sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-sm text-orange-600 dark:text-orange-400">
                          <Flame className="h-3.5 w-3.5" />
                          {entry.currentStreak}
                        </span>
                      </td>
                      <td className="hidden px-4 py-4 text-right text-sm text-zinc-500 dark:text-zinc-400 md:table-cell">
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          {entry.totalCardsReviewed.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
