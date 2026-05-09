"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileUp, RefreshCw } from "lucide-react";
import {
  DeckCard,
  CreateDeckModal,
  UploadPDFModal,
} from "@/components/deck/DeckCard";
import type { DeckWithCards } from "@/types/flashcard";
import { parseTextToCards } from "@/lib/srs";

export default function HomePage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithCards[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState("");

  const loadDecks = useCallback(async () => {
    try {
      const res = await fetch("/api/decks");
      if (res.ok) {
        const data = await res.json();
        setDecks(data.decks || []);
      }
    } catch (error) {
      console.error("Failed to fetch decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const createDeck = async (name: string, description: string) => {
    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      loadDecks();
    }
  };

  const handleUpload = async (file: File, deckId: string) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (uploadRes.ok) {
      const result = await uploadRes.json();
      const parsedCards = parseTextToCards(result.text);

      if (parsedCards.length > 0) {
        await fetch(`/api/decks/${deckId}/cards`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cards: parsedCards }),
        });
      }

      loadDecks();
    } else {
      const error = await uploadRes.json();
      alert(error.error || "Upload failed");
    }
  };

  const getDueCount = (deck: DeckWithCards) => {
    const now = new Date();
    return deck.cards.filter((card) => {
      if (!card.progress) return true;
      return new Date(card.progress.nextReviewAt) <= now;
    }).length;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            My Decks
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              <FileUp className="h-4 w-4" />
              Upload PDF
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-4 w-4" />
              New Deck
            </button>
          </div>
        </div>

        {decks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <p className="mb-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
              No decks yet
            </p>
            <p className="mb-6 text-sm text-zinc-400 dark:text-zinc-500">
              Create your first deck or upload a PDF to get started
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <Plus className="h-5 w-5" />
              Create Your First Deck
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {decks.map((deck) => (
              <DeckCard
                key={deck.id}
                id={deck.id}
                name={deck.name}
                description={deck.description}
                cardCount={deck.cards.length}
                dueCount={getDueCount(deck)}
                onClick={() => router.push(`/deck/${deck.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <CreateDeckModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={createDeck}
      />

      <UploadPDFModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
        deckId={selectedDeckId}
        decks={decks.map((d) => ({ id: d.id, name: d.name }))}
        onDeckChange={setSelectedDeckId}
      />
    </div>
  );
}
