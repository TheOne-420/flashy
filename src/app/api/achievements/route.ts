import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { userAchievement, userStats } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ACHIEVEMENTS } from "@/lib/achievements";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: new Headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const achievements = await db
      .select({ type: userAchievement.type, unlockedAt: userAchievement.unlockedAt })
      .from(userAchievement)
      .where(eq(userAchievement.userId, session.user.id));

    const unlockedSet = new Set(achievements.map((a) => a.type));
    const unlockedMap = new Map(achievements.map((a) => [a.type, a.unlockedAt]));

    const stats = await db.query.userStats.findFirst({
      where: (s, { eq }) => eq(s.userId, session.user.id),
    });

    const statsData = {
      totalCardsReviewed: stats?.totalCardsReviewed ?? 0,
      currentStreak: stats?.currentStreak ?? 0,
      level: stats?.level ?? 1,
      xp: stats?.xp ?? 0,
      accuracy: 0,
    };

    const allAchievements = ACHIEVEMENTS.map((a) => {
      const result = a.check(statsData);
      return {
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        unlocked: unlockedSet.has(a.id),
        unlockedAt: unlockedMap.get(a.id) || null,
        progress: result.progress ?? 0,
        max: result.max ?? 1,
      };
    });

    return NextResponse.json({
      achievements: allAchievements,
      unlockedCount: achievements.length,
      totalCount: ACHIEVEMENTS.length,
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
