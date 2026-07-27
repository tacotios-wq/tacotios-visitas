import type { Diamante } from "@/types";

interface DiamantesSectionProps {
  diamantes?: Diamante[];
}

function EstadoLabel({ estado }: { estado: Diamante["estado"] }) {
  if (estado === "CONFIRMADO_PRIMARIO") return null;

  if (estado === "AFIRMADO_DOSSIER") {
    return (
      <span className="inline-flex w-fit rounded-full border border-border-subtle px-2 py-0.5 text-[11px] font-medium text-text-muted">
        según el dossier
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit rounded-full border border-text-primary px-2 py-0.5 text-[11px] font-semibold text-text-primary">
      por verificar en sitio
    </span>
  );
}

export function DiamantesSection({ diamantes }: DiamantesSectionProps) {
  if (!diamantes?.length) return null;

  return (
    <section className="mt-10 pt-8 border-t border-border-subtle">
      <p className="eyebrow mb-3">Diamantes</p>
      <ol className="space-y-8 max-w-2xl">
        {diamantes.map((diamante, i) => (
          <li key={i} className="grid grid-cols-[3rem_1fr] gap-4">
            <span className="font-editorial text-2xl text-text-muted/35 tabular-nums leading-none pt-0.5">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <div className="flex flex-col gap-2">
                <h3 className="editorial-display text-xl sm:text-2xl text-text-primary leading-snug">
                  {diamante.titulo}
                </h3>
                <EstadoLabel estado={diamante.estado} />
              </div>

              <p className="prose-editorial text-text-secondary text-[15px] leading-relaxed mt-3">
                {diamante.porque}
              </p>

              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="eyebrow text-text-muted/70 mb-1">Dato ancla</dt>
                  <dd className="prose-editorial text-text-secondary text-[15px] leading-relaxed">
                    {diamante.dato_ancla}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-text-muted/70 mb-1">Tensión</dt>
                  <dd className="prose-editorial text-text-secondary text-[15px] leading-relaxed">
                    {diamante.tension}
                  </dd>
                </div>
                <div>
                  <dt className="eyebrow text-text-muted/70 mb-1">Persona</dt>
                  <dd className="prose-editorial text-text-secondary text-[15px] leading-relaxed">
                    {diamante.persona}
                  </dd>
                </div>
              </dl>

              <p className="text-text-muted text-xs leading-relaxed mt-4">Fuente: {diamante.fuente}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
