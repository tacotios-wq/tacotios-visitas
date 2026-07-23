"use client";
import type { ReactNode } from "react";

interface CollapseProps {
  open: boolean;
  children: ReactNode;
  className?: string;
}

export function Collapse({ open, children, className = "" }: CollapseProps) {
  return (
    <div className={`collapse-wrapper ${className}`} data-open={open}>
      <div className="collapse-inner">{children}</div>
    </div>
  );
}
