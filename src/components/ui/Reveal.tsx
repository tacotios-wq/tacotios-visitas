"use client";
import type { ReactNode, ElementType } from "react";
import { useReveal } from "@/hooks/useReveal";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
  threshold?: number;
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  as: Tag = "div",
  threshold = 0.15,
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>(threshold);
  return (
    <Tag
      ref={ref}
      className={`reveal ${className}`}
      data-visible={visible}
      style={delay > 0 ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
