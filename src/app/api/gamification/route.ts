import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { userStats } from "@/db/schema/gamification.sql";
import { eq } from "drizzle-orm";

function resetDailyIfNeeded(lastReset: Date | null): {
  shouldReset: boolean;
  newProgress: number;
} {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastReset) return { shouldReset: true, newProgress: 0 };

  const resetDate = new Date(lastReset);
  resetDate.setHours(0, 0, 0, 0);

  if (resetDate < today) {
    return { shouldReset: true, newProgress: 0 };
  }
  return { shouldReset: false, newProgress: -1 };
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await db.query.userStats.findFirst({
      where: (stats, { eq }) => eq(stats.userId, session.user.id),
    });

    const { shouldReset, newProgress } = resetDailyIfNeeded(
      stats?.lastDailyReset ?? null,
    );

    if (!stats) {
      return NextResponse.json({
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalCardsReviewed: 0,
        dailyGoal: 20,
        dailyProgress: 0,
        goalCompleted: false,
      });
    }

    const dailyProgress = shouldReset ? 0 : stats.dailyProgress;
    const goalCompleted = dailyProgress >= stats.dailyGoal;

    return NextResponse.json({
      xp: stats.xp,
      level: stats.level,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCardsReviewed: stats.totalCardsReviewed,
      dailyGoal: stats.dailyGoal,
      dailyProgress: shouldReset ? 0 : stats.dailyProgress,
      goalCompleted,
    });
  } catch (error) {
    console.error("Error fetching gamification stats:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: new Headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, xpEarned, cardsReviewed, dailyGoal } = await request.json();
    const userId = session.user.id;

    if (action === "setGoal") {
      await db
        .update(userStats)
        .set({ dailyGoal: dailyGoal || 20 })
        .where(eq(userStats.userId, userId));
      return NextResponse.json({ success: true });
    }

    if (action === "review") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existing = await db.query.userStats.findFirst({
        where: (stats, { eq }) => eq(stats.userId, userId),
      });

      const { shouldReset, newProgress } = resetDailyIfNeeded(
        existing?.lastDailyReset ?? null,
      );

      if (existing) {
        const lastStudy = existing.lastStudyDate
          ? new Date(existing.lastStudyDate)
          : null;
        let newStreak = existing.currentStreak;

        if (lastStudy) {
          const lastStudyDay = new Date(lastStudy);
          lastStudyDay.setHours(0, 0, 0, 0);
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          if (lastStudyDay.getTime() === today.getTime()) {
            // Same day, no streak change
          } else if (lastStudyDay.getTime() === yesterday.getTime()) {
            newStreak += 1;
          } else {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        const newXp = existing.xp + (xpEarned || 0);
        const newLevel = Math.floor(newXp / 1000) + 1;
        const updatedDailyProgress = shouldReset
          ? cardsReviewed || 0
          : existing.dailyProgress + (cardsReviewed || 0);
        const goalCompleted = updatedDailyProgress >= existing.dailyGoal;

        await db
          .update(userStats)
          .set({
            xp: newXp,
            level: newLevel,
            currentStreak: newStreak,
            longestStreak: Math.max(existing.longestStreak, newStreak),
            totalCardsReviewed:
              existing.totalCardsReviewed + (cardsReviewed || 0),
            lastStudyDate: new Date(),
            dailyProgress: updatedDailyProgress,
            lastDailyReset: shouldReset ? new Date() : existing.lastDailyReset,
          })
          .where(eq(userStats.userId, userId));

        return NextResponse.json({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          cardsReviewed: existing.totalCardsReviewed + (cardsReviewed || 0),
          dailyProgress: updatedDailyProgress,
          dailyGoal: existing.dailyGoal,
          goalCompleted,
        });
      } else {
        const newStreak = 1;
        await db.insert(userStats).values({
          userId,
          xp: xpEarned || 0,
          level: 1,
          totalCardsReviewed: cardsReviewed || 0,
          currentStreak: newStreak,
          longestStreak: newStreak,
          lastStudyDate: new Date(),
          dailyGoal: 20,
          dailyProgress: cardsReviewed || 0,
          lastDailyReset: new Date(),
        });

        const goalCompleted = (cardsReviewed || 0) >= 20;
        return NextResponse.json({
          xp: xpEarned || 0,
          level: 1,
          streak: newStreak,
          cardsReviewed: cardsReviewed || 0,
          dailyProgress: cardsReviewed || 0,
          dailyGoal: 20,
          goalCompleted,
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating gamification:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
