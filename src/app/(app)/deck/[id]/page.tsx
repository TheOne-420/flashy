"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Pencil,
  RefreshCw,
  Star,
} from "lucide-react";
import type { DeckWithCards, CardWithProgress } from "@/types/flashcard";
import { formatNextReviewDate } from "@/lib/srs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [deck, setDeck] = useState<DeckWithCards | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<CardWithProgress | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");

  const loadDeck = useCallback(async () => {
    try {
      const res = await fetch(`/api/decks/${deckId}`);
      if (res.ok) {
        const data = await res.json();
        setDeck(data.deck);
      } else {
        router.push("/study");
      }
    } catch (error) {
      console.error("Failed to fetch deck:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, router]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const createCard = async () => {
    if (!front.trim() || !back.trim()) return;
    const res = await fetch(`/api/decks/${deckId}/cards`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || null,
      }),
    });
    if (res.ok) {
      setFront("");
      setBack("");
      setHint("");
      setShowAddCard(false);
      loadDeck();
    }
  };

  const updateCard = async () => {
    if (!editingCard || !front.trim() || !back.trim()) return;
    await fetch(`/api/decks/${deckId}/cards/${editingCard.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        front: front.trim(),
        back: back.trim(),
        hint: hint.trim() || null,
      }),
    });
    setEditingCard(null);
    setFront("");
    setBack("");
    setHint("");
    loadDeck();
  };

  const toggleStar = async (cardId: string, currentStarred: number) => {
    await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: currentStarred ? 0 : 1 }),
    });
    loadDeck();
  };

  const deleteCard = async () => {
    if (!deletingCardId) return;
    await fetch(`/api/decks/${deckId}/cards/${deletingCardId}`, {
      method: "DELETE",
    });
    setDeletingCardId(null);
    loadDeck();
  };

  const getDueCards = () => {
    if (!deck) return [];
    const now = new Date();
    return deck.cards.filter((card) => {
      if (!card.progress) return true;
      return new Date(card.progress.nextReviewAt) <= now;
    });
  };

  const getNextReviewText = (card: CardWithProgress) => {
    if (!card.progress) return "New";
    return formatNextReviewDate(new Date(card.progress.nextReviewAt));
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!deck) return null;

  const dueCards = getDueCards();

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={() => router.push("/study")}
          className="mb-6 flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Decks
        </button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              {deck.name}
            </h1>
            {deck.description && (
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                {deck.description}
              </p>
            )}
            <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
              {deck.cards.length} cards
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <Plus className="h-4 w-4" />
              Add Card
            </button>
            {dueCards.length > 0 && (
              <button
                onClick={() => router.push(`/study/${deckId}`)}
                className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <Play className="h-4 w-4" />
                Study ({dueCards.length})
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {deck.cards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400">
                No cards yet. Add your first card or upload a PDF.
              </p>
            </div>
          ) : (
            deck.cards.map((card) => (
              <div
                key={card.id}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">
                      {card.front}
                    </p>
                    {card.starred === 1 && (
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {card.back}
                  </p>
                  {card.hint && (
                    <p className="mt-1 text-xs text-violet-500 dark:text-violet-400">
                      Hint: {card.hint}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
                    {getNextReviewText(card)}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <button
                    onClick={() => toggleStar(card.id, card.starred)}
                    className={`rounded-lg p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
                      card.starred
                        ? "text-yellow-400 hover:text-yellow-500"
                        : "text-zinc-400 hover:text-yellow-400"
                    }`}
                  >
                    <Star
                      className={`h-4 w-4 ${card.starred ? "fill-yellow-400" : ""}`}
                    />
                  </button>
                  <button
                    onClick={() => {
                      setEditingCard(card);
                      setFront(card.front);
                      setBack(card.back);
                      setHint(card.hint || "");
                    }}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeletingCardId(card.id)}
                    className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(showAddCard || editingCard) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editingCard ? "Edit Card" : "Add New Card"}
            </h2>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Front
              </label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                rows={3}
                required
              />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Back
              </label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                rows={3}
                required
              />
            </div>
            <div className="mb-6">
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Hint <span className="text-zinc-400">(optional)</span>
              </label>
              <textarea
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
                rows={2}
                placeholder="Add a hint to help remember..."
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setEditingCard(null);
                  setFront("");
                  setBack("");
                  setHint("");
                }}
                className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={editingCard ? updateCard : createCard}
                disabled={!front.trim() || !back.trim()}
                className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {editingCard ? "Save Changes" : "Add Card"}
              </button>
            </div>
          </div>
        </div>
      )}
      {deletingCardId && (
        <AlertDialog open onOpenChange={() => setDeletingCardId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Card</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this card? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingCardId(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={deleteCard} className="bg-red-500">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
