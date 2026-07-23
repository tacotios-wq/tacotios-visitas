"use client";

/**
 * Placeholder tipografico para restaurantes sin imagen.
 *
 * Anderson-style — solo tipografia y patron diagonal, sin color decorativo.
 *
 * Todos los tamanos muestran la inicial (no el nombre): el card o el detail
 * page ya ponen el nombre via overlay. La inicial actua como anchor visual
 * sin replicar metadatos.
 *
 * Entropia visual via seed (slug):
 *   - 8 angulos de pattern
 *   - 3 opacidades de pattern
 *   - 3 gaps de pattern
 *   - 4 tintes de fondo (warm-white / cool-blue / warm-cream / cool-sage)
 *   - 4 tonos de inicial (sutilmente distintos)
 *   = 1152 combinaciones unicas
 *
 * La inicial se renderiza con dominancia reducida (color #dcdce0 + weight 100)
 * para que las lineas diagonales puedan liderar visualmente y la lista no
 * lea como wallpaper monocromatico.
 */

type Size = "sm" | "md" | "lg";

interface Props {
  name: string;
  size?: Size;
  /** Seed estable (slug). Si no se pasa, usa el nombre. Determina entropia visual. */
  seed?: string;
}

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function variantFromSeed(seed: string) {
  const h = hashSeed(seed);
  const angles = [-60, -45, -30, -15, 15, 30, 45, 60];
  const opacities = [0.035, 0.05, 0.065];
  const gaps = [8, 11, 14];
  // Tintes con suficiente delta perceptivo entre ellos pero coherentes con el sistema.
  const bgTints = ["#fafafa", "#f1f4f7", "#f7f1ea", "#f1f5f1"];
  // Inicial — 4 tonos sutiles, todos en el rango muted gris claro.
  const initialColors = ["#dcdce0", "#d4d6da", "#d8d4d0", "#d4d8d4"];
  return {
    angle: angles[h % angles.length],
    opacity: opacities[(h >> 3) % opacities.length],
    gap: gaps[(h >> 6) % gaps.length],
    bgTint: bgTints[(h >> 9) % bgTints.length],
    initialColor: initialColors[(h >> 12) % initialColors.length],
  };
}

function DiagonalPattern({
  angle,
  opacity,
  gap,
}: {
  angle: number;
  opacity: number;
  gap: number;
}) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `repeating-linear-gradient(${angle}deg, rgba(0,0,0,${opacity}) 0 1px, transparent 1px ${gap}px)`,
      }}
    />
  );
}

export function RestaurantImagePlaceholder({
  name,
  size = "md",
  seed,
}: Props) {
  const trimmed = name.trim();
  const firstInitial = trimmed.charAt(0).toUpperCase() || "T";
  const v = variantFromSeed(seed ?? trimmed);

  const initialClass =
    size === "lg"
      ? "text-[clamp(6rem,18vw,11rem)]"
      : size === "md"
      ? "text-[clamp(3.5rem,9vw,5.5rem)]"
      : "text-[clamp(2.25rem,6vw,3rem)]";

  return (
    <div
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: v.bgTint }}
    >
      <DiagonalPattern angle={v.angle} opacity={v.opacity} gap={v.gap} />
      <span
        aria-hidden
        className={`relative z-10 font-display tracking-[-0.04em] leading-none ${initialClass}`}
        style={{ color: v.initialColor, fontWeight: 100 }}
      >
        {firstInitial}
      </span>
    </div>
  );
}
