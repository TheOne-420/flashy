import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { studySession, deck } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "10"), 50);

    const sessions = await db
      .select({
        id: studySession.id,
        userId: studySession.userId,
        deckId: studySession.deckId,
        deckName: deck.name,
        cardsReviewed: studySession.cardsReviewed,
        xpEarned: studySession.xpEarned,
        accuracy: studySession.accuracy,
        duration: studySession.duration,
        completedAt: studySession.completedAt,
      })
      .from(studySession)
      .innerJoin(deck, eq(studySession.deckId, deck.id))
      .where(eq(studySession.userId, session.user.id))
      .orderBy(desc(studySession.completedAt))
      .limit(limit);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Error fetching study history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { deckId, cardsReviewed, xpEarned, accuracy, duration } = body;

    if (!deckId || cardsReviewed === undefined) {
      return NextResponse.json(
        { error: "Deck ID and cardsReviewed are required" },
        { status: 400 },
      );
    }

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const [created] = await db
      .insert(studySession)
      .values({
        userId: session.user.id,
        deckId,
        cardsReviewed: cardsReviewed || 0,
        xpEarned: xpEarned || 0,
        accuracy: accuracy ?? (cardsReviewed > 0 ? 100 : 0),
        duration: duration || 0,
      })
      .returning();

    return NextResponse.json({ session: created });
  } catch (error) {
    console.error("Error logging study session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
