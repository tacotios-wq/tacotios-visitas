"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ev } from "@/lib/analytics";

interface AudioPlayerProps {
  src: string;
  title?: string;
  duration_s?: number | null;
  /** Para MediaSession (controles en pantalla de bloqueo). */
  artist?: string;
  artwork?: string | null;
}

const RATES = [1, 1.25, 1.5, 2, 0.75];
const SKIP = 15; // segundos por salto (atras/adelante) — pensado para uso en movimiento

function formatTime(s: number): string {
  if (!isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

// Nombre de archivo legible para la descarga (ej. "/audio/cocuyos-preparacion-mental.mp3").
function downloadName(src: string): string {
  const last = src.split("/").pop() || "audio.mp3";
  return last.includes(".") ? last : `${last}.mp3`;
}

export function AudioPlayer({
  src,
  title = "Audio preparacion mental",
  duration_s,
  artist = "Tacotios · Antes de ir",
  artwork,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState<number>(duration_s ?? 0);
  const [rate, setRate] = useState(1);
  const [error, setError] = useState(false);
  // Cuenta solo el primer play de cada pista (no resumes tras pausa). Se resetea al cambiar src.
  const playTrackedRef = useRef(false);
  // title actual leido dentro del listener onPlay (registrado solo por src) sin re-suscribir.
  const titleRef = useRef(title);
  titleRef.current = title;

  // Reset completo cuando cambia la pista (el componente se reutiliza entre restaurantes).
  useEffect(() => {
    setPlaying(false);
    setCurrent(0);
    setDuration(duration_s ?? 0);
    setRate(1);
    setError(false);
    playTrackedRef.current = false;
    const a = audioRef.current;
    if (a) {
      a.pause();
      a.currentTime = 0;
      a.playbackRate = 1;
    }
  }, [src, duration_s]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrent(a.currentTime);
    const onLoaded = () => {
      if (isFinite(a.duration)) setDuration(a.duration);
      setError(false);
    };
    const onEnded = () => setPlaying(false);
    const onPlay = () => {
      setPlaying(true);
      if (!playTrackedRef.current) {
        playTrackedRef.current = true;
        ev("audio_play", { restaurant: titleRef.current });
      }
    };
    const onPause = () => setPlaying(false);
    const onErr = () => {
      setError(true);
      setPlaying(false);
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("ended", onEnded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("error", onErr);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("error", onErr);
    };
  }, [src]);

  const seekTo = useCallback(
    (seconds: number) => {
      const a = audioRef.current;
      if (!a) return;
      const dur = a.duration && isFinite(a.duration) ? a.duration : duration;
      if (!dur) return;
      const clamped = Math.max(0, Math.min(dur, seconds));
      a.currentTime = clamped;
      setCurrent(clamped);
    },
    [duration]
  );

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.pause();
    else a.play().catch(() => setError(true));
  }, [playing]);

  // MediaSession: controles en pantalla de bloqueo + Control Center (clave para escuchar en el Uber).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    try {
      ms.metadata = new MediaMetadata({
        title,
        artist,
        album: "Pasaporte CDMX",
        artwork: artwork
          ? [
              { src: artwork, sizes: "512x512", type: "image/jpeg" },
              { src: artwork, sizes: "256x256", type: "image/jpeg" },
            ]
          : undefined,
      });
    } catch {
      /* MediaMetadata no soportado */
    }
    ms.setActionHandler("play", () => togglePlay());
    ms.setActionHandler("pause", () => togglePlay());
    ms.setActionHandler("seekbackward", (d) => seekTo(current - (d.seekOffset || SKIP)));
    ms.setActionHandler("seekforward", (d) => seekTo(current + (d.seekOffset || SKIP)));
    try {
      ms.setActionHandler("seekto", (d) => {
        if (typeof d.seekTime === "number") seekTo(d.seekTime);
      });
    } catch {
      /* seekto no soportado */
    }
    return () => {
      try {
        ms.setActionHandler("play", null);
        ms.setActionHandler("pause", null);
        ms.setActionHandler("seekbackward", null);
        ms.setActionHandler("seekforward", null);
        ms.setActionHandler("seekto", null);
      } catch {
        /* noop */
      }
    };
  }, [title, artist, artwork, togglePlay, seekTo, current]);

  // Estado de reproduccion + posicion para la pantalla de bloqueo.
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [playing]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!duration || !("setPositionState" in navigator.mediaSession)) return;
    try {
      navigator.mediaSession.setPositionState({
        duration,
        playbackRate: rate,
        position: Math.min(current, duration),
      });
    } catch {
      /* setPositionState no soportado */
    }
  }, [current, duration, rate]);

  // Seek por tap/arrastre en la barra (puntero unificado: raton + tactil).
  const seekFromPointer = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el || !duration) return;
      const rect = el.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      seekTo(duration * pct);
    },
    [duration, seekTo]
  );

  const onTrackPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    seekFromPointer(e.clientX);
  };
  const onTrackPointerMove = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) seekFromPointer(e.clientX);
  };

  const onSliderKey = (e: React.KeyboardEvent) => {
    if (!duration) return;
    switch (e.key) {
      case "ArrowRight":
      case "ArrowUp":
        e.preventDefault();
        seekTo(current + 5);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        e.preventDefault();
        seekTo(current - 5);
        break;
      case "Home":
        e.preventDefault();
        seekTo(0);
        break;
      case "End":
        e.preventDefault();
        seekTo(duration);
        break;
    }
  };

  const cycleRate = () => {
    const a = audioRef.current;
    if (!a) return;
    const idx = RATES.indexOf(rate);
    const next = RATES[(idx + 1) % RATES.length];
    a.playbackRate = next;
    setRate(next);
  };

  const progress = duration ? (current / duration) * 100 : 0;
  const remaining = duration ? duration - current : 0;

  return (
    <div className="rounded-2xl border border-border-card bg-bg-surface/70 backdrop-blur p-5 sm:p-6 flex flex-col gap-5">
      {/* Encabezado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent mb-1">
            Escucha en camino
          </p>
          <h4 className="text-text-primary text-base font-medium leading-snug">{title}</h4>
          {duration > 0 && (
            <p className="text-[12px] text-text-muted tabular-nums mt-0.5">
              {formatTime(duration)} · audio para el Uber
            </p>
          )}
        </div>
        <div className="shrink-0 flex items-center gap-1.5">
          <button
            onClick={cycleRate}
            className="text-[12px] tabular-nums text-text-muted hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-lg border border-border-subtle cursor-pointer btn-press"
            aria-label="Velocidad de reproduccion"
          >
            {rate}x
          </button>
          <a
            href={src}
            download={downloadName(src)}
            className="w-9 h-9 rounded-lg border border-border-subtle flex items-center justify-center text-text-muted hover:text-text-primary transition-colors cursor-pointer btn-press"
            aria-label="Descargar audio"
            title="Descargar audio"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12" />
              <path d="m7 11 5 5 5-5" />
              <path d="M5 21h14" />
            </svg>
          </a>
        </div>
      </div>

      {error ? (
        <p className="text-[13px] text-text-secondary leading-relaxed py-1">
          No se pudo cargar el audio.{" "}
          <a href={src} download={downloadName(src)} className="text-accent underline underline-offset-2">
            Pruebalo descargandolo.
          </a>
        </p>
      ) : (
        <>
          {/* Barra de progreso — alta y con area tactil amplia */}
          <div className="flex flex-col gap-2">
            <div
              ref={trackRef}
              role="slider"
              tabIndex={0}
              aria-label="Progreso del audio"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={`${formatTime(current)} de ${formatTime(duration)}`}
              onKeyDown={onSliderKey}
              onPointerDown={onTrackPointerDown}
              onPointerMove={onTrackPointerMove}
              className="relative py-3 -my-3 cursor-pointer touch-none select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded-full"
            >
              <div className="relative h-2 bg-border-subtle rounded-full">
                <div
                  className="absolute inset-y-0 left-0 right-0 origin-left bg-accent rounded-full"
                  style={{ transform: `scaleX(${progress / 100})`, transition: "transform 90ms linear" }}
                />
                <div
                  className="absolute top-1/2 w-4 h-4 rounded-full bg-accent shadow-md ring-2 ring-bg-surface"
                  style={{ left: `${progress}%`, transform: "translate(-50%, -50%)", transition: "left 90ms linear" }}
                  aria-hidden="true"
                />
              </div>
            </div>
            <div className="flex justify-between text-[12px] tabular-nums text-text-muted">
              <span>{formatTime(current)}</span>
              <span>-{formatTime(remaining)}</span>
            </div>
          </div>

          {/* Controles grandes: -15s · play · +15s (usables en movimiento) */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => seekTo(current - SKIP)}
              className="shrink-0 w-12 h-12 rounded-full border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer btn-press"
              aria-label="Retroceder 15 segundos"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4 5 9l6 5" />
                <path d="M5 9h9a5 5 0 0 1 0 10h-3" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className={`play-btn shrink-0 w-16 h-16 rounded-full bg-accent text-bg-primary flex items-center justify-center cursor-pointer active:scale-[0.96] transition-transform duration-150 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg shadow-accent/20 ${playing ? "is-playing" : ""}`}
              aria-label={playing ? "Pausar" : "Reproducir"}
            >
              {playing ? (
                <svg width="22" height="22" viewBox="0 0 14 14" fill="currentColor"><rect x="2" y="1" width="3.5" height="12" rx="1" /><rect x="8.5" y="1" width="3.5" height="12" rx="1" /></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 14 14" fill="currentColor" className="ml-0.5"><path d="M3 1v12l10-6z" /></svg>
              )}
            </button>

            <button
              onClick={() => seekTo(current + SKIP)}
              className="shrink-0 w-12 h-12 rounded-full border border-border-subtle text-text-secondary hover:text-text-primary flex items-center justify-center cursor-pointer btn-press"
              aria-label="Adelantar 15 segundos"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m13 4 6 5-6 5" />
                <path d="M19 9h-9a5 5 0 0 0 0 10h3" />
              </svg>
            </button>
          </div>
        </>
      )}

      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
}
