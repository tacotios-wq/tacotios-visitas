import type { Restaurant } from "@/types";

const SITE_URL = "https://tacotios-visitas.vercel.app";

/** URL canonica de la ficha (ruta real /[slug], no el homepage). */
export function restaurantUrl(r: Restaurant): string {
  return `${SITE_URL}/${r.slug}`;
}

/** Abre Google Maps con la busqueda del restaurante. */
export function openMaps(r: Restaurant): void {
  if (typeof window === "undefined") return;
  const q = encodeURIComponent(`${r.name} ${r.zone} ${r.city}`);
  window.open(
    `https://www.google.com/maps/search/?api=1&query=${q}`,
    "_blank",
    "noopener,noreferrer",
  );
}

export type ShareResult = "shared" | "copied" | "error";

/**
 * Comparte la ficha: Web Share API nativo (clave en movil/WhatsApp) con
 * fallback a copiar al portapapeles. Cancelar el share nativo NO es error.
 */
export async function shareRestaurant(r: Restaurant): Promise<ShareResult> {
  const url = restaurantUrl(r);
  const text = `${r.name} en La Anti-Guia de @tacotios`;
  try {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      await navigator.share({ title: r.name, text, url });
      return "shared";
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return "shared";
    /* fall through a clipboard */
  }
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      return "copied";
    }
  } catch {
    /* noop */
  }
  return "error";
}
