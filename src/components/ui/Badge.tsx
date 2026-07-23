import type { Restaurant, Dossier } from "@/types";

interface BadgeProps {
  variant: "status" | "series" | "candidatura";
  label: string;
  color?: string;
  size?: "sm" | "md";
  icon?: string;
}

const statusStyles: Record<Restaurant["status"], string> = {
  pendiente: "bg-bg-surface text-text-secondary border border-border-card",
  visitado: "bg-text-primary text-bg-primary",
  "80tacos": "bg-accent-soft text-text-primary border border-accent-border",
};

const candidaturaStyles: Record<Dossier["candidatura_status"], { cls: string; dot: string }> = {
  si: { cls: "bg-accent-soft text-accent border-accent-border", dot: "#3a7d44" },
  watch: { cls: "bg-amber-soft text-amber border-amber/20", dot: "var(--color-warm)" },
  no: { cls: "bg-bg-elevated text-text-muted border-border-card", dot: "#6e6e73" },
};

export function Badge({ variant, label, color, size = "sm", icon }: BadgeProps) {
  if (variant === "series" && color) {
    const sz = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
    return (
      <span
        className={`inline-flex items-center gap-1 ${sz} rounded-md font-bold uppercase tracking-wider`}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {label}
      </span>
    );
  }

  if (variant === "status") {
    const key = label.toLowerCase() as Restaurant["status"];
    const cls = statusStyles[key] ?? "bg-bg-elevated text-text-muted";
    const sz = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
    return (
      <span className={`inline-flex items-center gap-1 ${sz} rounded-lg font-semibold ${cls}`}>
        {icon && <span>{icon}</span>}
        {label}
      </span>
    );
  }

  if (variant === "candidatura") {
    const key = label as Dossier["candidatura_status"];
    const cfg = candidaturaStyles[key] ?? candidaturaStyles.no;
    const labels: Record<string, string> = {
      si: "Candidato confirmado",
      watch: "En observacion",
      no: "Descartado",
    };
    return (
      <span
        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border ${cfg.cls}`}
      >
        <span
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: cfg.dot }}
        />{" "}
        {labels[key] ?? label}
      </span>
    );
  }

  return null;
}
