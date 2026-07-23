"use client";

import { useState } from "react";
import type { Dossier, DossierSectionKey } from "@/types";
import { DossierSection } from "./DossierSection";
import { DossierDishes } from "./DossierDishes";
import { DossierQuestions } from "./DossierQuestions";
import { CandidaturaBadge } from "./CandidaturaBadge";
import { PreparacionMentalSection } from "../preparacion/PreparacionMentalSection";
import { Reveal } from "@/components/ui/Reveal";

interface DossierViewProps {
  dossier: Dossier;
  restaurantImage?: string | null;
  restaurantName?: string;
}

export function DossierView({ dossier: d, restaurantImage, restaurantName }: DossierViewProps) {
  const [openSections, setOpenSections] = useState<Set<DossierSectionKey>>(
    new Set(["historia"])
  );

  const toggle = (key: DossierSectionKey) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  let revealIndex = 0;
  const nextDelay = (): number => {
    const delay = revealIndex * 50;
    revealIndex += 1;
    return delay;
  };

  return (
    <div className="flex flex-col">
      {/* 00 · ANTES DE IR — preparacion mental (audio + video NotebookLM) */}
      <PreparacionMentalSection dossier={d} restaurantImage={restaurantImage} restaurantName={restaurantName} />

      {/* 01 · LA HISTORIA */}
      {d.historia && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="01"
            eyebrow="LA HISTORIA"
            sectionKey="historia"
            isOpen={openSections.has("historia")}
            onToggle={() => toggle("historia")}
          >
            <p className="prose-editorial text-base leading-relaxed text-text-secondary max-w-prose">
              {d.historia}
            </p>
          </DossierSection>
        </Reveal>
      )}

      {/* 02 · EL GANCHO */}
      {d.hooks.length > 0 && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="02"
            eyebrow="EL GANCHO"
            sectionKey="hooks"
            isOpen={openSections.has("hooks")}
            onToggle={() => toggle("hooks")}
          >
            <ul className="flex flex-col gap-6 max-w-prose">
              {d.hooks.map((h, i) => (
                <li
                  key={i}
                  className="border-l border-border-card pl-6 text-base leading-relaxed text-text-secondary"
                >
                  {h}
                </li>
              ))}
            </ul>
          </DossierSection>
        </Reveal>
      )}

      {/* 03 · LO QUE NO VES */}
      {d.datos.length > 0 && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="03"
            eyebrow="LO QUE NO VES"
            sectionKey="datos"
            isOpen={openSections.has("datos")}
            onToggle={() => toggle("datos")}
          >
            <ol className="flex flex-col gap-5 max-w-prose">
              {d.datos.map((dato, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[2.5rem_1fr] gap-2 text-base leading-relaxed text-text-secondary"
                >
                  <span className="eyebrow text-text-muted pt-[6px] tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{dato}</span>
                </li>
              ))}
            </ol>
          </DossierSection>
        </Reveal>
      )}

      {/* 04 · QUE PEDIR */}
      {d.pedir.length > 0 && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="04"
            eyebrow="QUE PEDIR"
            sectionKey="pedir"
            isOpen={openSections.has("pedir")}
            onToggle={() => toggle("pedir")}
          >
            <DossierDishes dishes={d.pedir} />
          </DossierSection>
        </Reveal>
      )}

      {/* 05 · LAS PREGUNTAS */}
      {d.preguntas.length > 0 && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="05"
            eyebrow="LAS PREGUNTAS"
            sectionKey="preguntas"
            isOpen={openSections.has("preguntas")}
            onToggle={() => toggle("preguntas")}
          >
            <DossierQuestions questions={d.preguntas} />
          </DossierSection>
        </Reveal>
      )}

      {/* 06 · 80 TACOS */}
      <Reveal delay={nextDelay()}>
        <DossierSection
          number="06"
          eyebrow="80 TACOS"
          sectionKey="candidatura"
          isOpen={openSections.has("candidatura")}
          onToggle={() => toggle("candidatura")}
        >
          <CandidaturaBadge status={d.candidatura_status} razon={d.candidatura_razon} />
        </DossierSection>
      </Reveal>

      {/* 07 · EL ANGULO */}
      {d.angulo && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="07"
            eyebrow="EL ANGULO"
            sectionKey="angulo"
            isOpen={openSections.has("angulo")}
            onToggle={() => toggle("angulo")}
          >
            <p className="prose-editorial text-base leading-relaxed text-text-secondary max-w-prose">
              {d.angulo}
            </p>
          </DossierSection>
        </Reveal>
      )}

      {/* 08 · CUIDADO CON */}
      {d.alertas.length > 0 && (
        <Reveal delay={nextDelay()}>
          <DossierSection
            number="08"
            eyebrow="CUIDADO CON"
            sectionKey="alertas"
            isOpen={openSections.has("alertas")}
            onToggle={() => toggle("alertas")}
          >
            <ul className="flex flex-col gap-5 max-w-prose">
              {d.alertas.map((a, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[auto_1fr] gap-3 text-base leading-relaxed text-text-secondary"
                >
                  <span className="eyebrow text-text-muted pt-[6px]">
                    NOTA
                    <span aria-hidden="true" className="mx-2 opacity-60">
                      ·
                    </span>
                  </span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </DossierSection>
        </Reveal>
      )}
    </div>
  );
}
