import { ImageResponse } from "next/og";

// OG card del homepage (la URL mas compartida). Sustituye al og-default.png
// inexistente. Next lo cablea automaticamente en <meta og:image> / twitter:image.
export const alt = "La Anti-Guia de @tacotios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0a0a0a 0%, #14110d 50%, #1f1a12 100%)",
          color: "white",
          padding: "64px 72px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d4a72c",
            fontWeight: 600,
            display: "flex",
          }}
        >
          La Anti-Guia · @tacotios
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 76,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: -2,
              maxWidth: 920,
              display: "flex",
            }}
          >
            No existe mejor. Existe favorito.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "rgba(255,255,255,0.72)",
              maxWidth: 880,
              display: "flex",
            }}
          >
            Los restaurantes que le recomendaria a mi mejor amigo.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <span style={{ display: "flex" }}>tacotios-visitas.vercel.app</span>
          <span style={{ display: "flex", color: "#d4a72c" }}>CDMX</span>
        </div>
      </div>
    ),
    size,
  );
}
