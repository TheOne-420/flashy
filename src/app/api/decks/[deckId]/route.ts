import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { deck, card } from "@/db/schema";
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
      with: {
        cards: {
          with: {
            progress: true,
          },
        },
      },
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    return NextResponse.json({ deck: userDeck });
  } catch (error) {
    console.error("Get deck error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
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
    const { name, description, color, isPublic } = body;

    const existingDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const updatedDeck = await db
      .update(deck)
      .set({
        name: name?.trim() || existingDeck.name,
        description:
          description !== undefined
            ? description?.trim() || null
            : existingDeck.description,
        color: color || existingDeck.color,
        isPublic:
          isPublic !== undefined ? isPublic : existingDeck.isPublic,
      })
      .where(and(eq(deck.id, deckId), eq(deck.userId, session.user.id)))
      .returning();

    return NextResponse.json({ deck: updatedDeck[0] });
  } catch (error) {
    console.error("Update deck error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    const existingDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!existingDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    await db
      .delete(deck)
      .where(and(eq(deck.id, deckId), eq(deck.userId, session.user.id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deck error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
