"use client";

import { useState } from "react";
import { AudioPlayer } from "./AudioPlayer";
import { VideoPlayer } from "./VideoPlayer";
import { Collapse } from "@/components/ui/Collapse";
import { Reveal } from "@/components/ui/Reveal";
import type { Dossier } from "@/types";

interface PreparacionMentalSectionProps {
  dossier: Dossier;
  restaurantImage?: string | null;
  restaurantName?: string;
}

export function PreparacionMentalSection({ dossier, restaurantImage, restaurantName }: PreparacionMentalSectionProps) {
  const [open, setOpen] = useState(true);

  const hasAudio = !!dossier.audio_url;
  const hasVideo = !!dossier.video_url;
  const hasNotebook = !!dossier.notebook_url;

  if (!hasAudio && !hasVideo && !hasNotebook) return null;

  const emocionLabel = dossier.emocion_target?.replace("_", " ");

  return (
    <Reveal as="section" threshold={0.2} className="border-b border-border-subtle py-12 sm:py-16">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between mb-6 group cursor-pointer btn-press"
        aria-expanded={open}
      >
        <span className="flex flex-col items-start gap-1.5">
          <span className="eyebrow text-accent">00 · Antes de ir{emocionLabel ? ` · ${emocionLabel}` : ""}</span>
          <span className="font-editorial text-2xl sm:text-3xl text-text-primary">Escúchalo de camino</span>
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`text-text-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <Collapse open={open}>
        <div className="flex flex-col gap-8">
          {/* El audio va primero: es lo que se usa en el Uber, de camino. */}
          {(hasAudio || hasVideo) && (
            <div className={hasAudio && hasVideo ? "grid gap-5 lg:grid-cols-[1.6fr_1fr] lg:items-start" : ""}>
              {hasAudio && (
                <AudioPlayer
                  src={dossier.audio_url!}
                  title={restaurantName ?? "Audio de preparacion"}
                  artist="Tacotios · Antes de ir"
                  artwork={restaurantImage}
                  duration_s={dossier.audio_duration_s}
                />
              )}
              {hasVideo && (
                <VideoPlayer
                  src={dossier.video_url!}
                  title="Ve antes de entrar"
                  poster={restaurantImage ?? undefined}
                  duration_s={dossier.video_duration_s}
                />
              )}
            </div>
          )}

          {dossier.frase_ancla && (
            <p className="quote">
              &ldquo;{dossier.frase_ancla}&rdquo;
            </p>
          )}

          {dossier.tesis_central && (
            <p className="prose-editorial text-text-secondary text-base leading-relaxed max-w-2xl">
              {dossier.tesis_central}
            </p>
          )}

          {hasNotebook && (
            <a
              href={dossier.notebook_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="eyebrow inline-flex items-center gap-2 hover:text-text-primary transition-colors self-start"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 1h4v4M5 7l6-6M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Notebook completo
            </a>
          )}

          {dossier.prepared_at && (
            <p className="eyebrow">
              Preparado · {new Date(dossier.prepared_at).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          )}
        </div>
      </Collapse>
    </Reveal>
  );
}
