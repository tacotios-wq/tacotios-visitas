# CICLO 1 — ARQUITECTURA WEB

> Hacer la web indexable, shareable, responsive, accesible. Sprint 0 + Sprint 1 del audit del 19 may.
> **Tiempo estimado:** 4-6h Claude Code dirigido.
> **Pre-requisito:** ninguno.
> **Output:** `/xokol` devuelve 200 con OG válido + JSON-LD válido + share funcional + sin overlaps mobile.

---

## FASE A — DIAGNÓSTICO (15 min)

Reusar [AUDIT_2026-05-19.md](../AUDIT_2026-05-19.md) que ya cubre esto exhaustivamente.

Si el audit tiene más de 7 días o ha habido cambios en el repo desde entonces, re-correr con este superprompt:

```
SUBAGENT general-purpose, prompt:

Audita https://tacotios-visitas.vercel.app desde 3 ángulos:

1. WebFetch a home + 3 fichas random + 1 ciudad. Verifica HTML rendered: meta viewport, OG, schema.org JSON-LD, status code de /[slug].
2. Read src/components/ (recursivo) + src/app/page.tsx + src/types/index.ts. Mapea componentes principales y sus props.
3. Probar mobile via curl con user-agent iPhone. Identifica overflows, breakpoints rotos.

Reporta en formato del AUDIT_2026-05-19.md pero solo items P0/P1 relacionados con arquitectura técnica (responsive, SEO, OG, rutas, share, accesibilidad, performance). Skip contenido, identidad, distribución, escala. Max 800 palabras. Sin em-dashes.
```

---

## FASE B — PLANIFICACIÓN

Herramientas internas:
- **Skills:** `web-elite`, `frontend-design`, `emil-design-eng`, `web-design-guidelines`, `impeccable`
- **Agents:** `architect` (planeación), `typescript-reviewer` (post-cambios), `e2e-runner` (verificación visual), `code-reviewer`
- **MCP:** `Vercel` (deploy + logs), `Claude_Preview` (preview local + screenshots)
- **Reference docs:** `~/Desktop/02_MARCA-TACOTIOS/DESIGN_SYSTEM_TACOTIOS.md`, `~/.claude/skills/emil-design-eng/SKILL.md`

---

## FASE C — EJECUCIÓN (orden estricto)

### Item 1.1 — Pre-flight backup + tag

```bash
cd ~/Desktop/02_MARCA-TACOTIOS/tacotios-visitas
git status
git add -A && git commit -m "pre-ciclo-1: snapshot antes de arquitectura web" || true
git tag pre-ciclo-1 || true
```

### Item 1.2 — Safe-area sticky bar (Prompt 1 del audit)

```
SUPERPROMPT 1.2:

En src/components/restaurant/RestaurantDetail.tsx el sticky bar `fixed bottom-0 z-40 glass-header` tapa contenido en iOS porque no respeta el home indicator y no compensa el padding del contenido scrollable.

Cambios exactos:
1. En el div del sticky bar (linea ~169), agregar style inline `paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)"`. Quitar el `py-3` y dejar solo `py-0 px-5`. La altura visible queda controlada por el contenido + el calc.
2. En el div del bloque DOSSIER (linea ~151) cambiar `pb-28` a `pb-[calc(7rem+env(safe-area-inset-bottom))]`.
3. En src/app/layout.tsx dentro de `export const viewport`, agregar `viewportFit: "cover"`.

Después de aplicar:
- `pnpm tsc --noEmit` debe pasar sin errores.
- preview_start + preview_resize a 375x812. Abrir cualquier ficha, scrollear hasta el final del dossier. Verificar que el último bullet sea visible y el home indicator no tape el botón.
- preview_screenshot para confirmar visual.

Criterio éxito: screenshot muestra ficha completa scrolleable + botón Maps no tapado.
```

### Item 1.3 — Ruta dinámica `/[slug]/page.tsx` (Prompt 2 del audit)

```
SUPERPROMPT 1.3:

Crear src/app/[slug]/page.tsx como Server Component para que cada restaurante tenga URL propia. Stack: Next.js 16 App Router.

Estructura:

