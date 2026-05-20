# CICLO 4 — DISTRIBUCIÓN + VIRALIDAD

> Cada ficha es un nodo viral: share fácil, embed reel @tacotios, YouTube embed, tracking completo, OG por ciudad y por serie. Después del reel de Xokol, la web tiene que ser amplificadora, no embudo.
> **Tiempo estimado:** 4-6h Claude Code dirigido.
> **Pre-requisito:** Ciclo 1 (rutas + share) y Ciclo 2 (contenido en fichas).
> **Output:** Plausible recibe eventos. Embed reels en fichas visitadas. OG `/ciudad/cdmx` y `/serie/80tacos`.

---

## FASE A — DIAGNÓSTICO (20 min)

```
SUBAGENT general-purpose, prompt:

Audita la capacidad de distribución y viralidad de tacotios-visitas.vercel.app.

1. WebFetch home + 5 fichas + 2 fichas con content_links no vacío. Identifica si content_links se renderiza.
2. Read src/components/ buscando: tracking calls (plausible, posthog, ga), share buttons, embed iframes (YouTube, Instagram), OG per-page logic, deep link patterns.
3. Verifica:
   - ¿`<script data-domain>` de Plausible? Sí/No.
   - ¿Componente para embed reel Instagram? Sí/No.
   - ¿Componente para embed YouTube? Sí/No.
   - ¿Botón compartir? (debería estar tras C1) Sí/No.
   - ¿OG por ciudad (`/ciudad/cdmx`) y por serie (`/serie/80tacos`)? Sí/No.
4. Para 3 reels recientes de @tacotios en Instagram (suponiendo handles públicos), ¿se pueden embeber via oEmbed o iframe directo?
5. Lista los content_links existentes en src/data/restaurants.ts. Hay enlaces a Instagram, YouTube, Spotify?

Output: estado real + lista de gaps. Max 500 palabras. Guarda en `PLAN_5_CICLOS/_DIAG_CICLO_4.md`.
```

---

## FASE B — PLANIFICACIÓN

Herramientas internas:
- **Skills:** `viral-content`, `content-engine`, `crosspost`, `claude-youtube`, `x-research` (para validar embeds)
- **Agents:** `architect`, `code-reviewer`, `e2e-runner`
- **MCP:** `Vercel` (analytics), `Slack`/`Email` para alertas
- **Externas:** Plausible Cloud (trial), Instagram oEmbed API (público), YouTube IFrame API

---

## FASE C — EJECUCIÓN

### Item 4.1 — Pre-flight

```bash
git tag pre-ciclo-4 || true
cat PLAN_5_CICLOS/_DIAG_CICLO_4.md
```

### Item 4.2 — Plausible tracking (Prompt 7 del audit)

```
SUPERPROMPT 4.2:

Setup Plausible Cloud trial 30d (free) para tacotios-visitas.vercel.app.

1. En src/app/layout.tsx en <head>:

<script
  defer
  data-domain="tacotios-visitas.vercel.app"
  src="https://plausible.io/js/script.tagged-events.js"
/>
<script dangerouslySetInnerHTML={{ __html: `window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }` }} />

2. Eventos custom en componentes:

a) src/components/restaurant/RestaurantDetail.tsx + RestaurantPage.tsx
   - handler "Abrir en Maps": antes del window.open → `window.plausible?.("Maps Click", { props: { slug: r.slug, city: r.city, has_dossier: r.has_dossier } })`
   - handler "Compartir": tras navigator.share o clipboard → `window.plausible?.("Share", { props: { slug: r.slug } })`

b) src/components/preparacion/AudioPlayer.tsx
   - En togglePlay cuando isPlaying pasa de false a true → `window.plausible?.("Audio Play", { props: { slug } })`
   - Pasar prop `slug` desde DossierView.

c) src/app/page.tsx (home grid)
   - En el handler onSelect cuando abre panel/navega → `window.plausible?.("Restaurant View", { props: { slug: r.slug, source: "grid" } })`

d) src/components/preparacion/YouTubeEmbed.tsx (tras item 4.4)
   - En el click que reemplaza thumb con iframe → `window.plausible?.("YouTube Play", { props: { slug, video_id } })`

3. Aniol debe registrar el dominio en https://plausible.io/sites/new manualmente. Reportar instrucción en el output.

Criterio éxito:
- Network tab muestra POST a plausible.io/api/event al hacer Maps Click.
- Console: `window.plausible` definido.
- Lighthouse no penaliza performance (defer + tiny script).
```

