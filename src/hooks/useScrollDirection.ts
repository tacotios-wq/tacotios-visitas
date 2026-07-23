"use client";

import { useState, useEffect, useRef } from "react";

export function useScrollDirection(): "up" | "down" | null {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const threshold = 10;

    const update = () => {
      const y = window.scrollY;
      if (y <= 0) {
        setDirection(null);
      } else if (Math.abs(y - lastY.current) >= threshold) {
        setDirection(y > lastY.current ? "down" : "up");
        lastY.current = y;
      }
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(update);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return direction;
}
