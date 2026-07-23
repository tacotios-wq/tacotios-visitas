import type { Restaurant } from "@/types";

export type Tier = "S" | "A" | "B" | "C" | null;

/**
 * Extrae el TIER (S/A/B/C) del campo notes si esta presente.
 * Convencion: "TIER S. ..." al inicio del string de notes.
 */
export function getTier(restaurant: Restaurant): Tier {
  if (!restaurant.notes) return null;
  const match = restaurant.notes.match(/TIER\s+([SABC])\b/i);
  if (!match) return null;
  return match[1].toUpperCase() as Tier;
}

export function tierClassName(tier: Tier): string {
  if (tier === "S") return "tier-s";
  if (tier === "A") return "tier-a";
  if (tier === "B") return "tier-b";
  if (tier === "C") return "tier-c";
  return "";
}

export function tierLabel(tier: Tier): string {
  if (!tier) return "";
  return `TIER ${tier}`;
}