### Item 4.3 — Embed reel Instagram via content_links

```
SUPERPROMPT 4.3:

Crear src/components/preparacion/InstagramEmbed.tsx:

```tsx
"use client";
import { useEffect, useRef } from "react";

export function InstagramEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!(window as any).instgrm) {
      const script = document.createElement("script");
      script.src = "https://www.instagram.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      (window as any).instgrm.Embeds.process();
    }
  }, [url]);
  return (
    <div ref={containerRef} className="my-6">
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{ background: "transparent", border: 0, margin: 0, maxWidth: 540 }}
      />
    </div>
  );
}
```

En src/components/dossier/DossierView.tsx después de la sección de "El angulo" o al final del dossier:

- Si `restaurant.content_links` contiene URLs de instagram.com/reel/ o instagram.com/p/, renderizar 1-2 embeds bajo header "Reels de @tacotios sobre esto" o "Lo que ya hice aquí".
- Filtrar por host = instagram.com.
- Si no hay ninguno, NO renderizar la sección.

Criterio éxito:
- En una ficha con content_links válido, aparece el embed Instagram cargado.
- Lighthouse no rompe (lazy via useEffect).
```

### Item 4.4 — YouTube embed lazy (Prompt 9 del audit)

```
SUPERPROMPT 4.4:

En src/types/index.ts ya tiene `youtube_video_id?: string | null` (añadir si falta) en Dossier.

Crear src/components/preparacion/YouTubeEmbed.tsx con patrón Lite YouTube:

```tsx
"use client";
import { useState } from "react";

export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const thumb = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;

  if (loaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="aspect-video w-full rounded-lg"
      />
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        setLoaded(true);
        if (typeof window !== "undefined") {
          (window as any).plausible?.("YouTube Play", { props: { video_id: videoId } });
        }
      }}
      className="group relative block aspect-video w-full overflow-hidden rounded-lg"
      aria-label={`Reproducir ${title}`}
    >
      <img
        src={thumb}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-200 group-hover:bg-black/40">
        <svg
          width={68}
          height={48}
          viewBox="0 0 68 48"
          aria-hidden
          className="opacity-95 transition-transform duration-200 group-active:scale-97"
        >
          <path d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74 0 13.05 0 24 0 24s0 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C68 34.95 68 24 68 24s0-10.95-1.48-16.26z" fill="#f00"/>
          <path d="M45 24L27 14v20" fill="#fff"/>
        </svg>
      </div>
    </button>
  );
}
```

En src/components/dossier/DossierView.tsx después de PreparacionMentalSection, si `dossier.youtube_video_id` existe:

```tsx
{dossier.youtube_video_id && (
  <section className="my-8">
    <h3 className="text-sm uppercase tracking-widest text-text-muted mb-3">El video largo</h3>
    <YouTubeEmbed videoId={dossier.youtube_video_id} title={`${restaurant.name} · @tacotios`} />
  </section>
)}
```

Criterio éxito:
- En ficha con youtube_video_id="dQw4w9WgXcQ" (placeholder test), thumb carga rápido.
- Click reemplaza con iframe y autoplay.
- Plausible event "YouTube Play" se dispara.
```

### Item 4.5 — OG por ciudad + por serie (audit item 44)

