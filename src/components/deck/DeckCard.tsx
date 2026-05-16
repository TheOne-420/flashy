"use client";

import { useState } from "react";
import { Plus, FileUp, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

const DECK_COLORS = [
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#0ea5e9", // Sky
  "#64748b", // Slate
];

interface DeckCardProps {
  id: string;
  name: string;
  description: string | null;
  cardCount: number;
  dueCount: number;
  color?: string;
  onClick: () => void;
  onEdit?: (
    id: string,
    name: string,
    description: string,
    color: string,
  ) => void;
}

export function DeckCard({
  id,
  name,
  description,
  cardCount,
  dueCount,
  color = "#6366f1",
  onClick,
  onEdit,
}: DeckCardProps) {
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editDesc, setEditDesc] = useState(description || "");
  const [editColor, setEditColor] = useState(color);

  const handleSave = () => {
    onEdit?.(id, editName, editDesc, editColor);
    setShowEdit(false);
  };

  if (showEdit) {
    return (
      <div className="w-full rounded-xl border border-violet-500 bg-white p-6 dark:bg-zinc-900">
        <div className="mb-4">
          <input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="mb-2 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Deck name"
          />
          <textarea
            value={editDesc}
            onChange={(e) => setEditDesc(e.target.value)}
            className="mb-3 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            placeholder="Description"
            rows={2}
          />
          <ColorPicker value={editColor} onChange={setEditColor} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 rounded-lg bg-violet-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-600"
          >
            Save
          </button>
          <button
            onClick={() => setShowEdit(false)}
            className="flex-1 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group relative w-full rounded-xl border border-zinc-200 bg-white p-6 text-left transition-all hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
    >
      <div
        className="absolute top-0 left-0 h-1 w-full rounded-t-xl"
        style={{ backgroundColor: color }}
      />
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          {dueCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-medium text-white">
              {dueCount}
            </span>
          )}
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit(true);
              }}
              className="opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Pencil className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300" />
            </button>
          )}
        </div>
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

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {DECK_COLORS.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            "h-8 w-8 rounded-full transition-transform hover:scale-110",
            value === color &&
              "ring-2 ring-zinc-400 ring-offset-2 dark:ring-offset-zinc-900",
          )}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

interface CreateDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, color: string) => Promise<void>;
  defaultColor?: string;
}

export function CreateDeckModal({
  isOpen,
  onClose,
  onSubmit,
  defaultColor = "#6366f1",
}: CreateDeckModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);
    try {
      await onSubmit(name.trim(), description.trim(), color);
      setName("");
      setDescription("");
      setColor(defaultColor);
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
          <div className="mb-4">
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
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Deck Color
            </label>
            <ColorPicker value={color} onChange={setColor} />
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
  decks: { id: string; name: string; color?: string }[];
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
