"use client";

import type { FilterState } from "@/types";

interface ActiveFiltersProps {
  filters: FilterState;
  onUpdate: (filters: FilterState) => void;
}

const SERIES_NAMES: Record<string, string> = {
  lsdt: "LSDT",
  espanoles: "Espanoles",
  "omega-cdmx": "Omega",
  ensenada: "Ensenada",
  oaxaca: "Oaxaca",
  puebla: "Puebla",
  mazatlan: "Mazatlan",
  napoles: "Napoles",
};

const SORT_LABELS: Record<string, string> = {
  score: "Scoring",
  city: "Ciudad",
};

export function ActiveFilters({ filters, onUpdate }: ActiveFiltersProps) {
  const pills: { key: string; label: string; onRemove: () => void }[] = [];

  for (const c of filters.cities) {
    pills.push({
      key: `city-${c}`,
      label: c,
      onRemove: () =>
        onUpdate({ ...filters, cities: filters.cities.filter((x) => x !== c) }),
    });
  }

  for (const s of filters.series) {
    pills.push({
      key: `series-${s}`,
      label: SERIES_NAMES[s] ?? s,
      onRemove: () =>
        onUpdate({ ...filters, series: filters.series.filter((x) => x !== s) }),
    });
  }

  if (filters.sort !== "name") {
    pills.push({
      key: `sort-${filters.sort}`,
      label: SORT_LABELS[filters.sort] ?? filters.sort,
      onRemove: () => onUpdate({ ...filters, sort: "name" }),
    });
  }

  if (pills.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-2 pb-3 border-b border-border-subtle">
      <div
        className="flex gap-2 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {pills.map((p, i) => (
          <button
            key={p.key}
            onClick={p.onRemove}
            style={{ animationDelay: `${i * 40}ms` }}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full eyebrow border bg-interactive-soft text-text-primary border-interactive-border cursor-pointer transition-colors duration-150 transition-transform duration-100 ease-out hover:border-text-secondary active:scale-[0.97] animate-fade-up"
          >
            {p.label}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 2l6 6M8 2L2 8" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
