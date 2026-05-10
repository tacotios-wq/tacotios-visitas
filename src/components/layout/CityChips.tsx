"use client";

import type { FilterState, CityFilter } from "@/types";

interface CityChipsProps {
  filters: FilterState;
  onUpdate: (filters: FilterState) => void;
  counts: Record<string, number>;
}

const CITY_LABELS: { id: CityFilter; label: string }[] = [
  { id: "CDMX", label: "CDMX" },
  { id: "GDL", label: "GDL" },
  { id: "MTY", label: "MTY" },
  { id: "Mazatlan", label: "Mazatlan" },
  { id: "Ensenada", label: "Ensenada" },
  { id: "Oaxaca", label: "Oaxaca" },
  { id: "Puebla", label: "Puebla" },
  { id: "La Paz", label: "La Paz" },
  { id: "Napoles", label: "Napoles" },
];

export function CityChips({ filters, onUpdate, counts }: CityChipsProps) {
  const isAll = filters.cities.length === 0;

  const toggle = (city: CityFilter) => {
    const next = filters.cities.includes(city)
      ? filters.cities.filter((c) => c !== city)
      : [...filters.cities, city];
    onUpdate({ ...filters, cities: next });
  };

  const clearAll = () => onUpdate({ ...filters, cities: [] });

  const visibleCities = CITY_LABELS.filter((c) => (counts[c.id] ?? 0) > 0);

  const baseChip =
    "shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full eyebrow border cursor-pointer transition-colors duration-150 transition-transform duration-100 ease-out active:scale-[0.97] animate-fade-up";
  const activeChip =
    "bg-interactive-soft text-text-primary border-interactive-border";
  const idleChip =
    "bg-transparent text-text-muted border-border-card hover:text-text-primary hover:border-text-secondary";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-3 pb-2">
      <div
        className="flex gap-2 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        <button
          onClick={clearAll}
          style={{ animationDelay: "0ms" }}
          className={`${baseChip} ${isAll ? activeChip : idleChip}`}
        >
          Todas
        </button>

        {visibleCities.map((c, i) => {
          const active = filters.cities.includes(c.id);
          const count = counts[c.id] ?? 0;
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              style={{ animationDelay: `${(i + 1) * 40}ms` }}
              className={`${baseChip} ${active ? activeChip : idleChip}`}
            >
              <span>{c.label}</span>
              <span aria-hidden="true" className="opacity-40">
                ·
              </span>
              <span className="tabular-nums opacity-60">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
