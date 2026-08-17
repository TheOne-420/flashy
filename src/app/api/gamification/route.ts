import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { userStats, studySession, userAchievement, card, cardProgress } from "@/db/schema";
import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";
import { checkAchievements } from "@/lib/achievements";

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

    let cardsPerDay: { date: string; count: number }[] = [];
    let forecast: { date: string; count: number }[] = [];
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const raw = await db
        .select({
          date: sql<string>`DATE(completed_at)`,
          count: sql<number>`COALESCE(SUM(cards_reviewed), 0)`,
        })
        .from(studySession)
        .where(
          and(
            eq(studySession.userId, session.user.id),
            gte(studySession.completedAt, sevenDaysAgo),
          ),
        )
        .groupBy(sql`DATE(completed_at)`)
        .orderBy(sql`DATE(completed_at)`);

      const dayMap = new Map(raw.map((r) => [r.date, r.count]));
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        cardsPerDay.push({ date: key, count: dayMap.get(key) || 0 });
      }
    } catch {
      // chart data non-critical
    }

    try {
      const userDecks = await db.query.deck.findMany({
        where: (deck, { eq }) => eq(deck.userId, session.user.id),
        columns: { id: true },
      });
      const deckIds = userDecks.map((d) => d.id);

      if (deckIds.length > 0) {
        const now = new Date();
        const thirtyDays = new Date();
        thirtyDays.setDate(thirtyDays.getDate() + 30);

        const dueRows = await db
          .select({
            date: sql<string>`DATE(next_review_at)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(cardProgress)
          .innerJoin(card, eq(cardProgress.cardId, card.id))
          .where(
            and(
              sql`${card.deckId} IN (${sql.join(deckIds.map((id) => sql`${id}`), sql`, `)})`,
              gte(cardProgress.nextReviewAt, now),
              lte(cardProgress.nextReviewAt, thirtyDays),
            ),
          )
          .groupBy(sql`DATE(next_review_at)`)
          .orderBy(sql`DATE(next_review_at)`)
          .limit(14);

        const dueMap = new Map(dueRows.map((r) => [r.date, r.count]));
        for (let i = 0; i < 7; i++) {
          const d = new Date();
          d.setDate(d.getDate() + i);
          const key = d.toISOString().slice(0, 10);
          forecast.push({ date: key, count: dueMap.get(key) || 0 });
        }
      }
    } catch {
      // forecast data non-critical
    }

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
        nextLevelXp: 1000,
        cardsPerDay,
        forecast,
      });
    }

    const dailyProgress = shouldReset ? 0 : stats.dailyProgress;
    const goalCompleted = dailyProgress >= stats.dailyGoal;
    const nextLevelXp = (stats.level) * 1000;

    return NextResponse.json({
      xp: stats.xp,
      level: stats.level,
      currentStreak: stats.currentStreak,
      longestStreak: stats.longestStreak,
      totalCardsReviewed: stats.totalCardsReviewed,
      dailyGoal: stats.dailyGoal,
      dailyProgress: shouldReset ? 0 : stats.dailyProgress,
      goalCompleted,
      nextLevelXp,
      cardsPerDay,
      forecast,
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
        const newTotalReviewed = existing.totalCardsReviewed + (cardsReviewed || 0);
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
            totalCardsReviewed: newTotalReviewed,
            lastStudyDate: new Date(),
            dailyProgress: updatedDailyProgress,
            lastDailyReset: shouldReset ? new Date() : existing.lastDailyReset,
          })
          .where(eq(userStats.userId, userId));

        const existingAchievements = await db
          .select({ type: userAchievement.type })
          .from(userAchievement)
          .where(eq(userAchievement.userId, userId));
        const unlockedIds = existingAchievements.map((a) => a.type);
        const newlyUnlocked = checkAchievements(
          { totalCardsReviewed: newTotalReviewed, currentStreak: newStreak, level: newLevel, xp: newXp },
          unlockedIds,
        );

        if (newlyUnlocked.length > 0) {
          await db.insert(userAchievement).values(
            newlyUnlocked.map((a) => ({ userId, type: a.id })),
          );
        }

        return NextResponse.json({
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          cardsReviewed: newTotalReviewed,
          dailyProgress: updatedDailyProgress,
          dailyGoal: existing.dailyGoal,
          goalCompleted,
          newAchievements: newlyUnlocked.map((a) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon })),
        });
      } else {
        const newStreak = 1;
        const newTotalReviewed = cardsReviewed || 0;
        await db.insert(userStats).values({
          userId,
          xp: xpEarned || 0,
          level: 1,
          totalCardsReviewed: newTotalReviewed,
          currentStreak: newStreak,
          longestStreak: newStreak,
          lastStudyDate: new Date(),
          dailyGoal: 20,
          dailyProgress: newTotalReviewed,
          lastDailyReset: new Date(),
        });

        const goalCompleted = newTotalReviewed >= 20;
        const newlyUnlocked = checkAchievements(
          { totalCardsReviewed: newTotalReviewed, currentStreak: newStreak, level: 1, xp: xpEarned || 0 },
          [],
        );

        if (newlyUnlocked.length > 0) {
          await db.insert(userAchievement).values(
            newlyUnlocked.map((a) => ({ userId, type: a.id })),
          );
        }

        return NextResponse.json({
          xp: xpEarned || 0,
          level: 1,
          streak: newStreak,
          cardsReviewed: newTotalReviewed,
          dailyProgress: newTotalReviewed,
          dailyGoal: 20,
          goalCompleted,
          newAchievements: newlyUnlocked.map((a) => ({ id: a.id, name: a.name, description: a.description, icon: a.icon })),
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating gamification:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
