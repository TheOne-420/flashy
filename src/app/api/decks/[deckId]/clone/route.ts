import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { deck, card } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

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

    const sourceDeck = await db.query.deck.findFirst({
      where: eq(deck.id, deckId),
      with: {
        cards: true,
      },
    });

    if (!sourceDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (!sourceDeck.isPublic && sourceDeck.userId !== session.user.id) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const cloned = (await db
      .insert(deck)
      .values({
        name: sourceDeck.name,
        description: sourceDeck.description,
        color: sourceDeck.color,
        userId: session.user.id,
        originalDeckId: sourceDeck.id,
      })
      .returning()) as typeof deck.$inferSelect[];

    const clonedDeck = cloned[0];

    if (sourceDeck.cards.length > 0) {
      const cardValues = (sourceDeck.cards as any[]).map((c: any) => ({
        deckId: clonedDeck.id,
        front: c.front,
        back: c.back,
        hint: c.hint,
        color: c.color,
        starred: 0,
      }));

      await db.insert(card).values(cardValues);
    }

    await db
      .update(deck)
      .set({ forkCount: sql`fork_count + 1` })
      .where(eq(deck.id, deckId));

    return NextResponse.json({ deck: clonedDeck }, { status: 201 });
  } catch (error) {
    console.error("Clone deck error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
