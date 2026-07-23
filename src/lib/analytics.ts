import { track } from "@vercel/analytics";

type EventData = Record<string, string | number | boolean | null>;

/**
 * Dispara un evento custom de Vercel Analytics.
 * No-op en servidor y fuera de produccion. Nunca rompe la UI.
 *
 * Eventos del producto:
 *  - audio_play        { restaurant }   el feature estrella (audio en el Uber)
 *  - restaurant_view   { restaurant }   que fichas se abren mas
 *  - open_maps         { restaurant }   intencion real de ir
 *  - search            { query_len }    que se busca (sin PII: solo longitud)
 */
export function ev(name: string, data?: EventData): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  try {
    track(name, data);
  } catch {
    /* analytics no es critico: nunca propagar */
  }
}
