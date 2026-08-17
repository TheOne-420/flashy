import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { deck, user } from "@/db/schema";
import { eq, and, like, sql, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search")?.trim() || "";
    const offset = (page - 1) * limit;

    const conditions = [eq(deck.isPublic, true)];

    if (search) {
      conditions.push(like(deck.name, `%${search}%`));
    }

    const whereClause = and(...conditions);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(deck)
      .where(whereClause);

    const total = Number(count);
    const totalPages = Math.ceil(total / limit);

    const rows = await db
      .select({
        id: deck.id,
        name: deck.name,
        description: deck.description,
        color: deck.color,
        forkCount: deck.forkCount,
        createdAt: deck.createdAt,
        authorName: user.name,
        authorImage: user.image,
      })
      .from(deck)
      .innerJoin(user, eq(deck.userId, user.id))
      .where(whereClause)
      .orderBy(desc(deck.forkCount), desc(deck.createdAt))
      .limit(limit)
      .offset(offset);

    const decks = rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      color: row.color,
      cardCount: 0,
      forkCount: row.forkCount,
      authorName: row.authorName,
      authorImage: row.authorImage,
      createdAt: row.createdAt,
    }));

    return NextResponse.json({ decks, total, page, totalPages });
  } catch (error) {
    console.error("Marketplace error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
