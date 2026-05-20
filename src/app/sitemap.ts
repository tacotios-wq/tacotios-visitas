import type { MetadataRoute } from "next";
import { restaurants } from "@/data/restaurants";

const SITE_URL = "https://tacotios-visitas.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap[number] = {
    url: `${SITE_URL}/`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 1,
  };

  const fichas = restaurants.map((r) => ({
    url: `${SITE_URL}/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : now,
    changeFrequency: "monthly" as const,
    priority: r.has_dossier ? 0.8 : 0.5,
  }));

  return [home, ...fichas];
}
