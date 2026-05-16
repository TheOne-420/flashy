import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { card, deck } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; cardId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId, cardId } = await params;
    const body = await request.json();
    const { front, back, starred } = body;

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const existingCard = await db.query.card.findFirst({
      where: and(eq(card.id, cardId), eq(card.deckId, deckId)),
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    const updatedCard = await db
      .update(card)
      .set({
        front: front?.trim() ?? existingCard.front,
        back: back?.trim() ?? existingCard.back,
        starred:
          starred !== undefined ? (starred ? 1 : 0) : existingCard.starred,
      })
      .where(eq(card.id, cardId))
      .returning();

    return NextResponse.json({ card: updatedCard[0] });
  } catch (error) {
    console.error("Update card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ deckId: string; cardId: string }> },
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { deckId, cardId } = await params;

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const existingCard = await db.query.card.findFirst({
      where: and(eq(card.id, cardId), eq(card.deckId, deckId)),
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    await db.delete(card).where(eq(card.id, cardId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
