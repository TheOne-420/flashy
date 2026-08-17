"use client";

import { CalendarDays } from "lucide-react";
import type { CardsPerDay } from "@/lib/gamification";

function formatDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

export default function ReviewForecast({
  forecast,
}: {
  forecast: CardsPerDay[];
}) {
  const totalUpcoming = forecast.reduce((sum, d) => sum + d.count, 0);
  const maxCount = Math.max(...forecast.map((d) => d.count), 1);

  if (forecast.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Upcoming Reviews
        </h3>
        <span className="text-xs text-zinc-400">{totalUpcoming} cards</span>
      </div>
      <div className="flex items-end gap-1.5">
        {forecast.map((day) => {
          const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {day.count}
              </span>
              <div className="flex h-16 w-full items-end justify-center">
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    day.count > 0
                      ? "bg-violet-400 dark:bg-violet-600"
                      : "bg-zinc-100 dark:bg-zinc-800"
                  }`}
                  style={{ height: `${Math.max(height, 4)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
                {formatDay(day.date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
