import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { deck } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDecks = await db.query.deck.findMany({
      where: eq(deck.userId, session.user.id),
      with: {
        cards: {
          with: {
            progress: true,
          },
        },
      },
    });

    return NextResponse.json({ decks: userDecks });
  } catch (error) {
    console.error("Get decks error:", error);
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
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Deck name is required" },
        { status: 400 },
      );
    }

    const newDeck = await db
      .insert(deck)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        userId: session.user.id,
      })
      .returning();

    return NextResponse.json({ deck: (newDeck as any[])[0] }, { status: 201 });
  } catch (error) {
    console.error("Create deck error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
