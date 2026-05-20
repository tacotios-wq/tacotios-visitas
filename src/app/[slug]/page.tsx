import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { restaurants, dossiers } from "@/data/restaurants";
import { RestaurantPage } from "@/components/restaurant/RestaurantPage";
import { JsonLd } from "@/components/restaurant/JsonLd";

const SITE_URL = "https://tacotios-visitas.vercel.app";

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) return {};

  const dossier = dossiers[r.id] ?? null;
  const description =
    dossier?.hooks?.[0] ??
    dossier?.frase_ancla ??
    r.notes?.replace(/^TIER\s+[SABC]\.\s*/i, "").slice(0, 160).trim() ??
    `${r.name} en ${r.zone}, ${r.city}. ${r.cuisine}.`;

  const url = `${SITE_URL}/${slug}`;
  const ogImage = `${SITE_URL}/api/og/${slug}`;

  return {
    title: `${r.name} · La Anti-Guia`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: r.name,
      description,
      url,
      type: "article",
      siteName: "La Anti-Guia · @tacotios",
      locale: "es_MX",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${r.name} · @tacotios`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@tacotios",
      creator: "@tacotios",
      title: r.name,
      description,
      images: [ogImage],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) notFound();

  const dossier = dossiers[r.id] ?? null;

  return (
    <>
      <JsonLd restaurant={r} dossier={dossier} />
      <RestaurantPage restaurant={r} dossier={dossier} />
    </>
  );
}
