"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl, { Marker, Popup, type LngLatLike } from "maplibre-gl";
type MapLibreMap = maplibregl.Map;
import "maplibre-gl/dist/maplibre-gl.css";
import type { Restaurant, Dossier } from "@/types";
import {
  getRestaurantCoords,
  MEXICO_ROUTE_CITIES,
  CITY_CENTERS,
  INITIAL_VIEW,
} from "@/lib/coordinates";
import { score100ForDossier, isFeatured100 } from "@/lib/score";

interface RestaurantMapProps {
  restaurants: Restaurant[];
  onSelect: (id: string) => void;
  selectedId: string | null;
  dossiers?: Record<string, Dossier>;
}

// Basemap claro (positron) para alinear con la estetica Apple light del sitio:
// los markers, popups y controles en globals.css estan estilizados para fondo claro.
const MAP_STYLE_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const TACOTIOS_ORANGE = "#1d1d1f";
const FEATURED_GOLD = "#b8731a";
const VISITED_GREEN = "#3a7d44";
const MUTED = "#6e6e73";

// Colorea SIEMPRE en escala 0-100 (score100). El destacado usa el dossier
// (viral_score_predicted) si existe, o el baseline 0-10 x10 como fallback.
function getMarkerColor(r: Restaurant, score100: number): string {
  if (r.status === "visitado") return VISITED_GREEN;
  if (isFeatured100(score100, r.has_dossier)) return FEATURED_GOLD;
  if (r.status === "80tacos") return TACOTIOS_ORANGE;
  return MUTED;
}

