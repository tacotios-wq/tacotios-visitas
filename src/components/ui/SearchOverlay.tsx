"use client";

import { useEffect, useRef, useState } from "react";
import type { Restaurant } from "@/types";
import { getTier, tierClassName } from "@/lib/tier";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string) => void;
  results: Restaurant[];
  onSelect: (id: string) => void;
}

const LISTBOX_ID = "search-results-listbox";
const optionId = (i: number) => `search-option-${i}`;

export function SearchOverlay({
  open,
  onClose,
  value,
  onChange,
  results,
  onSelect,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);

  // Foco al abrir + bloquear scroll de fondo.
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      window.clearTimeout(id);
      document.body.style.overflow = "";
    };
  }, [open]);

  // El indice activo vuelve al principio cuando cambian los resultados o la query.
  useEffect(() => {
    setActive(0);
  }, [value, results.length]);

  // Mantener visible la opcion activa al navegar con teclado.
  useEffect(() => {
    if (!open || results.length === 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`#${optionId(active)}`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active, open, results.length]);

  if (!open) return null;

  const hasQuery = value.trim().length > 0;

  const choose = (id: string) => {
    onSelect(id);
    onChange("");
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) choose(r.id);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm animate-backdrop"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buscar lugares"
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-0 top-0 mx-auto w-full max-w-2xl px-3 sm:px-4 sm:pt-4"
      >
        <div className="bg-bg-primary border border-border-card rounded-b-2xl sm:rounded-2xl shadow-[0_24px_60px_-24px_rgba(0,0,0,0.28)] overflow-hidden animate-search-overlay">
          {/* Input row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle">
            <svg
              className="shrink-0 w-[18px] h-[18px] text-text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={hasQuery && results.length > 0}
              aria-controls={LISTBOX_ID}
              aria-activedescendant={results.length > 0 ? optionId(active) : undefined}
              placeholder="Busca por nombre, colonia o tipo de cocina"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKey}
              className="flex-1 min-w-0 bg-transparent text-text-primary text-base placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar busqueda"
              className="shrink-0 -mr-1 p-1.5 inline-flex items-center justify-center text-text-muted hover:text-text-primary cursor-pointer transition-[color,transform] duration-100 active:scale-[0.97]"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true">
                <path d="M12 4L4 12M4 4l8 8" />
              </svg>
            </button>
          </div>

          {/* Results / states */}
          {!hasQuery ? (
            <p className="px-4 py-5 text-text-muted text-sm">
              Escribe para buscar en toda la guia.
            </p>
          ) : results.length === 0 ? (
            <div className="px-4 py-6">
              <p className="editorial-display text-lg text-text-primary">
                Nada con ese nombre.{" "}
                <span className="editorial-italic text-text-muted">Todavia.</span>
              </p>
              <p className="text-text-muted text-[13px] mt-1.5">
                Prueba con la colonia, la ciudad o el tipo de cocina.
              </p>
            </div>
          ) : (
            <ul
              ref={listRef}
              id={LISTBOX_ID}
              role="listbox"
              aria-label="Resultados de busqueda"
              className="max-h-[60vh] overflow-y-auto py-1.5"
            >
              {results.map((r, i) => {
                const tier = getTier(r);
                const isActive = i === active;
                return (
                  <li
                    key={r.id}
                    id={optionId(i)}
                    role="option"
                    aria-selected={isActive}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => choose(r.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors duration-100 ${
                      isActive ? "bg-bg-surface" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-editorial text-[15px] text-text-primary leading-tight truncate">
                          {r.name}
                        </span>
                        {tier && (
                          <span
                            className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${tierClassName(tier)}`}
                          >
                            {tier}
                          </span>
                        )}
                        {r.has_dossier && (
                          <span
                            className="shrink-0 w-1.5 h-1.5 rounded-full bg-text-primary"
                            title="Dossier listo"
                          />
                        )}
                      </div>
                      <p className="text-text-muted text-[11px] uppercase tracking-[0.1em] truncate mt-0.5">
                        {r.zone} · {r.city} · {r.cuisine}
                      </p>
                    </div>
                    <svg
                      className="shrink-0 w-3.5 h-3.5 text-text-muted/40"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M6 4l4 4-4 4" />
                    </svg>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
