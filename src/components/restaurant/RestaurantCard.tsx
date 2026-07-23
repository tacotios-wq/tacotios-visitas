"use client";

import { memo, useState } from "react";
import Image from "next/image";
import type { Restaurant } from "@/types";
import { getTier, tierClassName, tierLabel } from "@/lib/tier";
import { ev } from "@/lib/analytics";
import { shareRestaurant } from "@/lib/share";
import { RestaurantImagePlaceholder } from "./RestaurantImagePlaceholder";

interface RestaurantCardProps {
  restaurant: Restaurant;
  isFeatured: boolean;
  hasDossier: boolean;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="#f0f0f2" width="1" height="1"/></svg>'
  );

export const RestaurantCard = memo(function RestaurantCard({
  restaurant: r,
  isFeatured: _isFeaturedProp,
  hasDossier,
  isSelected,
  onClick,
  index,
}: RestaurantCardProps) {
  const [copied, setCopied] = useState(false);
  const delay = Math.min(index, 10) * 40;
  const tier = getTier(r);

  function handleClick() {
    ev("restaurant_view", { restaurant: r.name });
    onClick();
  }

  async function handleShare(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    ev("share", { restaurant: r.name, surface: "card" });
    const result = await shareRestaurant(r);
    if (result === "copied") {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  }
  // TIER S sobreescribe el flag externo de "featured" para dar prioridad visual al ranking real.
  const isFeatured = tier === "S" || _isFeaturedProp;
  const score = r.viral_score ?? 0;
  const dotsFilled = Math.min(Math.round(score / 2), 5);

  return (
    <button
      onClick={handleClick}
      className={`animate-fade-up text-left rounded-2xl overflow-hidden cursor-pointer select-none active:scale-[0.98] hover-lift transition-[transform,border-color,box-shadow] duration-200 border ${
        isSelected
          ? "border-interactive-border ring-1 ring-interactive/20"
          : isFeatured
          ? "border-warm-border/60"
          : "border-border-card"
      } ${isFeatured ? "glass glass-featured col-span-1 lg:col-span-2" : "glass"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Image */}
      <div
        className={`relative overflow-hidden bg-bg-elevated ${
          isFeatured ? "h-72" : "h-52"
        }`}
      >
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            sizes={
              isFeatured
                ? "(max-width: 768px) 100vw, 640px"
                : "(max-width: 768px) 100vw, 320px"
            }
            className="object-cover card-image-zoom"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <RestaurantImagePlaceholder
            name={r.name}
            seed={r.slug}
            size={isFeatured ? "lg" : "md"}
          />
        )}

        {/* Gradient overlay (negro semi-translucido para legibilidad de titulo blanco) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent pointer-events-none" />

        {/* TIER badge - top left */}
        {tier && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded text-[10px] font-bold tracking-wider uppercase ${tierClassName(tier)}`}
              title={tierLabel(tier)}
            >
              Tier {tier}
            </span>
          </div>
        )}

        {/* Series badges - top right */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {r.series.map((s) => (
            <span
              key={s.id}
              className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
              style={{
                backgroundColor: `${s.color}22`,
                color: s.color,
                borderColor: `${s.color}44`,
                border: "1px solid",
              }}
            >
              {s.short_name}
            </span>
          ))}
        </div>

        {/* Share - bottom right of image (growth loop: mandar la ficha por WhatsApp) */}
        <span
          role="button"
          tabIndex={0}
          aria-label="Compartir"
          onClick={handleShare}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleShare(e as unknown as React.MouseEvent);
            }
          }}
          className="btn-press absolute bottom-3 right-3 z-10 flex min-h-10 min-w-10 items-center justify-center gap-1.5 rounded-lg bg-bg-surface/85 px-2.5 text-text-secondary backdrop-blur-sm border border-border-card cursor-pointer transition-colors hover:text-accent"
        >
          {copied ? (
            <span className="text-[11px] font-semibold tracking-wide text-accent">
              Copiado
            </span>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          )}
        </span>

        {/* Title overlay on image (featured only) - pr-12 deja aire para el boton de compartir */}
        {isFeatured && (
          <div className="absolute bottom-4 left-4 right-4 pr-12">
            <h3 className="font-editorial text-2xl sm:text-3xl text-white leading-[1.05] tracking-tight line-clamp-2">
              {r.name}
            </h3>
            <p className="text-white/70 text-xs uppercase tracking-[0.15em] mt-1.5">
              {r.zone} · {r.city}
            </p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2.5">
        {!isFeatured && (
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-editorial text-lg text-text-primary leading-[1.15] tracking-tight line-clamp-2 flex-1">
                {r.name}
              </h3>
              {hasDossier && (
                <span
                  className="shrink-0 w-1.5 h-1.5 rounded-full bg-text-primary mt-2"
                  title="Con dossier"
                />
              )}
            </div>
            <p className="text-text-muted text-[10px] uppercase tracking-[0.15em] mt-1">
              {r.zone} · {r.city}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-text-secondary text-xs truncate flex-1">
            {r.cuisine}
          </span>

          {/* Dot rating */}
          {score > 0 && (
            <div className="rating-dots shrink-0" aria-label={`${score} de 10`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`rating-dot ${i < dotsFilled ? "filled" : ""} ${
                    isFeatured ? "featured" : ""
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </button>
  );
});
