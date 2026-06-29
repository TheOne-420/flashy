export interface PDFExtractResponse {
  success: boolean;
  text: string;
  pageCount: number;
  error?: string;
}

export interface PDFUploadResult {
  text: string;
  pageCount: number;
  cards?: ParsedCard[];
}

export interface ParsedCard {
  front: string;
  back: string;
}

export interface DeckWithCards {
  id: string;
  name: string;
  description: string | null;
  color?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  cards: CardWithProgress[];
}

export interface CardWithProgress {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint?: string;
  starred: number;
  createdAt: Date;
  updatedAt: Date;
  progress: CardProgressData | null;
}

export interface CardProgressData {
  id: string;
  cardId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;
}

export interface StudySession {
  deckId: string;
  dueCards: CardWithProgress[];
  completedCards: string[];
  currentIndex: number;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SRSResult {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewAt: Date;
}

export interface CreateDeckInput {
  name: string;
  description?: string;
}

export interface CreateCardInput {
  deckId: string;
  front: string;
  back: string;
}

export interface UpdateCardInput {
  front?: string;
  back?: string;
}

export interface BulkCreateCardsInput {
  deckId: string;
  cards: { front: string; back: string }[];
}
