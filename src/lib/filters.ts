import type { Restaurant, FilterState, CityFilter, SeriesFilter } from "@/types";

function matchesTab(r: Restaurant, tab: FilterState["tab"]): boolean {
  // Cada tab filtra SOLO su status — sin solapes.
  //   "pendiente" → restaurantes que voy a visitar (88, no incluye 80 Tacos)
  //   "80tacos"   → Vuelta a Mexico en 80 Tacos (12)
  //   "visitado"  → ya visitados
  // Los 3 tabs son mutuamente excluyentes; suman al total (100).
  return r.status === tab;
}

export function filterAndSort(
  data: Restaurant[],
  filters: FilterState
): Restaurant[] {
  // 1. Filtrar por tab activo
  let list = data.filter((r) => matchesTab(r, filters.tab));

  // 2. Aplicar busqueda dentro del tab (respeta el contexto del usuario)
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.zone.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q)
    );
  }

  // 3. Filtros adicionales (ciudad, serie)
  if (filters.cities.length > 0) {
    list = list.filter((r) =>
      filters.cities.includes(r.city as CityFilter)
    );
  }

  if (filters.series.length > 0) {
    list = list.filter((r) =>
      r.series.some((s) => filters.series.includes(s.id as SeriesFilter))
    );
  }

  // 4. Ordenamiento
  return [...list].sort((a, b) => {
    if (filters.sort === "name") return a.name.localeCompare(b.name);
    if (filters.sort === "score")
      return (b.viral_score ?? 0) - (a.viral_score ?? 0);
    if (filters.sort === "city") return a.city.localeCompare(b.city);
    return 0;
  });
}

export function countByStatus(data: Restaurant[]) {
  const total = data.length;
  // Los 3 contadores son exclusivos y suman al total.
  const pendiente = data.filter((r) => r.status === "pendiente").length;
  const visitado = data.filter((r) => r.status === "visitado").length;
  const tacos80 = data.filter((r) => r.status === "80tacos").length;
  const conDossier = data.filter((r) => r.has_dossier).length;
  return { total, pendiente, visitado, tacos80, conDossier };
}

// Insensible a acentos: "puebla" encuentra "Puébla", "tacos" encuentra "Tácos".
function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// Puntua la relevancia de un restaurante frente a la query.
// Prefijo de nombre pesa mas que coincidencia parcial; nombre pesa mas que zona/ciudad/cocina/serie.
function searchScore(r: Restaurant, q: string): number {
  const name = normalize(r.name);
  const zone = normalize(r.zone);
  const city = normalize(r.city);
  const cuisine = normalize(r.cuisine);

  if (name.startsWith(q)) return 100;
  if (name.includes(q)) return 60;
  if (zone.includes(q) || city.includes(q)) return 40;
  if (cuisine.includes(q)) return 30;
  if (r.series.some((s) => normalize(s.name).includes(q) || normalize(s.short_name).includes(q))) return 20;
  return 0;
}

// Busqueda GLOBAL (ignora tab/ciudad/serie): el buscador salta a cualquier lugar de la guia.
export function searchRestaurants(
  data: Restaurant[],
  query: string,
  limit = 24
): Restaurant[] {
  const q = normalize(query);
  if (!q) return [];
  return data
    .map((r) => ({ r, score: searchScore(r, q) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.r.name.localeCompare(b.r.name);
    })
    .slice(0, limit)
    .map((x) => x.r);
}
