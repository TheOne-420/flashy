import type { ReviewQuality, SRSResult } from "@/types/flashcard";

const MIN_EASE_FACTOR = 1.3;
const INITIAL_EASE_FACTOR = 2.5;

export function calculateSRS(
  quality: ReviewQuality,
  currentEaseFactor: number,
  currentInterval: number,
  currentRepetitions: number,
): SRSResult {
  let newEaseFactor = currentEaseFactor;
  let newInterval = currentInterval;
  let newRepetitions = currentRepetitions;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentInterval * currentEaseFactor);
    }
    newRepetitions += 1;
  }

  newEaseFactor =
    currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  if (newEaseFactor < MIN_EASE_FACTOR) {
    newEaseFactor = MIN_EASE_FACTOR;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval);

  return {
    easeFactor: Math.round(newEaseFactor * 100) / 100,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  };
}

export function getNewCardSRS(): Pick<
  SRSResult,
  "easeFactor" | "interval" | "repetitions"
> {
  return {
    easeFactor: INITIAL_EASE_FACTOR,
    interval: 0,
    repetitions: 0,
  };
}

export function parseTextToCards(
  text: string,
  cardsPerPage: number = 5,
): { front: string; back: string }[] {
  const lines = text.split("\n").filter((line) => line.trim().length > 0);
  const cards: { front: string; back: string }[] = [];

  for (let i = 0; i < lines.length; i += 2) {
    const front = lines[i]?.trim() || "";
    const back = lines[i + 1]?.trim() || "";

    if (front && back) {
      cards.push({ front, back });
    }
  }

  if (cards.length === 0 && lines.length > 0) {
    const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 50);
    for (const para of paragraphs) {
      const sentences = para
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 20);
      if (sentences.length >= 2) {
        cards.push({
          front: sentences[0].trim() + ".",
          back: sentences.slice(1).join(". ").trim() + ".",
        });
      }
    }
  }

  return cards.slice(0, 50);
}

export function formatNextReviewDate(nextReviewAt: Date): string {
  const now = new Date();
  const diff = nextReviewAt.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Due now";
  if (days === 1) return "Due tomorrow";
  if (days < 7) return `Due in ${days} days`;
  if (days < 30) return `Due in ${Math.ceil(days / 7)} weeks`;
  return `Due in ${Math.ceil(days / 30)} months`;
}
