"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RefreshCw,
  Zap,
  Trophy,
  Clock,
  Target,
  Shuffle,
  Star,
  Brain,
  FileQuestion,
  Timer,
  Pencil,
  Keyboard,
} from "lucide-react";
import { FlashCard, ReviewButtons } from "@/components/study/FlashCard";
import { SessionTimer, XPDisplay } from "@/components/study/SessionTimer";
import Confetti from "@/components/study/Confetti";
import { useGamification, getWeakSpots } from "@/lib/gamification";
import { Badge } from "@/components/ui/badge";
import type { CardWithProgress, ReviewQuality } from "@/types/flashcard";

function getDifficultyBadge(easeFactor: number | null) {
  if (!easeFactor) return { label: "New", variant: "default" as const };
  if (easeFactor >= 2.5)
    return { label: "Easy", variant: "secondary" as const };
  if (easeFactor >= 2.0)
    return { label: "Medium", variant: "outline" as const };
  return { label: "Hard", variant: "destructive" as const };
}

export default function StudyPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = params.id as string;
  const mode = searchParams.get("mode") as
    | "flashcard"
    | "focus"
    | "weakspots"
    | "starred"
    | "learn"
    | "test"
    | null;

  const [studyMode, setStudyMode] = useState<"flashcard" | "learn" | "test" | "type">(
    mode === "test" ? "test" : mode === "learn" ? "learn" : "flashcard",
  );

  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(
    mode === "focus" || mode === "weakspots",
  );
  const [shuffled, setShuffled] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [editingCard, setEditingCard] = useState<{ id: string; front: string; back: string } | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerResult, setAnswerResult] = useState<"correct" | "close" | "wrong" | null>(null);

  const { xp, currentStreak, addXP } = useGamification();

  const fetchStudySession = useCallback(async () => {
    try {
      if (studyMode === "test") {
        const res = await fetch(
          `/api/decks/${deckId}/test?mode=${mode || "flashcard"}`,
        );
        if (res.ok) {
          const data = await res.json();
          setTestQuestions(data.questions || []);
        }
      } else {
        const includeAll = mode === "weakspots" || mode === "learn";
        const res = await fetch(
          `/api/decks/${deckId}/study?includeAll=${includeAll}`,
        );
        if (res.ok) {
          const data = await res.json();
          let studyCards = data.dueCards || [];

          if (mode === "weakspots") {
            studyCards = getWeakSpots(studyCards);
          } else if (mode === "starred") {
            studyCards = studyCards.filter(
              (c: CardWithProgress) => (c as any).starred === 1,
            );
          } else if (mode === "learn") {
            const missed = studyCards.filter(
              (c: CardWithProgress) => c.progress && c.progress.repetitions < 3,
            );
            studyCards = missed.length > 0 ? missed : studyCards;
          }

          if (shuffled) {
            studyCards = [...studyCards].sort(() => Math.random() - 0.5);
          }

          setCards(studyCards);
        } else {
          router.push(`/deck/${deckId}`);
        }
      }
    } catch (error) {
      console.error("Failed to fetch study session:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deckId, mode, studyMode, shuffled, router]);

  useEffect(() => {
    fetchStudySession();
  }, [fetchStudySession]);

  useEffect(() => {
    if (isLoading || sessionComplete) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, sessionComplete]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFlipped && studyMode !== "test") return;
      if (studyMode === "test") {
        if (e.key >= "1" && e.key <= "4") {
          handleTestAnswer(parseInt(e.key) - 1);
        }
        return;
      }
      if (e.key === "1") handleReview(0);
      else if (e.key === "2") handleReview(1);
      else if (e.key === "3") handleReview(3);
      else if (e.key === "4") handleReview(5);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, cards, currentIndex, studyMode]);

  const handleTestAnswer = async (selectedIndex: number) => {
    const question = testQuestions[currentIndex];
    const isCorrect = question.options[selectedIndex] === question.answer;

    setCompletedCount((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);

    if (currentIndex < testQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSessionComplete();
    }
  };

  const handleStarCard = async (cardId: string, currentStarred: number) => {
    await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starred: currentStarred ? 0 : 1 }),
    });
    setCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, starred: currentStarred ? 0 : 1 } : c,
      ),
    );
  };

  const handleSessionComplete = useCallback(async () => {
    setSessionComplete(true);
    const earned = Math.max(50, completedCount * 10);
    const bonus = correctCount > 0 ? Math.round(correctCount * 5) : 0;
    const totalXp = earned + bonus;
    setXpEarned(totalXp);
    await addXP(totalXp, completedCount);

    await fetch("/api/study-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deckId,
        cardsReviewed: completedCount,
        xpEarned: totalXp,
        accuracy: completedCount > 0 ? (correctCount / completedCount) * 100 : 100,
        duration: elapsedSeconds,
      }),
    });
  }, [completedCount, correctCount, addXP, deckId, elapsedSeconds]);

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

    const isCorrect = quality >= 3;
    setCompletedCount((prev) => prev + 1);
    if (isCorrect) setCorrectCount((prev) => prev + 1);
    setIsFlipped(false);

    const newCompleted = completedCount + 1;

    if (isFocusMode && newCompleted >= 10) {
      handleSessionComplete();
      return;
    }

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (cards.length > 1) {
      setCards((prev) => prev.slice(1));
      setCurrentIndex(0);
    } else {
      handleSessionComplete();
    }
  };

  const handleEditSave = async (cardId: string, front: string, back: string) => {
    await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front, back }),
    });
    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, front, back } : c)),
    );
    setEditingCard(null);
  };

  const shuffleCards = () => {
    setShuffled(true);
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const normalize = (s: string) => s.toLowerCase().trim().replace(/\s+/g, " ");

  const handleTypeSubmit = () => {
    const answer = normalize(typedAnswer);
    const correct = normalize(currentItem.back);
    if (!answer) return;

    if (answer === correct) {
      setAnswerResult("correct");
    } else if (correct.includes(answer) || answer.includes(correct)) {
      setAnswerResult("close");
    } else {
      const words = correct.split(" ");
      const matched = words.filter((w) => answer.includes(normalize(w)));
      setAnswerResult(matched.length >= words.length / 2 ? "close" : "wrong");
    }
  };

  const handleTypeReview = (quality: ReviewQuality) => {
    setTypedAnswer("");
    setAnswerResult(null);
    handleReview(quality);
  };

  const handleStudyAgain = () => {
    setCurrentIndex(0);
    setCompletedCount(0);
    setCorrectCount(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setXpEarned(0);
    setShuffled(false);
    setElapsedSeconds(0);
    setCards([]);
    setTestQuestions([]);
    setTimeout(() => fetchStudySession(), 0);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy =
      completedCount > 0
        ? Math.round((correctCount / completedCount) * 100)
        : 0;
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
        <Confetti />
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Trophy className="h-10 w-10 text-amber-500" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Session Complete!
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            You {studyMode === "test" ? "answered" : "reviewed"}{" "}
            {completedCount} {studyMode === "test" ? "questions" : "cards"}{" "}
            in {mins}m {secs}s
          </p>
        </div>

        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-emerald-100 px-4 py-3 dark:bg-emerald-900/30">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-emerald-700 dark:text-emerald-300">
              {correctCount}
            </span>
            <span className="text-sm text-emerald-600 dark:text-emerald-400">
              correct
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-rose-100 px-4 py-3 dark:bg-rose-900/30">
            <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            <span className="font-bold text-rose-700 dark:text-rose-300">
              {completedCount - correctCount}
            </span>
            <span className="text-sm text-rose-600 dark:text-rose-400">
              {studyMode === "test" ? "wrong" : "needs review"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 dark:bg-violet-900/30">
            <Target className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="font-bold text-violet-700 dark:text-violet-300">
              {accuracy}%
            </span>
            <span className="text-sm text-violet-600 dark:text-violet-400">
              accuracy
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-zinc-100 px-4 py-2 dark:bg-zinc-800">
            <Clock className="h-4 w-4 text-zinc-500" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {completedCount > 0 && elapsedSeconds > 0
                ? `${Math.round(elapsedSeconds / completedCount)}s per card`
                : "—"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 text-white shadow-lg">
          <Zap className="h-8 w-8" />
          <div className="text-left">
            <p className="text-sm opacity-90">XP Earned</p>
            <p className="text-2xl font-bold">+{xpEarned}</p>
          </div>
        </div>

        {currentStreak > 0 && (
          <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <span className="text-2xl">🔥</span>
            <span className="font-bold">{currentStreak} day streak!</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleStudyAgain}
            className="rounded-lg bg-zinc-200 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Study Again
          </button>
          <button
            onClick={() => router.push(`/deck/${deckId}`)}
            className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const isEmpty =
    studyMode === "test" ? testQuestions.length === 0 : cards.length === 0;

  if (isEmpty) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-6 px-4">
        <CheckCircle className="h-16 w-16 text-emerald-500" />
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          All Done!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          {mode === "weakspots"
            ? "Great work! No weak spots remaining."
            : mode === "starred"
              ? "No starred cards yet."
              : mode === "learn"
                ? "Great work! All cards learned."
                : "You've completed all cards for this session."}
        </p>
        <div className="flex gap-3">
          <button
            onClick={handleStudyAgain}
            className="rounded-lg bg-emerald-500 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Study Again
          </button>
          <button
            onClick={() => router.push(`/deck/${deckId}`)}
            className="rounded-lg bg-zinc-100 px-6 py-3 font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
          >
            Back to Deck
          </button>
        </div>
      </div>
    );
  }

  const progress = isFocusMode ? Math.min(completedCount / cards.length, 1) : 0;
  const currentItem =
    studyMode === "test" ? testQuestions[currentIndex] : cards[currentIndex];
  const total = studyMode === "test" ? testQuestions.length : cards.length;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 px-4 py-6 dark:bg-zinc-950">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(`/deck/${deckId}`)}
            className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-zinc-400 dark:text-zinc-500">
              <Timer className="h-3.5 w-3.5" />
              <span>
                {Math.floor(elapsedSeconds / 60)}:
                {(elapsedSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
            {isFocusMode && (
              <SessionTimer
                limitSeconds={300}
                onComplete={handleSessionComplete}
              />
            )}
            <XPDisplay xp={xp} streak={currentStreak} />
          </div>
        </div>

        {isFocusMode && (
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="mb-4 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              {correctCount}
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-rose-500" />
              {completedCount - correctCount}
            </div>
            {completedCount > 0 && (
              <div className="flex items-center gap-1 text-violet-500">
                <Target className="h-4 w-4" />
                {Math.round((correctCount / completedCount) * 100)}%
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {studyMode !== "test" && (
              <>
                <button
                  onClick={() =>
                    handleStarCard(
                      currentItem.id,
                      (currentItem as any).starred || 0,
                    )
                  }
                  className="text-zinc-400 hover:text-amber-500"
                >
                  <Star
                    className={`h-4 w-4 ${(currentItem as any).starred ? "fill-amber-500 text-amber-500" : ""}`}
                  />
                </button>
                <button
                  onClick={() =>
                    setEditingCard({
                      id: currentItem.id,
                      front: currentItem.front,
                      back: currentItem.back,
                    })
                  }
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
            <span>
              {currentIndex + 1} / {total}
            </span>
          </div>
        </div>

        {studyMode === "test" && (
          <div className="mb-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <p className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {currentItem.question}
            </p>
            <div className="space-y-2">
              {currentItem.options.map((opt: string, i: number) => (
                <button
                  key={i}
                  onClick={() => handleTestAnswer(i)}
                  className="w-full rounded-lg border border-zinc-200 px-4 py-3 text-left text-zinc-700 transition-colors hover:border-violet-500 hover:bg-violet-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-violet-950"
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Press 1-4 to answer quickly
            </p>
          </div>
        )}

        {studyMode === "type" && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <FlashCard
              key={currentItem.id ?? currentIndex}
              front={currentItem.front}
              back={answerResult ? currentItem.back : ""}
              hint={currentItem.hint}
              isFlipped={!!answerResult}
              onFlip={() => {}}
            />
            {!answerResult && (
              <div className="mt-6 w-full max-w-sm">
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTypeSubmit();
                  }}
                  placeholder="Type your answer..."
                  className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-center text-sm text-zinc-900 placeholder-zinc-400 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-500"
                  autoFocus
                />
                <div className="mt-3 flex justify-center gap-3">
                  <button
                    onClick={handleTypeSubmit}
                    disabled={!typedAnswer.trim()}
                    className="rounded-lg bg-violet-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600 disabled:opacity-50"
                  >
                    Check
                  </button>
                  <button
                    onClick={() => setAnswerResult("correct")}
                    className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  >
                    Show Answer
                  </button>
                </div>
              </div>
            )}
            {answerResult && (
              <div className="mt-6 w-full max-w-sm text-center">
                <span
                  className={`inline-block rounded-full px-4 py-1 text-sm font-medium ${
                    answerResult === "correct"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : answerResult === "close"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                  }`}
                >
                  {answerResult === "correct"
                    ? "Correct!"
                    : answerResult === "close"
                      ? "Close!"
                      : "Not quite"}
                </span>
                <div className="mt-4">
                  <ReviewButtons onReview={handleTypeReview} />
                </div>
              </div>
            )}
          </div>
        )}

        {studyMode !== "test" && studyMode !== "type" && (
          <div className="flex flex-1 flex-col items-center justify-center">
            <FlashCard
              key={currentItem.id ?? currentIndex}
              front={currentItem.front}
              back={currentItem.back}
              hint={currentItem.hint}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(!isFlipped)}
            />
            {isFlipped && <ReviewButtons onReview={handleReview} />}
            {!isFlipped && (
              <p className="mt-8 text-sm text-zinc-400 dark:text-zinc-500">
                Click card to reveal answer (or press 1-4 after revealing)
              </p>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setStudyMode("flashcard")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${studyMode === "flashcard" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            <FileQuestion className="h-4 w-4" />
            Flashcards
          </button>
          <button
            onClick={() => {
              setStudyMode("learn");
              setIsLoading(true);
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${studyMode === "learn" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            <Brain className="h-4 w-4" />
            Learn
          </button>
          <button
            onClick={() => {
              setStudyMode("test");
              setIsLoading(true);
            }}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${studyMode === "test" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            <Target className="h-4 w-4" />
            Test
          </button>
          <button
            onClick={() => setStudyMode("type")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors ${studyMode === "type" ? "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}
          >
            <Keyboard className="h-4 w-4" />
            Type
          </button>
          <button
            onClick={shuffleCards}
            className="flex items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
          >
            <Shuffle className="h-4 w-4" />
            Shuffle
          </button>
        </div>
      </div>

      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Edit Card
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Front
                </label>
                <textarea
                  value={editingCard.front}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, front: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  rows={3}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Back
                </label>
                <textarea
                  value={editingCard.back}
                  onChange={(e) =>
                    setEditingCard({ ...editingCard, back: e.target.value })
                  }
                  className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-sm text-zinc-900 focus:border-violet-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                  rows={3}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setEditingCard(null)}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleEditSave(editingCard.id, editingCard.front, editingCard.back)
                }
                className="rounded-lg bg-violet-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
