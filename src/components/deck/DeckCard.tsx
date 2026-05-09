"use client";

import { useState } from "react";
import { Plus, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeckCardProps {
  id: string;
  name: string;
  description: string | null;
  cardCount: number;
  dueCount: number;
  onClick: () => void;
}

export function DeckCard({
  name,
  description,
  cardCount,
  dueCount,
  onClick,
}: DeckCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-xl border border-zinc-200 bg-white p-6 text-left transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        {dueCount > 0 && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-medium text-white">
            {dueCount}
          </span>
        )}
      </div>
      {description && (
        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      )}
      <p className="text-sm text-zinc-400 dark:text-zinc-500">
        {cardCount} cards
      </p>
    </button>
  );
}

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string) => Promise<void>;
}

export function CreateDeckModal({
  isOpen,
  onClose,
  onSubmit,
}: CreateDeckModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(name.trim(), description.trim());
      setName("");
      setDescription("");
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Create New Deck
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Deck Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Enter deck name"
              required
            />
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Creating..." : "Create Deck"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface UploadPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, deckId: string) => Promise<void>;
  deckId: string;
  decks: { id: string; name: string }[];
  onDeckChange: (id: string) => void;
}

export function UploadPDFModal({
  isOpen,
  onClose,
  onUpload,
  deckId,
  decks,
  onDeckChange,
}: UploadPDFModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !deckId) return;
    setIsLoading(true);
    try {
      await onUpload(file, deckId);
      setFile(null);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-zinc-900">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <FileUp className="h-5 w-5" />
          Upload PDF
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Select Deck
            </label>
            <select
              value={deckId}
              onChange={(e) => onDeckChange(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              required
            >
              <option value="">Choose a deck</option>
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-6">
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              PDF File (max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-400 focus:outline-none dark:border-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !file || !deckId}
              className="flex-1 rounded-lg bg-zinc-900 px-4 py-2 font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {isLoading ? "Processing..." : "Upload & Extract"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
