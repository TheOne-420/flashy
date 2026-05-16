"use client";

import { useEffect, useState, useCallback } from "react";

interface GamificationStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalCardsReviewed: number;
  dailyGoal: number;
  dailyProgress: number;
  goalCompleted: boolean;
}

export function useGamification() {
  const [stats, setStats] = useState<GamificationStats>({
    xp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalCardsReviewed: 0,
    dailyGoal: 20,
    dailyProgress: 0,
    goalCompleted: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [fetched, setFetched] = useState(false);

  const fetchStats = useCallback(async () => {
    if (fetched) return;
    try {
      const res = await fetch("/api/gamification");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setFetched(true);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [fetched]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStats();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchStats]);

  const addXP = useCallback(
    async (amount: number, cardsCount: number = 1) => {
      try {
        const res = await fetch("/api/gamification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "review",
            xpEarned: amount,
            cardsReviewed: cardsCount,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setStats({
            xp: data.xp,
            level: data.level,
            currentStreak: data.streak,
            longestStreak: Math.max(stats.longestStreak, data.streak),
            totalCardsReviewed: data.cardsReviewed,
            dailyGoal: data.dailyGoal,
            dailyProgress: data.dailyProgress,
            goalCompleted: data.goalCompleted,
          });
          return data;
        }
      } catch (error) {
        console.error("Failed to update XP:", error);
      }
      return null;
    },
    [stats.longestStreak],
  );

  return { ...stats, isLoading, addXP, refresh: fetchStats };
}

export function getWeakSpots(
  cards: { progress: { easeFactor: number } | null }[],
) {
  return cards.filter((c) => c.progress && c.progress.easeFactor < 2.5);
}

export function getDueCount(
  cards: { progress: { nextReviewAt: Date | string } | null }[],
) {
  const now = new Date();
  return cards.filter(
    (c) => !c.progress || new Date(c.progress.nextReviewAt) <= now,
  ).length;
}
