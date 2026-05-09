import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { card, deck } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const deckCards = await db.query.card.findMany({
      where: eq(card.deckId, deckId),
      with: {
        progress: true,
      },
    });

    return NextResponse.json({ cards: deckCards });
  } catch (error) {
    console.error("Get cards error:", error);
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
    const { front, back, cards } = body;

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (cards && Array.isArray(cards)) {
      const newCards = await db
        .insert(card)
        .values(
          cards.map((c: { front: string; back: string }) => ({
            deckId,
            front: c.front,
            back: c.back,
          })),
        )
        .returning();
      return NextResponse.json({ cards: newCards }, { status: 201 });
    }

    if (!front || !back) {
      return NextResponse.json(
        { error: "Front and back content are required" },
        { status: 400 },
      );
    }

    const newCard = await db
      .insert(card)
      .values({
        deckId,
        front: front.trim(),
        back: back.trim(),
      })
      .returning();

    return NextResponse.json({ card: newCard[0] }, { status: 201 });
  } catch (error) {
    console.error("Create card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
