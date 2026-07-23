"use client";

import type { Restaurant, Dossier, TabKey } from "@/types";
import { RestaurantListItem } from "./RestaurantListItem";

interface RestaurantListProps {
  restaurants: Restaurant[];
  dossiers: Record<string, Dossier>;
  onSelect: (id: string) => void;
  currentTab?: TabKey;
}

export function RestaurantList({
  restaurants,
  dossiers,
  onSelect,
  currentTab,
}: RestaurantListProps) {
  if (restaurants.length === 0) {
    if (currentTab === "visitado") {
      return (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
          <h2 className="font-editorial text-2xl text-text-primary max-w-sm">
            El viaje empieza{" "}
            <span className="editorial-italic text-text-secondary">aqui</span>.
          </h2>
          <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
            Todavia no marcaste ninguna visita. Cuando lo hagas, aparecen aqui.
          </p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center px-6">
        <h2 className="font-editorial text-2xl text-text-primary max-w-sm">
          Nada por aqui{" "}
          <span className="editorial-italic text-text-muted">todavia</span>.
        </h2>
        <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
          Ningun lugar encaja con esos filtros. Prueba quitando alguno.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 sm:px-6 py-4">
      {restaurants.map((r, i) => (
        <RestaurantListItem
          key={r.id}
          restaurant={r}
          hasDossier={!!dossiers[r.id]}
          onClick={() => onSelect(r.id)}
          index={i}
        />
      ))}
    </div>
  );
}
