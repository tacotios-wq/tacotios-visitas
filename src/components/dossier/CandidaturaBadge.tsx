import type { Dossier } from "@/types";

interface CandidaturaBadgeProps {
  status: Dossier["candidatura_status"];
  razon: string | null;
}

const config: Record<
  Dossier["candidatura_status"],
  { label: string; dot: string; cls: string; glow: boolean }
> = {
  si: {
    label: "Candidato confirmado",
    dot: "#3a7d44",
    cls: "bg-accent-soft text-accent border-accent-border",
    glow: true,
  },
  watch: {
    label: "En observacion",
    dot: "var(--color-warm)",
    cls: "bg-amber-soft text-amber border-amber/20",
    glow: false,
  },
  no: {
    label: "Descartado",
    dot: "#6e6e73",
    cls: "bg-bg-elevated text-text-muted border-border-card",
    glow: false,
  },
};

export function CandidaturaBadge({ status, razon }: CandidaturaBadgeProps) {
  const c = config[status];

  return (
    <div className="flex flex-col gap-2.5">
      <span
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${c.cls}`}
        style={c.glow ? { boxShadow: "0 0 20px var(--color-accent-glow)" } : undefined}
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: c.dot }}
        />{" "}
        {c.label}
      </span>
      {razon && (
        <p className="text-text-secondary text-sm leading-relaxed">{razon}</p>
      )}
    </div>
  );
}
