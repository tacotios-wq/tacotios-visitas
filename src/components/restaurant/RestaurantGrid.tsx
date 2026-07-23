"use client";

import type { Restaurant, Dossier, TabKey } from "@/types";
import { RestaurantCard } from "./RestaurantCard";

interface RestaurantGridProps {
  restaurants: Restaurant[];
  dossiers: Record<string, Dossier>;
  onSelect: (id: string) => void;
  selectedId: string | null;
  currentTab?: TabKey;
}

export function RestaurantGrid({
  restaurants,
  dossiers,
  onSelect,
  selectedId,
  currentTab,
}: RestaurantGridProps) {
  if (restaurants.length === 0) {
    if (currentTab === "visitado") {
      return (
        <div className="flex flex-col items-start py-24 gap-4 px-6 sm:px-10 max-w-xl">
          <h2 className="font-editorial text-3xl sm:text-4xl text-text-primary">
            El viaje empieza{" "}
            <span className="editorial-italic text-text-secondary">aqui</span>.
          </h2>
          <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md">
            Todavia no marcaste ninguna visita. Cuando lo hagas, aparecen aqui.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-start py-24 gap-4 px-6 sm:px-10 max-w-xl">
        <h2 className="font-editorial text-3xl sm:text-4xl text-text-primary">
          Nada por aqui{" "}
          <span className="editorial-italic text-text-muted">todavia</span>.
        </h2>
        <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md">
          Ningun lugar encaja con esos filtros. Prueba quitando alguno.
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      <div
        className="grid gap-5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))" }}
      >
        {restaurants.map((r, i) => {
          const isFeatured = (r.viral_score ?? 0) >= 8 && r.has_dossier;
          return (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              isFeatured={isFeatured}
              hasDossier={!!dossiers[r.id]}
              isSelected={selectedId === r.id}
              onClick={() => onSelect(r.id)}
              index={i}
            />
          );
        })}
      </div>
    </div>
  );
}
