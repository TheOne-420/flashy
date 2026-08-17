"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  FileUp,
  RefreshCw,
  Target,
  Zap,
  Flame,
  Bell,
  CheckCircle2,
  Store,
  Trophy,
  Search,
  ArrowUpDown,
  Filter,
  Star,
} from "lucide-react";
import {
  DeckCard,
  CreateDeckModal,
  UploadPDFModal,
} from "@/components/deck/DeckCard";
import { XPDisplay } from "@/components/study/SessionTimer";
import { Badge } from "@/components/ui/badge";
import StudyHistoryFeed from "@/components/study/StudyHistoryFeed";
import ActivityChart from "@/components/study/ActivityChart";
import ReviewForecast from "@/components/study/ReviewForecast";
import type { DeckWithCards } from "@/types/flashcard";
import { parseTextToCards } from "@/lib/srs";
import { useGamification, getWeakSpots, getDueCount } from "@/lib/gamification";

export default function HomePage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithCards[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDeckId, setSelectedDeckId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "due" | "created" | "cards">("name");
  const [showOnlyDue, setShowOnlyDue] = useState(false);

  const {
    xp,
    level,
    currentStreak,
    isLoading: statsLoading,
    dailyGoal,
    dailyProgress,
    goalCompleted,
    nextLevelXp,
    cardsPerDay,
    forecast,
  } = useGamification();

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

  const createDeck = async (
    name: string,
    description: string,
    color: string,
  ) => {
    const res = await fetch("/api/decks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color }),
    });
    if (res.ok) {
      loadDecks();
    }
  };

  const editDeck = async (
    id: string,
    name: string,
    description: string,
    color: string,
    isPublic?: boolean,
  ) => {
    const res = await fetch(`/api/decks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, color, isPublic }),
    });
    if (res.ok) {
      loadDecks();
    }
  };

  const handleUpload = async (file: File, deckId: string, useAI?: boolean) => {
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (uploadRes.ok) {
      const result = await uploadRes.json();
      let parsedCards = parseTextToCards(result.text);

      if (useAI) {
        const aiRes = await fetch("/api/parse-ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: result.text }),
        });
        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData.cards && aiData.cards.length > 0) {
            parsedCards = aiData.cards;
          }
        }
      }

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

  const getDeckDueCount = (deck: DeckWithCards) => getDueCount(deck.cards);
  const getDeckWeakSpotCount = (deck: DeckWithCards) =>
    getWeakSpots(deck.cards).length;

  const totalDue = decks.reduce((sum, d) => sum + getDeckDueCount(d), 0);
  const totalWeakSpots = decks.reduce(
    (sum, d) => sum + getDeckWeakSpotCount(d),
    0,
  );

  const filteredDecks = decks
    .filter((d) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!d.name.toLowerCase().includes(q)) return false;
      }
      if (showOnlyDue && getDeckDueCount(d) === 0) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "due":
          return getDeckDueCount(b) - getDeckDueCount(a);
        case "cards":
          return b.cards.length - a.cards.length;
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  if (isLoading || statsLoading) {
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
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              My Decks
            </h1>
            {totalDue > 0 && (
              <div className="mt-2 flex items-center gap-2 text-sm text-violet-600 dark:text-violet-400">
                <Bell className="h-4 w-4" />
                <span>{totalDue} cards due for review</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <XPDisplay xp={xp} streak={currentStreak} />

            <div className="flex items-center gap-1">
              <Link
                href="/marketplace"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Store className="h-4 w-4" />
                Marketplace
              </Link>
              <Link
                href="/leaderboard"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                <Trophy className="h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                href="/achievements"
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-amber-600 transition-colors hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
              >
                <Trophy className="h-4 w-4" />
                Achievements
              </Link>
            </div>

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
        </div>

        {decks.length > 0 && totalDue > 0 && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Ready to Study</p>
                <p className="text-sm opacity-90">
                  {totalDue} cards due across{" "}
                  {decks.filter((d) => getDeckDueCount(d) > 0).length} decks
                </p>
              </div>
              <button
                onClick={() => {
                  const firstDeckWithDue = decks.find(
                    (d) => getDeckDueCount(d) > 0,
                  );
                  if (firstDeckWithDue)
                    router.push(`/study/${firstDeckWithDue.id}?mode=focus`);
                }}
                className="hover:bg-opacity-90 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-600"
              >
                Start Now
              </button>
            </div>
          </div>
        )}

        {decks.length > 0 && (
          <>
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Decks
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {decks.length}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Total Cards
                </p>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {decks.reduce((sum, d) => sum + d.cards.length, 0)}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Due Today
                </p>
                <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                  {totalDue}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Level
                </p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {level}
                </p>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all"
                    style={{
                      width: `${nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  {xp} / {nextLevelXp} XP
                </p>
              </div>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <ActivityChart cardsPerDay={cardsPerDay} />
              <ReviewForecast forecast={forecast} />
              <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
                <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Weak Spots
                </h3>
                <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">
                  {totalWeakSpots}
                </p>
                <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
                  cards needing extra review
                </p>
              </div>
            </div>
          </>
        )}

        {!goalCompleted && dailyGoal > 0 && (
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/50">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Daily Goal
                </span>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  {dailyProgress} / {dailyGoal} cards
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                  style={{
                    width: `${Math.min((dailyProgress / dailyGoal) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            <button
              onClick={() => {
                const firstDeckWithDue = decks.find(
                  (d) => getDeckDueCount(d) > 0,
                );
                const targetDeck = firstDeckWithDue || decks[0];
                if (targetDeck) {
                  router.push(`/study/${targetDeck.id}?mode=focus`);
                }
              }}
              disabled={decks.length === 0}
              className="shrink-0 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600 disabled:opacity-50"
            >
              {totalDue === 0
                ? "Study Any"
                : dailyProgress > 0
                  ? "Continue"
                  : "Start"}
            </button>
          </div>
        )}

        {goalCompleted && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-100 p-4 dark:bg-emerald-900/30">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            <div className="flex-1">
              <p className="font-medium text-emerald-700 dark:text-emerald-300">
                Daily goal completed!
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {dailyProgress} / {dailyGoal} cards reviewed
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-200 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-300"
            >
              +50 XP Bonus
            </Badge>
          </div>
        )}

        {decks.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <button
              onClick={() => {
                const firstDeckWithDue = decks.find(
                  (d) => getDeckDueCount(d) > 0,
                );
                const targetDeck = firstDeckWithDue || decks[0];
                if (targetDeck) {
                  router.push(`/study/${targetDeck.id}?mode=focus`);
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-4 text-left text-white transition-all hover:from-violet-600 hover:to-purple-700"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  <span className="font-semibold">Quick Study</span>
                </div>
                <p className="mt-1 text-sm opacity-90">
                  {totalDue > 0 ? `${totalDue} cards due` : "No cards due"}
                </p>
                <p className="mt-2 text-xs opacity-75">5-min focused session</p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={() => {
                const firstDeckWithWeak = decks.find(
                  (d) => getDeckWeakSpotCount(d) > 0,
                );
                if (firstDeckWithWeak) {
                  router.push(`/study/${firstDeckWithWeak.id}?mode=weakspots`);
                }
              }}
              disabled={totalWeakSpots === 0}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 p-4 text-left text-white transition-all hover:from-rose-600 hover:to-orange-600 disabled:opacity-50"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  <span className="font-semibold">Weak Spots</span>
                </div>
                <p className="mt-1 text-sm opacity-90">
                  {totalWeakSpots} cards
                </p>
                <p className="mt-2 text-xs opacity-75">
                  Focus on difficult cards
                </p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            </button>

            <button
              onClick={() => {
                if (decks.length > 0) {
                  router.push(`/study/${decks[0].id}?mode=focus`);
                }
              }}
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-left text-white transition-all hover:from-emerald-600 hover:to-teal-700"
            >
              <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  <span className="font-semibold">Build Streak</span>
                </div>
                <p className="mt-1 text-sm opacity-90">
                  {currentStreak > 0
                    ? `${currentStreak} day streak`
                    : "Start today!"}
                </p>
                <p className="mt-2 text-xs opacity-75">Earn XP & level up</p>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/10 transition-transform group-hover:scale-110" />
            </button>
          </div>
        )}

        {decks.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Recent Activity
            </h2>
            <StudyHistoryFeed />
          </div>
        )}

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
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search decks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder-zinc-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowOnlyDue(!showOnlyDue)}
                  className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                    showOnlyDue
                      ? "border-violet-300 bg-violet-50 text-violet-700 dark:border-violet-700 dark:bg-violet-900/20 dark:text-violet-300"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  <Filter className="h-4 w-4" />
                  Due only
                </button>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-600 focus:border-violet-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400"
                >
                  <option value="name">Name</option>
                  <option value="due">Due count</option>
                  <option value="cards">Card count</option>
                  <option value="created">Newest</option>
                </select>
              </div>
            </div>
            {filteredDecks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
                <Search className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
                <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
                  No decks match your search
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredDecks.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    id={deck.id}
                    name={deck.name}
                    description={deck.description}
                    cardCount={deck.cards.length}
                    dueCount={getDeckDueCount(deck)}
                    color={deck.color || "#6366f1"}
                    isPublic={deck.isPublic}
                    onClick={() => router.push(`/deck/${deck.id}`)}
                    onEdit={editDeck}
                  />
                ))}
              </div>
            )}
          </>
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
