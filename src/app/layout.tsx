import type { Metadata, Viewport } from "next";
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
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "La Anti-Guia gastronómica de Mexico — @tacotios",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tacotios",
    creator: "@tacotios",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
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
      </body>
    </html>
  );
}
