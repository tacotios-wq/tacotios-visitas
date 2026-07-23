"use client";

import { useEffect, useRef, useState } from "react";

interface ProgressRingProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  label: string;
  displayValue: string;
}

export function ProgressRing({
  value,
  size = 56,
  strokeWidth = 4,
  label,
  displayValue,
}: ProgressRingProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<SVGCircleElement>(null);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth={strokeWidth}
          />
          {/* Progress */}
          <circle
            ref={ref}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            style={{
              transition: `stroke-dashoffset 1200ms cubic-bezier(0.23, 1, 0.32, 1)`,
            }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-display font-bold text-xs text-text-primary tabular-nums">
          {displayValue}
        </span>
      </div>
      <span className="text-text-muted text-[10px] uppercase tracking-wider font-medium">
        {label}
      </span>
    </div>
  );
}
