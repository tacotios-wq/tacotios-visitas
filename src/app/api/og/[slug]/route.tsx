import { ImageResponse } from "next/og";
import { restaurants, dossiers } from "@/data/restaurants";
import { getTier } from "@/lib/tier";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) {
    return new Response("Not Found", { status: 404 });
  }

  const dossier = dossiers[r.id] ?? null;
  const tier = getTier(r);
  const frase = dossier?.frase_ancla ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #14110d 50%, #1f1a12 100%)",
          color: "white",
          padding: "60px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Helvetica, Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: "#d4a72c",
              fontWeight: 600,
              display: "flex",
            }}
          >
            La Anti-Guia · @tacotios
          </div>
          {tier === "S" && (
            <div
              style={{
                fontSize: 14,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#0a0a0a",
                background: "#d4a72c",
                padding: "6px 14px",
                borderRadius: 4,
                fontWeight: 700,
                display: "flex",
              }}
            >
              Tier S
            </div>
          )}
        </div>

        {/* Center block */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: r.name.length > 24 ? 76 : 96,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {r.name}
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#bbb",
              letterSpacing: 3,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {r.zone} · {r.city}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#fff",
              marginTop: 4,
              display: "flex",
            }}
          >
            {r.cuisine}
          </div>
          {frase && (
            <div
              style={{
                fontSize: 22,
                color: "#d4a72c",
                marginTop: 18,
                fontStyle: "italic",
                lineHeight: 1.3,
                maxWidth: 920,
                display: "flex",
              }}
            >
              {frase.length > 140 ? `${frase.slice(0, 138)}…` : frase}
            </div>
          )}
        </div>

        {/* Bottom signature */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              fontSize: 80,
              color: "#d4a72c",
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1,
              display: "flex",
            }}
          >
            TT
          </div>
          <div
            style={{
              fontSize: 16,
              color: "#777",
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            tacotios-visitas.vercel.app
          </div>
        </div>
      </div>
    ),
    SIZE,
  );
}