export function RestaurantMap({
  restaurants,
  onSelect,
  selectedId,
  dossiers,
}: RestaurantMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Map<string, Marker>>(new Map());
  const popupRef = useRef<Popup | null>(null);
  const [isReady, setIsReady] = useState(false);
  // NOTA: `showRoute`/`routeGeoJSON` eliminados mientras la linea-trazo este
  // deshabilitada (ver TODO en addRouteLayers sobre waypoints reales).

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE_URL,
      center: [INITIAL_VIEW.longitude, INITIAL_VIEW.latitude] as LngLatLike,
      zoom: INITIAL_VIEW.zoom,
      attributionControl: { compact: true },
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    const addRouteLayers = () => {
      if (!map.getStyle()) return;

      // TODO (bloqueado — necesita waypoints reales del viaje):
      // La linea-trazo entre ciudades fue retirada porque la secuencia
      // codificada no coincide con la ruta real de La Vuelta a Mexico
      // (saltos geograficos incoherentes). Los city labels numerados
      // quedan como indice narrativo (las ciudades SI son reales).
      //
      // Para re-activar el trazo:
      //   1) Sustituir MEXICO_ROUTE_CITIES + getRouteCoordinates() en
      //      lib/coordinates.ts con los waypoints reales del viaje
      //      (extraer de Notion VUELTA-80-TACOS o dictar a Aniol).
      //   2) Descomentar el bloque "ROUTE LINE" de abajo.
      //   3) Restaurar el toggle pill "La Vuelta a Mexico" en el return.
      //
      // ── ROUTE LINE (comentado hasta tener ruta real) ──────────
      // if (!map.getSource("route")) {
      //   map.addSource("route", { type: "geojson", data: routeGeoJSON });
      // }
      // map.addLayer({ id: "route-glow", type: "line", source: "route",
      //   layout: { "line-cap": "round", "line-join": "round" },
      //   paint: { "line-color": TACOTIOS_ORANGE, "line-width": 8,
      //     "line-opacity": 0.18, "line-blur": 6 } });
      // map.addLayer({ id: "route-line", type: "line", source: "route",
      //   layout: { "line-cap": "round", "line-join": "round" },
      //   paint: { "line-color": TACOTIOS_ORANGE, "line-width": 2,
      //     "line-opacity": 0.85, "line-dasharray": [2, 1.5] } });

      for (const city of MEXICO_ROUTE_CITIES) {
        const center = CITY_CENTERS[city.city];
        if (!center) continue;
        const el = document.createElement("div");
        el.className = "tacotios-city-label";
        el.textContent = `${String(city.order).padStart(2, "0")} · ${city.label}`;
        new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, -14] })
          .setLngLat([center.lng, center.lat])
          .addTo(map);
      }
    };

    const onStyleLoad = () => {
      addRouteLayers();
    };

    if (map.isStyleLoaded()) {
      addRouteLayers();
    } else {
      map.on("style.load", onStyleLoad);
    }

    mapRef.current = map;
    setIsReady(true);

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current.clear();
      popupRef.current?.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;

    const existing = markersRef.current;
    const nextIds = new Set(restaurants.map((r) => r.id));

    for (const [id, marker] of existing.entries()) {
      if (!nextIds.has(id)) {
        marker.remove();
        existing.delete(id);
      }
    }

    for (const r of restaurants) {
      // Si el marker ya existe, actualizar color/status/featured por si
      // cambio (p.ej. marcar visitado) — bug previo: solo se creaba, nunca
      // se repintaba.
      const score100 = score100ForDossier(r.viral_score, dossiers?.[r.id]);
      const featured = isFeatured100(score100, r.has_dossier);
      const existingMarker = existing.get(r.id);
      if (existingMarker) {
        const el = existingMarker.getElement() as HTMLElement;
        el.style.setProperty("--marker-color", getMarkerColor(r, score100));
        el.dataset.status = r.status;
        el.dataset.featured = String(featured);
        continue;
      }
      const { lat, lng } = getRestaurantCoords(r);
      const el = document.createElement("button");
      el.className = "tacotios-marker";
      el.setAttribute("aria-label", r.name);
      el.style.setProperty("--marker-color", getMarkerColor(r, score100));
      el.dataset.status = r.status;
      el.dataset.featured = String(featured);

      el.addEventListener("click", (ev) => {
        ev.stopPropagation();
        onSelect(r.id);
      });

      el.addEventListener("mouseenter", () => {
        popupRef.current?.remove();
        popupRef.current = new maplibregl.Popup({
          closeButton: false,
          offset: 18,
          className: "tacotios-popup",
          maxWidth: "240px",
        })
          .setLngLat([lng, lat])
          .setHTML(
            `<div class="tp-title">${escapeHtml(r.name)}</div>
             <div class="tp-meta">${escapeHtml(r.zone)} · ${escapeHtml(r.city)}</div>
             <div class="tp-cuisine">${escapeHtml(r.cuisine)}</div>`
          )
          .addTo(map);
      });

      el.addEventListener("mouseleave", () => {
        popupRef.current?.remove();
        popupRef.current = null;
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
      existing.set(r.id, marker);
    }
  }, [restaurants, onSelect, isReady, dossiers]);

  // useEffect de toggle de ruta eliminado — se restaurara junto con el
  // trazo cuando haya waypoints reales (ver TODO en addRouteLayers).

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady || !selectedId) return;
    const r = restaurants.find((x) => x.id === selectedId);
    if (!r) return;
    const { lat, lng } = getRestaurantCoords(r);
    map.flyTo({ center: [lng, lat], zoom: Math.max(map.getZoom(), 13), speed: 1.2 });
  }, [selectedId, restaurants, isReady]);

  useEffect(() => {
    for (const [id, marker] of markersRef.current.entries()) {
      marker.getElement().dataset.selected = String(id === selectedId);
    }
  }, [selectedId, restaurants]);

  return (
    <div
      className="relative w-full h-[calc(100dvh-240px)] min-h-[280px]"
      role="region"
      aria-label={`Mapa interactivo de ${restaurants.length} restaurantes de La Anti-Guía de México`}
    >
      <div
        ref={containerRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        aria-hidden="true"
      />

      <div className="absolute bottom-3 left-3 z-10 flex flex-wrap gap-2 glass px-3 py-2 text-[11px] uppercase tracking-[0.14em]">
        <Legend color={TACOTIOS_ORANGE} label="Pendiente" />
        <Legend color={FEATURED_GOLD} label="Destacado" />
        <Legend color={VISITED_GREEN} label="Visitado" />
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-text-muted">
      <span
        className="inline-block w-2 h-2 rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}66` }}
      />
      {label}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
