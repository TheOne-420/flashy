"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Store, Search, Copy, RefreshCw, Users, FileText } from "lucide-react";
import type { MarketplaceDeck, MarketplaceResponse } from "@/types/flashcard";

export default function MarketplacePage() {
  const router = useRouter();
  const [decks, setDecks] = useState<MarketplaceDeck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [cloningId, setCloningId] = useState<string | null>(null);

  const loadDecks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/marketplace?${params}`);
      if (res.ok) {
        const data: MarketplaceResponse = await res.json();
        setDecks(data.decks);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (error) {
      console.error("Failed to load marketplace:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadDecks();
  }, [loadDecks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadDecks();
  };

  const handleClone = async (deckId: string) => {
    setCloningId(deckId);
    try {
      const res = await fetch(`/api/decks/${deckId}/clone`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/deck/${data.deck.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to copy deck");
      }
    } catch (error) {
      console.error("Clone error:", error);
      alert("Failed to copy deck");
    } finally {
      setCloningId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8 dark:bg-zinc-950">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
              <Store className="h-7 w-7" />
              Marketplace
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Browse and copy public decks shared by other users
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search decks..."
              className="w-full rounded-lg border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Search
          </button>
        </form>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="h-8 w-8 animate-spin text-zinc-400" />
          </div>
        ) : decks.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 p-12 text-center dark:border-zinc-800">
            <Store className="mx-auto mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
            <p className="mb-2 text-lg font-medium text-zinc-500 dark:text-zinc-400">
              No public decks found
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-500">
              {search ? "Try a different search term" : "Be the first to publish a deck!"}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
              {total} deck{total !== 1 ? "s" : ""} found
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {decks.map((deck) => (
                <div
                  key={deck.id}
                  className="group relative rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                >
                  <div
                    className="absolute top-0 left-0 h-1 w-full rounded-t-xl"
                    style={{ backgroundColor: deck.color || "#6366f1" }}
                  />
                  <h3 className="mb-1 font-semibold text-zinc-900 dark:text-zinc-100">
                    {deck.name}
                  </h3>
                  {deck.description && (
                    <p className="mb-3 text-sm text-zinc-500 line-clamp-2 dark:text-zinc-400">
                      {deck.description}
                    </p>
                  )}
                  <div className="mb-4 flex items-center gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {deck.authorName}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {deck.forkCount} fork{deck.forkCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => handleClone(deck.id)}
                    disabled={cloningId === deck.id}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-violet-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-600 disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4" />
                    {cloningId === deck.id ? "Copying..." : "Copy to My Decks"}
                  </button>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Previous
                </button>
                <span className="px-3 text-sm text-zinc-500">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-zinc-200 px-4 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
