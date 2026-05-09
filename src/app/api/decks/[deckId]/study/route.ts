import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { card, deck, cardProgress } from "@/db/schema";
import { eq, and, lte, or, isNull } from "drizzle-orm";
import { calculateSRS, getNewCardSRS } from "@/lib/srs";
import type { ReviewQuality } from "@/types/flashcard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;
    const now = new Date();

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const dueCards = await db.query.card.findMany({
      where: eq(card.deckId, deckId),
      with: {
        progress: true,
      },
    });

    const studyCards = dueCards.filter((c) => {
      if (!c.progress) return true;
      return new Date(c.progress.nextReviewAt) <= now;
    });

    return NextResponse.json({
      dueCards: studyCards,
      totalDue: studyCards.length,
    });
  } catch (error) {
    console.error("Get study session error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId } = await params;
    const body = await request.json();
    const { cardId, quality } = body as {
      cardId: string;
      quality: ReviewQuality;
    };

    if (!cardId || quality === undefined) {
      return NextResponse.json(
        { error: "Card ID and quality are required" },
        { status: 400 },
      );
    }

    if (quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be between 0 and 5" },
        { status: 400 },
      );
    }

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const targetCard = await db.query.card.findFirst({
      where: and(eq(card.id, cardId), eq(card.deckId, deckId)),
      with: {
        progress: true,
      },
    });

    if (!targetCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const existingProgress = targetCard.progress;
    let newProgress;

    if (existingProgress) {
      const srsResult = calculateSRS(
        quality,
        existingProgress.easeFactor,
        existingProgress.interval,
        existingProgress.repetitions,
      );

      newProgress = await db
        .update(cardProgress)
        .set({
          easeFactor: srsResult.easeFactor,
          interval: srsResult.interval,
          repetitions: srsResult.repetitions,
          nextReviewAt: srsResult.nextReviewAt,
          lastReviewedAt: new Date(),
        })
        .where(eq(cardProgress.id, existingProgress.id))
        .returning();
    } else {
      const srsResult = calculateSRS(quality, 2.5, 0, 0);

      newProgress = await db
        .insert(cardProgress)
        .values({
          cardId,
          easeFactor: srsResult.easeFactor,
          interval: srsResult.interval,
          repetitions: srsResult.repetitions,
          nextReviewAt: srsResult.nextReviewAt,
          lastReviewedAt: new Date(),
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      progress: newProgress[0],
      quality,
    });
  } catch (error) {
    console.error("Review card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
