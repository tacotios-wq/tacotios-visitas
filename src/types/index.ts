export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  zone: string;
  city: string;
  cuisine: string;
  status: "pendiente" | "visitado" | "80tacos";
  image_url: string | null;
  viral_score: number | null;
  notes: string | null;
  content_links: string[];
  visited_at: string | null;
  created_at: string;
  updated_at: string;
  series: Series[];
  has_dossier: boolean;
}

export interface Series {
  id: string;
  name: string;
  short_name: string;
  color: string;
  icon: string | null;
}

export interface Dossier {
  id: string;
  restaurant_id: string;
  historia: string | null;
  hooks: string[];
  datos: string[];
  pedir: { name: string; why: string }[];
  preguntas: { role: string; texto: string }[];
  candidatura_status: "si" | "watch" | "no";
  candidatura_razon: string | null;
  angulo: string | null;
  alertas: string[];
  audio_url?: string | null;
  audio_duration_s?: number | null;
  video_url?: string | null;
  video_duration_s?: number | null;
  notebook_url?: string | null;
  emocion_target?: string | null;
  frase_ancla?: string | null;
  tesis_central?: string | null;
  prepared_at?: string | null;
}

export type TabKey = "pendiente" | "visitado" | "80tacos";
export type SortKey = "name" | "score" | "city";
export type CityFilter = "CDMX" | "GDL" | "MTY" | "Ensenada" | "Oaxaca" | "Puebla" | "Mazatlan" | "Napoles" | "La Paz";
export type SeriesFilter = "lsdt" | "80tacos" | "lala" | "beteta" | "estadios" | "espanoles" | "omega-cdmx" | "ensenada" | "oaxaca" | "puebla" | "mazatlan" | "napoles" | "la-paz";

export type ViewMode = "list" | "grid" | "map";

export interface FilterState {
  search: string;
  cities: CityFilter[];
  series: SeriesFilter[];
  sort: SortKey;
  tab: TabKey;
}

export type DossierSectionKey =
  | "historia"
  | "hooks"
  | "datos"
  | "pedir"
  | "preguntas"
  | "candidatura"
  | "angulo"
  | "alertas";
