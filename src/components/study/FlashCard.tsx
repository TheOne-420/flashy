"use client";

import MarkdownRenderer from "./MarkdownRenderer";

interface FlashCardProps {
  key?: string;
  front: string;
  back: string;
  hint?: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({
  key,
  front,
  back,
  hint,
  isFlipped,
  onFlip,
}: FlashCardProps) {
  return (
    <button
      key={key}
      onClick={onFlip}
      className="perspective-1000 relative h-80 w-full max-w-lg cursor-pointer"
    >
      <div
        className={`transform-style-3d absolute inset-0 transition-all duration-500 ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-2xl border-2 border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="text-center text-lg font-medium text-zinc-900 dark:text-zinc-100">
            <MarkdownRenderer text={front} />
          </div>
          {hint && !isFlipped && (
            <p className="mt-4 text-sm text-violet-500 dark:text-violet-400">
              💡 {hint}
            </p>
          )}
        </div>
        <div
          className="absolute inset-0 flex items-center justify-center overflow-y-auto rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-8 shadow-lg dark:bg-emerald-900/20"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center text-lg font-medium text-emerald-900 dark:text-emerald-100">
            <MarkdownRenderer text={back} />
          </div>
        </div>
      </div>
    </button>
  );
}

interface ReviewButtonsProps {
  onReview: (quality: 0 | 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}

export function ReviewButtons({ onReview, disabled }: ReviewButtonsProps) {
  return (
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <button
        onClick={() => onReview(0)}
        disabled={disabled}
        className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
      >
        Again
      </button>
      <button
        onClick={() => onReview(1)}
        disabled={disabled}
        className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-100 disabled:opacity-50 dark:border-orange-900 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30"
      >
        Hard
      </button>
      <button
        onClick={() => onReview(2)}
        disabled={disabled}
        className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm font-medium text-yellow-600 transition-colors hover:bg-yellow-100 disabled:opacity-50 dark:border-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-400 dark:hover:bg-yellow-900/30"
      >
        Good
      </button>
      <button
        onClick={() => onReview(3)}
        disabled={disabled}
        className="rounded-lg border border-lime-200 bg-lime-50 px-4 py-2 text-sm font-medium text-lime-600 transition-colors hover:bg-lime-100 disabled:opacity-50 dark:border-lime-900 dark:bg-lime-900/20 dark:text-lime-400 dark:hover:bg-lime-900/30"
      >
        Easy
      </button>
      <button
        onClick={() => onReview(4)}
        disabled={disabled}
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30"
      >
        Very Easy
      </button>
      <button
        onClick={() => onReview(5)}
        disabled={disabled}
        className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-100 disabled:opacity-50 dark:border-teal-900 dark:bg-teal-900/20 dark:text-teal-400 dark:hover:bg-teal-900/30"
      >
        Perfect
      </button>
    </div>
  );
}
