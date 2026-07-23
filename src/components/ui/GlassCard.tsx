"use client";

import { type ReactNode, type ElementType } from "react";

interface GlassCardProps {
  variant?: "default" | "featured" | "elevated";
  as?: ElementType;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export function GlassCard({
  variant = "default",
  as: Tag = "div",
  className = "",
  children,
  onClick,
}: GlassCardProps) {
  const base =
    variant === "elevated"
      ? "bg-bg-elevated border border-border-card rounded-xl"
      : "glass";

  const featured = variant === "featured" ? "glass-featured" : "";
  const interactive = onClick ? "cursor-pointer active:scale-[0.97] hover-lift" : "";

  return (
    <Tag
      className={`${base} ${featured} ${interactive} ${className}`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </Tag>
  );
}
