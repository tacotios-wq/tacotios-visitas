"use client";

import type { ReactNode } from "react";
import type { DossierSectionKey } from "@/types";
import { Collapse } from "@/components/ui/Collapse";

interface DossierSectionProps {
  number: string;
  eyebrow: string;
  sectionKey: DossierSectionKey;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export function DossierSection({
  number,
  eyebrow,
  isOpen,
  onToggle,
  children,
}: DossierSectionProps) {
  return (
    <section className="border-b border-border-subtle">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 py-8 text-left w-full cursor-pointer select-none btn-press"
      >
        <span className="font-editorial text-2xl text-text-muted/35 tabular-nums leading-none">
          {number}
        </span>
        <span className="eyebrow text-text-muted group-hover:text-text-primary transition-colors duration-150">
          {eyebrow}
        </span>
        <span className="flex items-center self-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="shrink-0 text-text-muted group-hover:text-text-primary transition-transform transition-colors duration-200 ease-out"
            style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <path d="M4 6l4 4 4-4" />
          </svg>
        </span>
      </button>

      <Collapse open={isOpen}>
        <div className="pb-10">{children}</div>
      </Collapse>
    </section>
  );
}
