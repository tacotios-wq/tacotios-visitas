"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Restaurant, Dossier } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { DossierView } from "@/components/dossier/DossierView";
import { getTier, tierClassName, tierLabel } from "@/lib/tier";
import { resolveScore100 } from "@/lib/score";
import { ev } from "@/lib/analytics";
import { openMaps, shareRestaurant } from "@/lib/share";
import { DiamantesSection } from "./DiamantesSection";
import { RestaurantImagePlaceholder } from "./RestaurantImagePlaceholder";

interface RestaurantPageProps {
  restaurant: Restaurant;
  dossier: Dossier | null;
}

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="#f0f0f2" width="1" height="1"/></svg>'
  );

export function RestaurantPage({
  restaurant: r,
  dossier,
}: RestaurantPageProps) {
  const tier = getTier(r);
  const score = r.viral_score ?? 0;
  const dotsFilled = Math.min(Math.round(score / 2), 5);
  const notesClean = r.notes?.replace(/^TIER\s+[SABC]\.\s*/i, "").trim();
  const [copied, setCopied] = useState(false);
  // Score viral 0-100 (HIPOTESIS de potencial). Solo banda predicha cuando el
  // dossier trae viral_score_predicted.
  const scorePredicted = dossier?.viral_score_predicted ?? null;
  const score100 = resolveScore100(scorePredicted, r.viral_score);
  const hasGuion = !!(
    dossier?.hook_principal ||
    dossier?.guion_escaleta ||
    (dossier?.guion_beats && dossier.guion_beats.length > 0)
  );

  const handleShare = async () => {
    const result = await shareRestaurant(r);
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary">
      {/* ── HEADER MINIMAL ── */}
      <header className="fixed top-0 left-0 right-0 z-40 glass-header border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="text-sm uppercase tracking-[0.18em] text-text-primary hover:opacity-70 transition-opacity duration-150"
          >
            ← La Anti-Guia
          </Link>
          <Link
            href="https://instagram.com/tacotios"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs uppercase tracking-[0.16em] text-text-muted hover:text-text-primary transition-colors duration-150"
          >
            @tacotios
          </Link>
        </div>
      </header>

      {/* ── HERO IMAGE ── */}
      <div className="relative h-[60vh] min-h-[420px] max-h-[640px] overflow-hidden mt-14">
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            sizes="100vw"
            priority
            fetchPriority="high"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <RestaurantImagePlaceholder name={r.name} seed={r.slug} size="lg" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />

        <div className="absolute top-4 right-4 z-10 flex gap-1.5 items-start">
          {tier && (
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${tierClassName(tier)}`}
              title={tierLabel(tier)}
            >
              Tier {tier}
            </span>
          )}
          {r.series.map((s) => (
            <Badge
              key={s.id}
              variant="series"
              label={s.short_name}
              color={s.color}
              size="md"
            />
          ))}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 pb-6 z-10">
          <p className="text-[11px] uppercase tracking-[0.18em] text-white/75 mb-2">
            {r.zone} · {r.city}
          </p>
          <h1 className="editorial-display text-3xl sm:text-5xl lg:text-6xl text-white max-w-3xl">
            {r.name}
          </h1>
          <p className="text-white/80 text-sm sm:text-base mt-2">{r.cuisine}</p>
        </div>
      </div>

      {/* ── INFO STRIP ── */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 mt-6 relative z-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 border-y border-border-subtle">
          <Badge
            variant="status"
            label={
              r.status === "pendiente"
                ? "Por visitar"
                : r.status === "visitado"
                  ? "Visitado"
                  : "80 Tacos"
            }
            size="md"
          />

          {score > 0 && (
            <div className="flex items-center gap-2">
              <div className="rating-dots" aria-label={`${score} de 10`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`rating-dot ${i < dotsFilled ? "filled" : ""} ${
                      tier === "S" ? "featured" : ""
                    }`}
                  />
                ))}
              </div>
              <span className="text-text-muted text-[11px] tabular-nums">
                {score}/10
              </span>
            </div>
          )}

          {r.has_dossier && (
            <span className="inline-flex items-center gap-1.5 text-text-primary text-[11px] font-medium uppercase tracking-[0.1em]">
              <span className="w-1.5 h-1.5 rounded-full bg-text-primary" />
              Dossier listo
            </span>
          )}

          {/* Score viral predicho (0-100, HIPOTESIS) */}
          {scorePredicted != null && (
            <span
              className="inline-flex items-center gap-2 rounded-full border border-[#b8731a]/40 bg-[#b8731a]/10 pl-2.5 pr-3 py-1"
              title="Score viral estimado por el atlas. Es una hipotesis de potencial, no una prediccion de views."
            >
              <span className="text-[#a45e09] text-[13px] font-semibold tabular-nums">
                {score100}
                <span className="text-[#a45e09]/60 text-[11px]">/100</span>
              </span>
              <span className="text-[#a45e09] text-[10px] uppercase tracking-[0.12em]">
                estimado · hipotesis
              </span>
            </span>
          )}

          {/* Link al guion */}
          {hasGuion && (
            <a
              href="#guion"
              className="inline-flex items-center gap-1.5 text-text-primary text-[11px] font-medium uppercase tracking-[0.1em] underline underline-offset-4 decoration-text-muted hover:decoration-text-primary"
            >
              Ver guion ↓
            </a>
          )}
        </div>

        {notesClean && (
          <p className="prose-editorial text-text-secondary text-base leading-relaxed mt-5 max-w-2xl">
            {notesClean}
          </p>
        )}
      </div>

      {/* ── DOSSIER ── */}
      <div className="mx-auto max-w-3xl px-5 sm:px-6 mt-8 pb-[calc(7rem+env(safe-area-inset-bottom))]">
        {dossier ? (
          <DossierView dossier={dossier} restaurantImage={r.image_url} restaurantName={r.name} />
        ) : (
          <div className="py-10 border-t border-border-subtle text-left">
            <p className="eyebrow mb-3">Dossier</p>
            <h3 className="editorial-display text-2xl text-text-primary">
              Todavia no escribi esto.{" "}
              <span className="editorial-italic text-text-muted">
                Fue. Valio. El resto, pronto.
              </span>
            </h3>
          </div>
        )}

        <DiamantesSection diamantes={dossier?.diamantes} />

        {/* ── GUION (escaleta @tacotios) ── */}
        {hasGuion && (
          <section id="guion" className="mt-10 pt-8 border-t border-border-subtle scroll-mt-24">
            <p className="eyebrow mb-3">Guion</p>
            {dossier?.hook_principal && (
              <blockquote className="editorial-display text-xl sm:text-2xl text-text-primary leading-snug max-w-2xl">
                “{dossier.hook_principal}”
              </blockquote>
            )}
            {dossier?.guion_escaleta && (
              <p className="prose-editorial text-text-secondary text-[15px] leading-relaxed mt-4 max-w-2xl">
                {dossier.guion_escaleta}
              </p>
            )}
            {dossier?.guion_beats && dossier.guion_beats.length > 0 && (
              <ol className="mt-6 space-y-3 max-w-2xl">
                {dossier.guion_beats.map((b, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="shrink-0 w-12 text-right text-text-muted text-xs tabular-nums pt-0.5">
                      {b.t_s}s
                    </span>
                    <span className="text-text-secondary text-[15px] leading-relaxed border-l border-border-subtle pl-4">
                      {b.desc}
                    </span>
                  </li>
                ))}
              </ol>
            )}
            {dossier?.zona_silencio_narrativo &&
              dossier.zona_silencio_narrativo.length > 0 && (
                <p className="text-text-muted text-[11px] uppercase tracking-[0.1em] mt-6">
                  Silencio:{" "}
                  {dossier.zona_silencio_narrativo
                    .map((z) => `${z.t_s}s (${z.dur_s}s)`)
                    .join(" · ")}
                </p>
              )}
          </section>
        )}
      </div>

      {/* ── STICKY BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 glass-header border-t border-border-subtle">
        <div
          className="mx-auto max-w-3xl flex gap-3 px-5 pt-3"
          style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => {
              ev("open_maps", { restaurant: r.name });
              openMaps(r);
            }}
            className="flex-1 py-3 px-4 rounded-full bg-text-primary text-bg-primary text-sm font-semibold transition-transform duration-150 cursor-pointer active:scale-[0.97]"
          >
            Abrir en Maps
          </button>
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-bg-surface border border-border-subtle flex items-center justify-center text-text-primary transition-transform duration-150 cursor-pointer active:scale-[0.97]"
            aria-label={copied ? "Copiado" : "Compartir"}
          >
            {copied ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="animate-share-pop"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 3v12" />
                <path d="m8 7 4-4 4 4" />
                <path d="M5 10h2" />
                <path d="M17 10h2" />
                <path d="M5 10v9a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-9" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
