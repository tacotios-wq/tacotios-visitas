"use client";

import type { ReactNode } from "react";
import type { FilterState, TabKey, CityFilter, SeriesFilter, SortKey } from "@/types";
import { BottomSheet } from "@/components/ui/BottomSheet";

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdate: (filters: FilterState) => void;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: "pendiente", label: "Pendientes" },
  { key: "visitado", label: "Visitados" },
  { key: "80tacos", label: "80 Tacos" },
];

const CITIES: CityFilter[] = ["CDMX", "GDL", "MTY", "Ensenada", "Oaxaca", "Puebla", "Mazatlan", "La Paz", "Napoles"];

const SERIES_OPTIONS: { id: SeriesFilter; label: string }[] = [
  { id: "lsdt", label: "LSDT" },
  { id: "espanoles", label: "Espanoles" },
  { id: "omega-cdmx", label: "Omega CDMX" },
  { id: "ensenada", label: "Ensenada" },
  { id: "oaxaca", label: "Oaxaca" },
  { id: "puebla", label: "Puebla" },
  { id: "mazatlan", label: "Mazatlan" },
  { id: "napoles", label: "Napoles" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Nombre A-Z" },
  { key: "score", label: "Viral Score" },
  { key: "city", label: "Ciudad" },
];

export function FilterSheet({ open, onClose, filters, onUpdate }: FilterSheetProps) {
  const set = (partial: Partial<FilterState>) =>
    onUpdate({ ...filters, ...partial });

  const toggleCity = (c: CityFilter) =>
    set({
      cities: filters.cities.includes(c)
        ? filters.cities.filter((x) => x !== c)
        : [...filters.cities, c],
    });

  const toggleSeries = (s: SeriesFilter) =>
    set({
      series: filters.series.includes(s)
        ? filters.series.filter((x) => x !== s)
        : [...filters.series, s],
    });

  const clearAll = () =>
    onUpdate({ search: "", cities: [], series: [], sort: "name", tab: filters.tab });

  const hasFilters =
    filters.cities.length > 0 || filters.series.length > 0 || filters.sort !== "name";

  return (
    <BottomSheet open={open} onClose={onClose} title="Filtros">
      <div className="flex flex-col gap-6">
        {/* Estado (tabs) */}
        <Section label="Estado">
          <div className="grid grid-cols-3 gap-2">
            {TABS.map((t) => {
              const active = filters.tab === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => set({ tab: t.key })}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium border cursor-pointer select-none transition-colors duration-150 ease-out transition-transform duration-100 ease-out active:scale-[0.97] ${
                    active
                      ? "bg-transparent text-text-primary border-text-primary"
                      : "bg-bg-elevated text-text-muted border-border-card hover:text-text-secondary"
                  }`}
                  aria-pressed={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Ciudad */}
        <Section label="Ciudad">
          <div className="grid grid-cols-3 gap-2">
            {CITIES.map((c) => (
              <Chip
                key={c}
                active={filters.cities.includes(c)}
                onClick={() => toggleCity(c)}
              >
                {c}
              </Chip>
            ))}
          </div>
        </Section>

        {/* Serie */}
        <Section label="Serie">
          <div className="grid grid-cols-2 gap-2">
            {SERIES_OPTIONS.map((s) => (
              <Chip
                key={s.id}
                active={filters.series.includes(s.id)}
                onClick={() => toggleSeries(s.id)}
              >
                {s.label}
              </Chip>
            ))}
          </div>
        </Section>

        {/* Ordenar */}
        <Section label="Ordenar">
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((o) => {
              const active = filters.sort === o.key;
              return (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => set({ sort: o.key })}
                  className={`relative py-2.5 pl-4 pr-3 rounded-xl text-sm text-left cursor-pointer transition-colors duration-150 ease-out transition-transform duration-100 ease-out active:scale-[0.97] ${
                    active
                      ? "text-text-primary font-medium"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                  aria-pressed={active}
                >
                  {active && (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-text-primary"
                    />
                  )}
                  {o.label}
                </button>
              );
            })}
          </div>
        </Section>

        {/* Limpiar */}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="py-3 rounded-xl text-sm font-medium text-text-muted hover:text-text-secondary cursor-pointer transition-colors duration-150 ease-out transition-transform duration-100 ease-out active:scale-[0.97]"
          >
            Limpiar filtros
          </button>
        )}
      </div>
    </BottomSheet>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="eyebrow mb-2.5">{label}</p>
      {children}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`py-2 px-3 rounded-xl text-sm font-medium border cursor-pointer select-none transition-colors duration-150 ease-out transition-transform duration-100 ease-out active:scale-[0.97] ${
        active
          ? "bg-interactive-soft text-text-primary border-interactive-border"
          : "bg-bg-elevated text-text-muted border-border-card hover:text-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}
