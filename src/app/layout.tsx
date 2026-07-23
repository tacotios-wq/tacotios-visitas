import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const SITE_URL = "https://tacotios-visitas.vercel.app";
const SITE_TITLE = "La Anti-Guia · @tacotios";
const SITE_DESCRIPTION =
  "Los 100 restaurantes que pasan el filtro. No existe mejor, existe favorito. La Anti-Guia gastronómica de Mexico por @tacotios.";

// Sin next/font: la estetica Apple/editorial usa "Helvetica Neue" como system font
// (Helvetica → Arial → sans-serif como fallback). Cero render-blocking, cero FOIT.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "La Anti-Guia",
  authors: [{ name: "Aniol Guell", url: "https://instagram.com/tacotios" }],
  creator: "@tacotios",
  keywords: [
    "La Anti-Guia",
    "tacotios",
    "gastronomía Mexico",
    "taquerias",
    "CDMX",
    "La Vuelta a Mexico",
    "80 Tacos",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "La Anti-Guia · @tacotios",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "es_MX",
    // Sin images: Next usa el opengraph-image.tsx generado (el og-default.png no existia).
  },
  twitter: {
    card: "summary_large_image",
    site: "@tacotios",
    creator: "@tacotios",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    // Sin images: hereda el opengraph-image.tsx generado.
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-bg-primary text-text-primary font-body">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
