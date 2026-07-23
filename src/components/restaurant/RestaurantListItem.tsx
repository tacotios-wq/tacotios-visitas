"use client";

import { memo, useState } from "react";
import Image from "next/image";
import type { Restaurant } from "@/types";
import { getTier, tierClassName, tierLabel } from "@/lib/tier";
import { ev } from "@/lib/analytics";
import { shareRestaurant } from "@/lib/share";
import { RestaurantImagePlaceholder } from "./RestaurantImagePlaceholder";

interface RestaurantListItemProps {
  restaurant: Restaurant;
  hasDossier: boolean;
  onClick: () => void;
  index: number;
}

const BLUR_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect fill="#f0f0f2" width="1" height="1"/></svg>'
  );

export const RestaurantListItem = memo(function RestaurantListItem({
  restaurant: r,
  hasDossier,
  onClick,
  index,
}: RestaurantListItemProps) {
  const delay = Math.min(index, 6) * 45;
  const primarySeries = r.series[0];
  const tier = getTier(r);
  const isFeatured = tier === "S";
  const score = r.viral_score ?? 0;
  const dotsFilled = Math.min(Math.round(score / 2), 5);
  const [copied, setCopied] = useState(false);

  const handleClick = () => {
    ev("restaurant_view", { restaurant: r.name });
    onClick();
  };

  async function handleShare(e: React.MouseEvent | React.KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    ev("share", { restaurant: r.name, surface: "list" });
    const result = await shareRestaurant(r);
    if (result === "copied") {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`animate-fade-up-item w-full flex items-stretch gap-0 rounded-2xl border text-left cursor-pointer select-none active:scale-[0.985] hover-lift transition-transform duration-150 overflow-hidden ${
        isFeatured
          ? "bg-warm-soft border-warm-border"
          : "bg-bg-surface border-border-card"
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Thumbnail */}
      <div
        className={`relative shrink-0 bg-bg-elevated overflow-hidden ${
          isFeatured
            ? "w-[120px] h-[120px] sm:w-[136px] sm:h-[136px]"
            : "w-[96px] h-[96px] sm:w-[112px] sm:h-[112px]"
        }`}
      >
        {r.image_url ? (
          <Image
            src={r.image_url}
            alt={r.name}
            fill
            sizes="112px"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <RestaurantImagePlaceholder name={r.name} seed={r.slug} size="sm" />
        )}
        {primarySeries && (
          <div
            className="absolute bottom-0 left-0 right-0 h-[3px]"
            style={{ backgroundColor: primarySeries.color }}
          />
        )}
        {/* Dossier indicator over image */}
        {hasDossier && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-white ring-1 ring-black/15" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center px-4 py-3 gap-1.5">
        <div className="flex items-start justify-between gap-3">
          <h3
            className={`font-editorial text-text-primary leading-[1.15] tracking-tight line-clamp-2 ${
              isFeatured ? "text-[20px] sm:text-[23px]" : "text-[17px] sm:text-[19px]"
            }`}
          >
            {r.name}
          </h3>
          {tier && (
            <span
              className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${tierClassName(tier)}`}
              title={tierLabel(tier)}
            >
              {tier}
            </span>
          )}
        </div>

        <p className="text-text-muted text-[11px] uppercase tracking-[0.12em] truncate">
          {r.zone} · {r.city}
        </p>

        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-text-secondary text-[11px] truncate flex-1">
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

      {/* Acciones: compartir (growth loop movil) + chevron */}
      <div className="shrink-0 flex flex-col items-center justify-center gap-1.5 pr-3">
        <span
          role="button"
          tabIndex={0}
          aria-label={copied ? "Copiado" : "Compartir"}
          title={copied ? "Copiado" : "Compartir"}
          onClick={handleShare}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleShare(e);
          }}
          className="flex items-center justify-center w-11 h-11 rounded-full text-text-muted hover:text-accent active:scale-[0.94] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer"
        >
          {copied ? (
            <svg className="w-[18px] h-[18px] text-accent animate-share-pop" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
            </svg>
          )}
        </span>
        <svg
          className="w-4 h-4 text-text-muted/55"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M6 4l4 4-4 4" />
        </svg>
      </div>
    </button>
  );
});