```tsx
// src/app/[slug]/page.tsx
import { notFound } from "next/navigation";
import { restaurants, dossiers } from "@/data/restaurants";
import { RestaurantPage } from "@/components/restaurant/RestaurantPage";
import { JsonLd } from "@/components/restaurant/JsonLd";

export function generateStaticParams() {
  return restaurants.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) return {};
  const dossier = dossiers[r.id] ?? null;
  const description = dossier?.hooks?.[0] ?? r.notes?.slice(0, 160) ?? `${r.name} en ${r.city}.`;
  return {
    title: `${r.name} · La Anti-Guía`,
    description,
    openGraph: {
      title: r.name,
      description,
      url: `https://tacotios-visitas.vercel.app/${slug}`,
      images: [{ url: `/api/og/${slug}`, width: 1200, height: 630 }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: r.name,
      description,
      images: [`/api/og/${slug}`],
    },
    alternates: {
      canonical: `https://tacotios-visitas.vercel.app/${slug}`,
    },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) notFound();
  const dossier = dossiers[r.id] ?? null;
  return (
    <>
      <JsonLd restaurant={r} dossier={dossier} />
      <RestaurantPage restaurant={r} dossier={dossier} />
    </>
  );
}
```

Crear nuevo componente src/components/restaurant/RestaurantPage.tsx reutilizando piezas de RestaurantDetail. NO usar position:fixed. Estructura:

- Header global (importar de @/components/layout)
- Breadcrumb minimal: "← La Anti-Guía" (link a /)
- Hero (mismo bloque visual que RestaurantDetail.tsx pero sin fixed)
- Info strip (zone, city, cuisine)
- DossierView completo
- Sticky bar inferior (con safe-area de item 1.2)
- Footer (a crear en C3, por ahora vacío)

Mantener RestaurantDetail.tsx como panel para navegación desde grid (no romper home).

En src/app/page.tsx ajustar handler onSelect:
- En mobile (window.innerWidth < 1024) o si llega de share, navegar via next/link a /${slug}.
- En desktop con interacción interna, abrir panel.
- Usar hook useIsDesktop existente o crear uno.

Criterio éxito:
- `curl https://tacotios-visitas.vercel.app/xokol` devuelve 200.
- HTML contiene `<title>Xokol · La Anti-Guía</title>`.
- `pnpm tsc --noEmit` pasa.
- Lighthouse en /xokol ≥ 90 performance.
```

### Item 1.4 — JSON-LD schema.org Restaurant (Prompt 3)

```
SUPERPROMPT 1.4:

Crear src/components/restaurant/JsonLd.tsx que renderice <script type="application/ld+json"> con schema.org Restaurant.

