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

/** Un beat de la escaleta del guion (segundo + descripcion). */
export interface Beat {
  t_s: number;
  desc: string;
}

/** Zona de silencio narrativo (segundo de inicio + duracion). */
export interface ZonaSilencio {
  t_s: number;
  dur_s: number;
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
  // Campos atlas (todos opcionales — no rompen los dossiers existentes).
  // El score es HIPOTESIS de potencial (0-100), nunca prediccion.
  viral_score_predicted?: number | null;
  guion_escaleta?: string | null;
  guion_beats?: Beat[];
  hook_principal?: string | null;
  zona_silencio_narrativo?: ZonaSilencio[];
  newsletter_resumen?: string | null;
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
