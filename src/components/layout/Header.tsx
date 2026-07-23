"use client";

import { useScrollDirection } from "@/hooks/useScrollDirection";

interface HeaderProps {
  onSearchOpen: () => void;
  onFilterOpen: () => void;
  activeFilterCount: number;
  visited: number;
  withDossier: number;
  total: number;
}

export function Header({
  onSearchOpen,
  onFilterOpen,
  activeFilterCount,
  visited,
  withDossier,
  total,
}: HeaderProps) {
  const scrollDir = useScrollDirection();
  const hidden = scrollDir === "down";
  const pending = total - visited;

  return (
    <>
      {/* ── Top bar (sticky, glass-light Apple) ── */}
      <header
        className="sticky top-0 z-40 border-b border-border-subtle glass-header transition-transform duration-300"
        style={{ transform: hidden ? "translateY(-100%)" : "translateY(0)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Logo + masthead */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-text-primary flex items-center justify-center font-display font-semibold text-xs text-bg-primary select-none tracking-tight">
              TT
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-editorial text-text-primary text-base tracking-tight">
                Tacotios
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-[0.18em] mt-0.5">
                La Anti-Guia · Mexico
              </span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a
              href="/cuando-publicar"
              className="w-9 h-9 rounded-full bg-bg-surface border border-border-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-interactive-border transition-colors duration-150 cursor-pointer btn-press"
              aria-label="Cuando publicar"
              title="Cuando publicar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </a>

            <button
              onClick={onSearchOpen}
              className="w-9 h-9 rounded-full bg-bg-surface border border-border-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-interactive-border transition-colors duration-150 cursor-pointer btn-press"
              aria-label="Buscar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            <button
              onClick={onFilterOpen}
              className="relative w-9 h-9 rounded-full bg-bg-surface border border-border-card flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-interactive-border transition-colors duration-150 cursor-pointer btn-press"
              aria-label="Filtros"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M3 6h18M7 12h10M10 18h4" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-text-primary text-bg-primary text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ── Editorial hero band — escala Apple-grade ── */}
      <section className="border-b border-border-subtle bg-bg-primary">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
          {/* Eyebrow */}
          <p className="eyebrow mb-5">
            La Anti-Guia ·{" "}
            <a
              href="https://instagram.com/tacotios"
              target="_blank"
              rel="noreferrer noopener"
              className="text-text-secondary hover:text-text-primary transition-colors duration-150 underline decoration-text-muted/40 underline-offset-[3px] hover:decoration-text-primary"
            >
              @tacotios
            </a>
          </p>

          {/* Tesis — h1 protagonista, escala editorial Apple-grade */}
          <h1 className="editorial-display font-bold text-[clamp(2.25rem,6vw,5rem)] text-text-primary max-w-4xl leading-[1.05] tracking-tight">
            Cada lugar pasa el filtro:{" "}
            <span className="editorial-italic">
              &ldquo;lo recomendaria a mi mejor amigo&rdquo;.
            </span>
          </h1>

          {/* Cierre de la tesis — segundo movimiento, propio parrafo */}
          <p className="mt-4 font-editorial text-xl sm:text-2xl text-text-primary tracking-tight">
            Sin excepciones.
          </p>

          {/* Inventario — secundario, prosa pequena, no compite con la tesis */}
          <p className="mt-6 text-text-muted text-sm sm:text-base max-w-2xl">
            <span className="stat-number text-text-secondary">{total}</span>{" "}
            lugares. Una lista viva.
          </p>

          {/* Stats row — honestos (sin progreso ficticio) */}
          <div className="flex items-end flex-wrap gap-x-8 gap-y-6 sm:gap-x-16 mt-14 sm:mt-20">
            <Stat value={visited} label="Visitados" />
            <div className="h-12 sm:h-16 w-px bg-border-subtle" />
            <Stat value={withDossier} label="Con dossier" />
            <div className="h-12 sm:h-16 w-px bg-border-subtle" />
            <Stat value={pending} label="Por visitar" dim />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  value,
  label,
  suffix,
  dim = false,
}: {
  value: number;
  label: string;
  suffix?: string;
  dim?: boolean;
}) {
  return (
    <div>
      <div
        className={`stat-number text-[clamp(2rem,5vw,4rem)] ${
          dim ? "text-text-secondary" : "text-text-primary"
        }`}
      >
        {value}
        {suffix && (
          <span className="text-[0.5em] text-text-muted ml-0.5 font-normal">
            {suffix}
          </span>
        )}
      </div>
      <p className="eyebrow mt-2">{label}</p>
    </div>
  );
}
