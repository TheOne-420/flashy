"use client";

import { BarChart } from "lucide-react";
import type { CardsPerDay } from "@/lib/gamification";

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function isToday(dateStr: string) {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr === today;
}

export default function ActivityChart({
  cardsPerDay,
}: {
  cardsPerDay: CardsPerDay[];
}) {
  const maxCount = Math.max(...cardsPerDay.map((d) => d.count), 1);

  if (cardsPerDay.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-800">
        <BarChart className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
        <p className="mt-2 text-sm text-zinc-400 dark:text-zinc-500">
          No data yet
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        This Week
      </h3>
      <div className="flex items-end gap-2">
        {cardsPerDay.map((day) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {day.count}
              </span>
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full max-w-8 rounded-t-md transition-all duration-300 ${
                    isToday(day.date)
                      ? "bg-violet-500"
                      : "bg-violet-200 dark:bg-violet-900/50"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {formatDay(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