```tsx
import type { Restaurant, Dossier } from "@/types";

export function JsonLd({ restaurant: r, dossier }: { restaurant: Restaurant; dossier: Dossier | null }) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: r.name,
    url: `https://tacotios-visitas.vercel.app/${r.slug}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: r.zone,
      addressRegion: r.city,
      addressCountry: "MX",
    },
    servesCuisine: r.cuisine,
  };
  if (r.image_url) data.image = r.image_url;
  if (dossier?.historia && r.viral_score) {
    data.review = {
      "@type": "Review",
      author: { "@type": "Person", "name": "@tacotios", "url": "https://instagram.com/tacotios" },
      reviewBody: dossier.historia.slice(0, 300),
      reviewRating: {
        "@type": "Rating",
        ratingValue: Math.round(r.viral_score / 2 * 10) / 10,
        bestRating: 5,
        worstRating: 1,
      },
    };
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

NO inventar campos no existentes en el modelo. Omitir si falta data.

Criterio éxito: Google Rich Results Test (https://search.google.com/test/rich-results) pasa sin errores en `/el-chololo` o cualquier ficha con dossier.
```

### Item 1.5 — OG images dinámicas `/api/og/[slug]` (Prompt 4)

```
SUPERPROMPT 1.5:

Crear src/app/api/og/[slug]/route.tsx con ImageResponse de next/og.

```tsx
import { ImageResponse } from "next/og";
import { restaurants } from "@/data/restaurants";

export const runtime = "edge";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const r = restaurants.find((x) => x.slug === slug);
  if (!r) return new Response("Not Found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 100%)",
          color: "white",
          padding: "60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 22,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: "#d4a72c",
            display: "flex",
          }}
        >
          La Anti-Guía · @tacotios
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 96, fontWeight: 700, lineHeight: 1, display: "flex" }}>
            {r.name}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#aaa",
              letterSpacing: 2,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            {r.zone} · {r.city}
          </div>
          <div style={{ fontSize: 32, color: "#fff", marginTop: 12, display: "flex" }}>
            {r.cuisine}
          </div>
        </div>
        <div
          style={{
            fontSize: 24,
            color: "#d4a72c",
            fontWeight: 700,
            letterSpacing: 4,
            display: "flex",
          }}
        >
          TT
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

Criterio éxito:
- `curl https://tacotios-visitas.vercel.app/api/og/xokol -o /tmp/og.png` descarga PNG 1200x630.
- https://opengraph.dev/ pasa con URL `tacotios-visitas.vercel.app/xokol` y muestra la imagen generada.
```

### Item 1.6 — Sitemap + robots + canonical (audit items 22-23)

```
SUPERPROMPT 1.6:

Crear src/app/sitemap.ts:

```ts
import { restaurants } from "@/data/restaurants";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tacotios-visitas.vercel.app";
  const home = { url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 1 };
  const fichas = restaurants.map((r) => ({
    url: `${base}/${r.slug}`,
    lastModified: r.updated_at ? new Date(r.updated_at) : new Date(),
    changeFrequency: "monthly" as const,
    priority: r.has_dossier ? 0.8 : 0.5,
  }));
  return [home, ...fichas];
}
```

Crear src/app/robots.ts:

```ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://tacotios-visitas.vercel.app/sitemap.xml",
  };
}
```

Criterio éxito:
- `curl https://tacotios-visitas.vercel.app/sitemap.xml` devuelve XML con 150 URLs.
- `curl https://tacotios-visitas.vercel.app/robots.txt` devuelve robots válido.
```

### Item 1.7 — Botón compartir Web Share API (Prompt 8)

```
SUPERPROMPT 1.7:

En src/components/restaurant/RestaurantDetail.tsx (panel) Y src/components/restaurant/RestaurantPage.tsx (ruta full), en el sticky bar agregar segundo botón derecha del "Abrir en Maps":

```tsx
async function handleShare() {
  const url = `https://tacotios-visitas.vercel.app/${r.slug}`;
  const text = `${r.name} en La Anti-Guía de @tacotios`;
  if (typeof navigator !== "undefined" && navigator.share) {
    try { await navigator.share({ title: r.name, text, url }); } catch {}
    return;
  }
  try {
    await navigator.clipboard.writeText(url);
    // Toast inline 2s
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  } catch {}
}
```

Botón visual:
- Circulo 48x48 al lado del "Abrir en Maps"
- Background bg-bg-surface + border border-border-card
- Icono SVG share-iOS (arrow up out of box)
- aria-label="Compartir"
- Transición scale(0.97) en :active (Emil rule)

Toast inline minimalista (no librería): div fixed bottom-24 left-1/2 -translate-x-1/2, fondo dark, texto blanco, "Link copiado", auto-fade 2s con ease-out 300ms.

Criterio éxito:
- iOS Safari mobile: abre sheet nativo de compartir con título y URL.
- Desktop Chrome: clic copia URL al portapapeles + toast 2s.
- preview_screenshot del toast activo.
```

### Item 1.8 — Build + deploy + verificación

```bash
cd ~/Desktop/02_MARCA-TACOTIOS/tacotios-visitas
pnpm install
pnpm tsc --noEmit
pnpm build  # local build verde antes de deploy
vercel deploy --prod --yes
```

Tras deploy, verificaciones automáticas:
- `curl -s -o /dev/null -w "%{http_code}" https://tacotios-visitas.vercel.app/xokol` debe ser 200.
- `curl -s https://tacotios-visitas.vercel.app/xokol | grep -c "Xokol"` debe ser ≥ 3 (title, OG, h1).
- `curl -s https://tacotios-visitas.vercel.app/sitemap.xml | grep -c "<url>"` debe ser ≥ 150.
- `curl -I https://tacotios-visitas.vercel.app/api/og/xokol` content-type image/png.

### Item 1.9 — Commit + tag

```bash
git add -A && git commit -m "ciclo-1: rutas /[slug] + OG dinamica + JSON-LD + safe-area + share button + sitemap"
git tag pre-ciclo-2
```

---

## CRITERIO ÉXITO CICLO 1 (verificable)

Los 7 criterios pasan o el ciclo falla y rollback:

| # | Test | Comando | Esperado |
|---|---|---|---|
| 1 | Ruta ficha | `curl -s -o /dev/null -w "%{http_code}" /xokol` | `200` |
| 2 | Title en HTML | `curl -s /xokol \| grep -o "<title>[^<]*"` | contiene "Xokol" |
| 3 | OG meta | `curl -s /xokol \| grep -c "og:image"` | ≥ 1 |
| 4 | JSON-LD | `curl -s /xokol \| grep -c "application/ld+json"` | ≥ 1 |
| 5 | Sitemap | `curl -s /sitemap.xml \| grep -c "<url>"` | ≥ 150 |
| 6 | OG image | `curl -I /api/og/xokol` | `200 image/png` |
| 7 | Mobile screenshot | preview_resize 375x812 + screenshot ficha | sin overflow, share + maps visibles |

Plus: TypeScript pasa, Vercel deploy en `READY`, Lighthouse mobile ≥ 85 performance.

---

## ROLLBACK

Si falla 3+ items o build no compila tras 3 intentos:

```bash
cd ~/Desktop/02_MARCA-TACOTIOS/tacotios-visitas
git reset --hard pre-ciclo-1
vercel rollback
```

Reporte a Aniol con error exacto + qué intenté.

---

## OUTPUT EN DISCO

Al cerrar el ciclo, escribir:
- `PLAN_5_CICLOS/_LOG_CICLO_1.jsonl` — cada tool call, agent invocation, deploy attempt
- `PLAN_5_CICLOS/_METRICAS_CICLO_1.md` — Lighthouse antes/después, bundle size antes/después, # rutas estáticas generadas
- Commit `ciclo-1: ...` en repo
- Tag `pre-ciclo-2`
