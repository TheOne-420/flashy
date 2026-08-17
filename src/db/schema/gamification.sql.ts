import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  timestamp,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth.sql";
import { timestamps } from "./timestamps.helper";

export const userStats = pgTable(
  "user_stats",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" })
      .unique(),
    xp: integer("xp").default(0).notNull(),
    level: integer("level").default(1).notNull(),
    totalCardsReviewed: integer("total_cards_reviewed").default(0).notNull(),
    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastStudyDate: timestamp("last_study_date"),
    dailyGoal: integer("daily_goal").default(20).notNull(),
    dailyProgress: integer("daily_progress").default(0).notNull(),
    lastDailyReset: timestamp("last_daily_reset").defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [index("userStats_userId_idx").on(table.userId)],
);

export const userAchievement = pgTable(
  "user_achievement",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
  },
  (table) => [index("userAchievement_userId_idx").on(table.userId)],
);

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(user, {
    fields: [userStats.userId],
    references: [user.id],
  }),
}));

export const userAchievementRelations = relations(
  userAchievement,
  ({ one }) => ({
    user: one(user, {
      fields: [userAchievement.userId],
      references: [user.id],
    }),
  }),
);
