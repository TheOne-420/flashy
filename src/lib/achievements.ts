export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: {
    totalCardsReviewed: number;
    currentStreak: number;
    accuracy: number;
    level: number;
    xp: number;
  }) => { unlocked: boolean; progress?: number; max?: number };
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_review",
    name: "First Steps",
    description: "Review your first card",
    icon: "🌟",
    check: (s) => ({ unlocked: s.totalCardsReviewed >= 1, progress: Math.min(s.totalCardsReviewed, 1), max: 1 }),
  },
  {
    id: "cards_100",
    name: "Dedicated Learner",
    description: "Review 100 cards total",
    icon: "📚",
    check: (s) => ({ unlocked: s.totalCardsReviewed >= 100, progress: Math.min(s.totalCardsReviewed, 100), max: 100 }),
  },
  {
    id: "cards_1000",
    name: "Card Master",
    description: "Review 1,000 cards total",
    icon: "🏆",
    check: (s) => ({ unlocked: s.totalCardsReviewed >= 1000, progress: Math.min(s.totalCardsReviewed, 1000), max: 1000 }),
  },
  {
    id: "streak_7",
    name: "Week Warrior",
    description: "Study 7 days in a row",
    icon: "🔥",
    check: (s) => ({ unlocked: s.currentStreak >= 7, progress: Math.min(s.currentStreak, 7), max: 7 }),
  },
  {
    id: "streak_30",
    name: "Monthly Dedication",
    description: "Study 30 days in a row",
    icon: "💪",
    check: (s) => ({ unlocked: s.currentStreak >= 30, progress: Math.min(s.currentStreak, 30), max: 30 }),
  },
  {
    id: "level_5",
    name: "Rising Star",
    description: "Reach level 5",
    icon: "⭐",
    check: (s) => ({ unlocked: s.level >= 5, progress: Math.min(s.level, 5), max: 5 }),
  },
  {
    id: "level_10",
    name: "Flashcard Pro",
    description: "Reach level 10",
    icon: "👑",
    check: (s) => ({ unlocked: s.level >= 10, progress: Math.min(s.level, 10), max: 10 }),
  },
  {
    id: "perfect_session",
    name: "Perfect Score",
    description: "Complete a session with 100% accuracy",
    icon: "🎯",
    check: (s) => ({ unlocked: false }),
  },
];

export function checkAchievements(
  stats: { totalCardsReviewed: number; currentStreak: number; level: number; xp: number },
  existingUnlocked: string[],
): Achievement[] {
  return ACHIEVEMENTS.filter(
    (a) =>
      !existingUnlocked.includes(a.id) &&
      a.check({ ...stats, accuracy: 0 }).unlocked,
  );
}
