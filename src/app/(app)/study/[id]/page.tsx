"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { FlashCard, ReviewButtons } from "@/components/study/FlashCard";
import type { CardWithProgress, ReviewQuality } from "@/types/flashcard";

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStudySession();
  }, [deckId]);

  const fetchStudySession = async () => {
    try {
      const res = await fetch(`/api/decks/${deckId}/study`);
      if (res.ok) {
        const data = await res.json();
        setCards(data.dueCards || []);
      } else {
        router.push(`/deck/${deckId}`);
      }
    } catch (error) {
      console.error("Failed to fetch study session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = async (quality: ReviewQuality) => {
    const currentCard = cards[currentIndex];
    if (!currentCard) return;

    await fetch(`/api/decks/${deckId}/study`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: currentCard.id,
        quality,
      }),
    });

    setCompletedCount((prev) => prev + 1);
    setIsFlipped(false);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCards((prev) => prev.slice(1));
      setCurrentIndex(0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-4">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          All Done!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          You've completed all cards for this session.
        </p>
        <button
          onClick={() => router.push(`/deck/${deckId}`)}
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Back to Deck
        </button>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mb-8 flex w-full max-w-lg items-center justify-between">
        <button
          onClick={() => router.push(`/deck/${deckId}`)}
          className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit
        </button>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {currentIndex + 1} / {cards.length}
        </div>
      </div>

      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center">
        <FlashCard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />

        {isFlipped && <ReviewButtons onReview={handleReview} />}

        {!isFlipped && (
          <p className="mt-8 text-sm text-zinc-400 dark:text-zinc-500">
            Click card to reveal answer
          </p>
        )}
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          {completedCount} completed
        </div>
        <span className="mx-2">|</span>
        <div className="flex items-center gap-1">
          <XCircle className="h-4 w-4 text-amber-500" />
          {cards.length - currentIndex} remaining
        </div>
      </div>
    </div>
  );
}