```
SUPERPROMPT 4.5:

Crear src/app/ciudad/[city]/page.tsx Server Component:

- generateStaticParams: lista de cities únicas de restaurants.
- generateMetadata: title "Restaurantes en {city} · La Anti-Guía", description "{count} lugares en {city} de la Anti-Guía de @tacotios", openGraph image `/api/og/ciudad/${city}`.
- Página renderiza grid filtrado por city.

Crear src/app/serie/[serie]/page.tsx similar para series (80tacos, lsdt, etc.):
- Filtro por r.series.some(s => s.id === param).

Crear src/app/api/og/ciudad/[city]/route.tsx y src/app/api/og/serie/[serie]/route.tsx siguiendo patrón de `/api/og/[slug]` pero con título "Restaurantes en {city}" o "Serie {name}".

Actualizar sitemap.ts para incluir todas las /ciudad/* y /serie/*.

Criterio éxito:
- `curl -s -o /dev/null -w "%{http_code}" /ciudad/cdmx` → 200
- `curl -s -o /dev/null -w "%{http_code}" /serie/80tacos` → 200
- OG images custom funcionan.
- Sitemap incluye 9 ciudades + 7 series + 149 fichas + home + /sobre = ~166 URLs.
```

### Item 4.6 — Share por bloque dentro del dossier (audit item 16+33)

```
SUPERPROMPT 4.6:

En src/components/dossier/DossierView.tsx, al final del bloque "Frase ancla" agregar mini-share:

```tsx
<button
  onClick={() => {
    const text = `"${dossier.frase_ancla}" — @tacotios`;
    if (navigator.share) {
      navigator.share({ text, url: `https://tacotios-visitas.vercel.app/${slug}` });
    } else {
      navigator.clipboard.writeText(text + " " + `https://tacotios-visitas.vercel.app/${slug}`);
    }
    window.plausible?.("Share Phrase", { props: { slug } });
  }}
  className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-accent-amber hover:underline"
>
  Compartir esta frase ↗
</button>
```

Igual para el bloque "Tesis central": botón "Compartir tesis".

Criterio éxito: cada bloque editorial tiene un punto de share contextual.
```

### Item 4.7 — Build + deploy + verificación

```bash
pnpm tsc --noEmit
pnpm build
vercel deploy --prod --yes
```

Verificación:
- Plausible dashboard recibe eventos en <5 min de uso real.
- `curl -s /ciudad/cdmx | head -50` muestra HTML con OG correcto.
- Embeds Instagram + YouTube cargan en ficha con content_links + youtube_video_id.

### Item 4.8 — Commit + tag

```bash
git add -A && git commit -m "ciclo-4: distribucion — plausible + embeds Instagram/YouTube + OG ciudad/serie + share por bloque"
git tag pre-ciclo-5
```

---

## CRITERIO ÉXITO CICLO 4 (verificable)

| # | Test | Esperado |
|---|---|---|
| 1 | Plausible script presente | `curl -s / \| grep -c "plausible.io/js"` ≥ 1 |
| 2 | Eventos custom suscritos | grep -c "plausible?." src/ ≥ 5 |
| 3 | Ruta /ciudad/cdmx existe | curl 200 |
| 4 | Ruta /serie/80tacos existe | curl 200 |
| 5 | OG ciudad funcional | curl /api/og/ciudad/cdmx → image/png |
| 6 | Instagram embed lazy | Read source, no script en SSR |
| 7 | YouTube embed lazy | Click required para iframe |
| 8 | Sitemap actualizado | ≥ 166 URLs |
| 9 | Lighthouse no degrada | mobile perf ≥ 85 |

---

## ROLLBACK

```bash
git reset --hard pre-ciclo-4
vercel rollback
```

---

## OUTPUT EN DISCO

- `PLAN_5_CICLOS/_DIAG_CICLO_4.md`
- `PLAN_5_CICLOS/_LOG_CICLO_4.jsonl`
- `PLAN_5_CICLOS/_METRICAS_CICLO_4.md` — # eventos tracking, # OG nuevas, # embeds, peso bundle antes/después
- Commit `ciclo-4: distribucion`
- Tag `pre-ciclo-5`
- Manual de Aniol: cómo darse de alta en Plausible, cómo añadir youtube_video_id a un dossier
