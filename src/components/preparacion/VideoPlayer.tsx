"use client";

import { useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  duration_s?: number | null;
}

export function VideoPlayer({ src, title = "Video preparacion mental", poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  const handleStart = () => {
    setStarted(true);
    const v = videoRef.current;
    if (v) void v.play();
  };

  return (
    <div className="rounded-xl border border-border-card bg-bg-surface/60 backdrop-blur overflow-hidden">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border-subtle">
        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent mb-0.5">Antes de entrar</p>
          <h4 className="text-text-primary text-sm font-medium">{title}</h4>
        </div>
      </div>
      <div className="relative aspect-video bg-bg-elevated">
        {!started ? (
          <button
            onClick={handleStart}
            className="absolute inset-0 flex items-center justify-center group cursor-pointer"
            aria-label="Reproducir video"
          >
            {poster ? (
              <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover opacity-60" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-bg-surface to-bg-elevated" />
            )}
            <div className="relative z-10 w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center group-active:scale-[0.97] transition-transform">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor" className="text-bg-primary ml-1">
                <path d="M4 2v18l16-9z" />
              </svg>
            </div>
          </button>
        ) : (
          <video
            ref={videoRef}
            src={src}
            controls
            className="w-full h-full object-contain bg-black"
            poster={poster}
          />
        )}
      </div>
    </div>
  );
}
