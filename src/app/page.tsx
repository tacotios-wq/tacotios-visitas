"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import { restaurants as seedData, dossiers } from "@/data/restaurants";
import type { Restaurant, FilterState } from "@/types";
import { useDebounce } from "@/hooks/useDebounce";
import { ev } from "@/lib/analytics";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { filterAndSort, countByStatus, searchRestaurants } from "@/lib/filters";
import { Header } from "@/components/layout/Header";
import { FilterSheet } from "@/components/layout/FilterSheet";
import { ActiveFilters } from "@/components/layout/ActiveFilters";
import { CityChips } from "@/components/layout/CityChips";
import { SearchOverlay } from "@/components/ui/SearchOverlay";
import { RestaurantList } from "@/components/restaurant/RestaurantList";
import { RestaurantGrid } from "@/components/restaurant/RestaurantGrid";
import { RestaurantDetail } from "@/components/restaurant/RestaurantDetail";

const RestaurantMap = dynamic(
  () =>
    import("@/components/restaurant/RestaurantMap").then((m) => m.RestaurantMap),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[calc(100dvh-240px)] min-h-[420px] text-text-muted text-sm">
        Cargando mapa…
      </div>
    ),
  }
);

export default function Home() {
  // NOTA: data es de solo lectura por ahora. Cuando Supabase esté conectado,
  // re-introducir setData + markVisited (issue #2).
  const [data] = useState<Restaurant[]>(seedData);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    cities: [],
    series: [],
    sort: "name",
    tab: "pendiente",
  });

  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 150);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Analytics: registrar busquedas con intencion real (>= 3 chars), sin enviar
  // el texto. Debounce propio mas largo para no disparar en cada tecla.
  const searchEventQuery = useDebounce(query, 700);
  useEffect(() => {
    if (searchEventQuery.length >= 3) {
      ev("search", { query_len: searchEventQuery.length });
    }
  }, [searchEventQuery]);

  const filtered = useMemo(
    () => filterAndSort(data, filters),
    [data, filters]
  );

  const searchResults = useMemo(
    () => searchRestaurants(data, debouncedQuery),
    [data, debouncedQuery]
  );

  const counts = useMemo(() => countByStatus(data), [data]);

  const cityCounts = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const r of data) {
      if (r.status !== filters.tab) continue;
      acc[r.city] = (acc[r.city] ?? 0) + 1;
    }
    return acc;
  }, [data, filters.tab]);

  const activeFilterCount =
    filters.cities.length +
    filters.series.length +
    (filters.sort !== "name" ? 1 : 0);

  const selectedRestaurant = selectedId
    ? data.find((r) => r.id === selectedId) ?? null
    : null;

  const selectedDossier = selectedId ? dossiers[selectedId] ?? null : null;

  const isMap = viewMode === "map";

  return (
    <div className="flex flex-col min-h-dvh">
      <Header
        onSearchOpen={() => setSearchOpen(true)}
        onFilterOpen={() => setFilterOpen(true)}
        activeFilterCount={activeFilterCount}
        visited={counts.visitado}
        withDossier={counts.conDossier}
        total={counts.total}
      />

      <CityChips filters={filters} onUpdate={setFilters} counts={cityCounts} />
      <ActiveFilters filters={filters} onUpdate={setFilters} />

      {/* Tabs + View toggle */}
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 border-b border-border-subtle">
          <div className="flex gap-1 overflow-x-auto">
            {(
              [
                { key: "pendiente", label: "Pendientes", count: counts.pendiente },
                { key: "80tacos", label: "80 Tacos", count: counts.tacos80 },
                { key: "visitado", label: "Visitados", count: counts.visitado },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setFilters((f) => ({ ...f, tab: t.key, search: "" }))}
                data-active={filters.tab === t.key}
                className={`tab-underline relative px-4 py-3 text-sm font-medium tab-button cursor-pointer select-none btn-press ${
                  filters.tab === t.key
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-secondary"
                }`}
              >
                <span className="flex items-center gap-2">
                  {t.label}
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold tabular-nums transition-colors duration-200 ${
                      filters.tab === t.key
                        ? "bg-interactive-soft text-text-primary"
                        : "bg-border-subtle text-text-muted"
                    }`}
                  >
                    {t.count}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div className="shrink-0 flex items-center gap-1 pb-2">
            <ViewToggle
              label="Lista"
              active={!isMap}
              onClick={() => setViewMode("list")}
              iconPath="M4 6h16M4 12h16M4 18h16"
            />
            <ViewToggle
              label="Mapa"
              active={isMap}
              onClick={() => setViewMode("map")}
              iconPath="M9 5l-5 2v12l5-2 6 2 5-2V5l-5 2-6-2zM9 5v12M15 7v12"
            />
          </div>
        </div>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {/* List / Grid / Map */}
        <div
          className={`flex-1 overflow-y-auto ${
            selectedId && !isDesktop && !isMap ? "hidden" : ""
          }`}
        >
          <div className={isMap ? "w-full" : "mx-auto max-w-7xl"}>
            {isMap ? (
              <RestaurantMap
                restaurants={filtered}
                onSelect={setSelectedId}
                selectedId={selectedId}
                dossiers={dossiers}
              />
            ) : isDesktop ? (
              <RestaurantGrid
                restaurants={filtered}
                dossiers={dossiers}
                onSelect={setSelectedId}
                selectedId={selectedId}
                currentTab={filters.tab}
              />
            ) : (
              <RestaurantList
                restaurants={filtered}
                dossiers={dossiers}
                onSelect={setSelectedId}
                currentTab={filters.tab}
              />
            )}
          </div>
        </div>

        {/* Detail panel — overlay flotante en desktop (no comprime grid) */}
        {selectedRestaurant && (
          <RestaurantDetail
            restaurant={selectedRestaurant}
            dossier={selectedDossier}
            onBack={() => setSelectedId(null)}
            isDesktop={isDesktop}
          />
        )}
      </main>

      {/* Footer */}
      <footer
        className={`border-t border-border-subtle mt-auto section-surface ${
          selectedId && !isDesktop ? "hidden" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-text-secondary text-xs sm:text-sm">
            Una parte de <span className="text-text-primary">La Vuelta a México en 80 Tacos</span>.
          </p>
          <p className="text-text-muted text-[11px] sm:text-xs italic">
            Viaja como local. — Bourdain
          </p>
        </div>
      </footer>

      {/* Overlays */}
      <SearchOverlay
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        value={query}
        onChange={setQuery}
        results={searchResults}
        onSelect={(id) => {
          setSelectedId(id);
          setSearchOpen(false);
        }}
      />
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onUpdate={setFilters}
      />
    </div>
  );
}

function ViewToggle({
  label,
  active,
  onClick,
  iconPath,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  iconPath: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`h-8 px-3 rounded-lg text-xs tracking-wide flex items-center gap-1.5 btn-press transition-colors duration-150 cursor-pointer ${
        active
          ? "bg-interactive-soft text-text-primary border border-interactive-border"
          : "text-text-muted hover:text-text-secondary border border-transparent"
      }`}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={iconPath} />
      </svg>
      {label}
    </button>
  );
}
