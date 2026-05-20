import type { Restaurant, Dossier } from "@/types";

const SITE_URL = "https://tacotios-visitas.vercel.app";

export function JsonLd({
  restaurant: r,
  dossier,
}: {
  restaurant: Restaurant;
  dossier: Dossier | null;
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    url: `${SITE_URL}/${r.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: r.zone,
      addressRegion: r.city,
      addressCountry: "MX",
    },
  };

  if (r.cuisine) data.servesCuisine = r.cuisine;
  if (r.image_url) data.image = r.image_url;

  if (dossier?.historia && r.viral_score) {
    data.review = {
      "@type": "Review",
      author: {
        "@type": "Person",
        name: "Aniol Guell",
        alternateName: "@tacotios",
        url: "https://instagram.com/tacotios",
      },
      reviewBody: dossier.historia.slice(0, 500),
      reviewRating: {
        "@type": "Rating",
        ratingValue: Math.round((r.viral_score / 2) * 10) / 10,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }

  if (dossier?.tesis_central) {
    data.description = dossier.tesis_central.slice(0, 300);
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
