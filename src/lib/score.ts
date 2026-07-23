import type { Dossier } from "@/types";

/**
 * Escala canonica del atlas: el score viral se colorea SIEMPRE en 0-100.
 *
 * Coexisten dos fuentes:
 *  - `dossier.viral_score_predicted` (0-100, predictivo, HIPOTESIS) — preferente.
 *  - `restaurant.viral_score` (0-10, baseline manual de los 161) — fallback.
 *
 * El baseline 0-10 se multiplica x10 ANTES de comparar; nunca se mezclan
 * escalas crudas (un 8 baseline y un 80 predicted son el mismo nivel).
 */
export function resolveScore100(
  viralScorePredicted: number | null | undefined,
  viralScoreBaseline: number | null | undefined
): number {
  if (viralScorePredicted != null) return viralScorePredicted;
  return (viralScoreBaseline ?? 0) * 10;
}

/** Umbral "destacado" en escala 0-100 (equivale al >=8 baseline previo). */
export const FEATURED_THRESHOLD_100 = 80;

/** True si el lugar debe pintarse como destacado (oro) en el mapa. */
export function isFeatured100(score100: number, hasDossier: boolean): boolean {
  return score100 >= FEATURED_THRESHOLD_100 && hasDossier;
}

/** Score 0-100 resuelto para un lugar, dado su dossier (si existe). */
export function score100ForDossier(
  viralScoreBaseline: number | null | undefined,
  dossier: Dossier | null | undefined
): number {
  return resolveScore100(dossier?.viral_score_predicted, viralScoreBaseline);
}
