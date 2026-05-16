import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import db from "@/db";
import { card, deck, cardProgress } from "@/db/schema";
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
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") as
      | "test"
      | "learn"
      | "starred"
      | null;

    const userDeck = await db.query.deck.findFirst({
      where: and(eq(deck.id, deckId), eq(deck.userId, session.user.id)),
    });

    if (!userDeck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    let cards = await db.query.card.findMany({
      where: eq(card.deckId, deckId),
      with: {
        progress: true,
      },
    });

    if (mode === "starred") {
      cards = cards.filter((c) => c.starred === 1);
    }

    if (mode === "learn") {
      const missed = cards.filter(
        (c) => c.progress && c.progress.repetitions < 3,
      );
      if (missed.length > 0) {
        cards = missed;
      }
    }

    cards = cards.sort(() => Math.random() - 0.5).slice(0, 20);

    const questions = cards.map((c) => ({
      id: c.id,
      question: c.front,
      answer: c.back,
      options: getRandomOptions(c.back, cards),
    }));

    return NextResponse.json({ questions, total: questions.length });
  } catch (error) {
    console.error("Test generation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

function getRandomOptions(correct: string, cards: any[]) {
  const others = cards.filter((c) => c.back !== correct).map((c) => c.back);
  const shuffled = others.sort(() => Math.random() - 0.5).slice(0, 3);
  const options = [...shuffled, correct].sort(() => Math.random() - 0.5);
  return options;
}
