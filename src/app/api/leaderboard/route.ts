import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { userStats, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));

    const rows = await db
      .select({
        userId: userStats.userId,
        name: user.name,
        image: user.image,
        xp: userStats.xp,
        level: userStats.level,
        currentStreak: userStats.currentStreak,
        totalCardsReviewed: userStats.totalCardsReviewed,
      })
      .from(userStats)
      .innerJoin(user, eq(userStats.userId, user.id))
      .orderBy(desc(userStats.xp))
      .limit(limit);

    const entries = rows.map((row, index) => ({
      rank: index + 1,
      ...row,
    }));

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
