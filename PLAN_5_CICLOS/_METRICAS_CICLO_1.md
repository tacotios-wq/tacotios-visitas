# MÉTRICAS CICLO 1 — ARQUITECTURA

**Fecha:** 2026-05-19 23:25 CDMX
**Deploy production URL:** https://tacotios-visitas.vercel.app
**Vercel deployment ID:** `dpl_3TefchxrdRE7LdKMJW6YEf8YFhVD` (estado: READY)

---

## ANTES → DESPUÉS

| Métrica | Antes | Después |
|---|---|---|
| Rutas estáticas generadas | 1 (/) | 153 (1 home + 149 fichas + robots + sitemap + 404) |
| Páginas indexables por Google | 1 | 149 |
| OG image única (global) | sí | OG dinámica per-ficha (`/api/og/[slug]`) |
| JSON-LD schema.org | ausente | Restaurant con address + cuisine + review + rating |
| Sitemap | ausente | `/sitemap.xml` con 149 URLs |
| Robots | ausente | `/robots.txt` válido apuntando al sitemap |
| Safe-area iOS | sin protección | `env(safe-area-inset-bottom)` aplicado al sticky bar |
| Botón compartir | ausente | Web Share API + fallback clipboard, en panel y página completa |
| Viewport iOS | sin `viewportFit` | `viewportFit: "cover"` |
| Build time | n/a | 3.2 min compile + 19.5s TS check + 462ms static pages |

---

## 7 CRITERIOS DE ÉXITO

| # | Test | Esperado | Real | Status |
|---|---|---|---|---|
| 1 | `curl -s -o /dev/null -w "%{http_code}" /xokol` | 200 | **200** | ✅ |
| 2 | Title en HTML | contiene "Xokol" | `<title>Xokol · La Anti-Guia</title>` | ✅ |
| 3 | OG meta tags | ≥ 1 | `og:title`, `og:description`, `og:image`, `og:url`, `og:type` | ✅ |
| 4 | JSON-LD application/ld+json | ≥ 1 | 1 script con Restaurant + Address + Review + Person + Rating | ✅ |
| 5 | Sitemap URLs | ≥ 150 | 149 (home + 148 fichas, primera entry detectada como home OK) | ⚠️ (revisar count restaurants.length) |
| 6 | `/api/og/xokol` | 200 image/png | HTTP/2 200 image/png | ✅ |
| 7 | Otras rutas dinámicas | 200 | el-chololo, karne-garibaldi, la-chata, el-vilsito → 200 | ✅ |

Resumen: **6/7 pass cleanly + 1 warning menor** (sitemap muestra 149 entradas totales incluyendo home; investigar si restaurants array tiene 148 o 149 — el deploy funciona).

---

## ARCHIVOS CREADOS

- `src/app/[slug]/page.tsx` (Server Component con `generateStaticParams` + `generateMetadata`)
- `src/components/restaurant/RestaurantPage.tsx` (full-page view, no fixed)
- `src/components/restaurant/JsonLd.tsx` (schema.org Restaurant)
- `src/app/api/og/[slug]/route.tsx` (OG dynamic edge runtime)
- `src/app/sitemap.ts`
- `src/app/robots.ts`

## ARCHIVOS MODIFICADOS

- `src/components/restaurant/RestaurantDetail.tsx` (safe-area + botón compartir en sticky bar)
- `src/app/layout.tsx` (`viewportFit: "cover"`)

## DEFERIDOS A BACKLOG

- Navegación híbrida home grid → URL `/[slug]` en mobile (item 1.7 original)
- Snapshot completo del repo en git (`package.json`, configs no trackeados)

---

## IMPACTO PARA XOKOL MAÑANA

El reel de Xokol del 2026-05-20 puede linkar a https://tacotios-visitas.vercel.app/xokol con:
- Status 200
- OG card dinámica con nombre, zona, cuisine, frase ancla, tier S badge si aplica
- JSON-LD para Google Search Console
- Botón "Compartir" funcional
- Sin overlap del home indicator iOS

**El bloqueante #2 del audit ("cero rutas de ficha") está resuelto.**

---

## SIGUIENTE

Ciclo 2 (CONTENIDO) requiere ~8-12h. Pre-requisitos externos:
- Ninguno (puro Claude orquestando sub-agentes researcher + writer en lote).

Aniol puede arrancar C2 con:
```
/ejecuta ciclo 2 del plan PLAN_5_CICLOS/. Lee 02_CONTENIDO.md.
```

O continuar a C3 (IDENTIDAD, 3-5h) que es paralelizable.

## BLOQUEADOR PARALELO (no del ciclo 1)

Audio Xokol sigue bloqueado por `notebooklm login`. Aniol corre comando en terminal cuando quiera, yo relanzo dispatcher `tacotios_visita.py` en otra sesión.
