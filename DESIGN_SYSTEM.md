# Sistema de diseño — tacotios-visitas

> Apple-light editorial. La fuente de verdad viva es `src/app/globals.css` (`@theme inline` + `:root`). Este doc explica las reglas; el CSS las implementa.
> (Distinto del `DESIGN_SYSTEM_TACOTIOS.md` global, que es el sistema dark-modern para pitches a marcas. Este es el de la web pública.)

## Dirección
La Anti-Guía de @tacotios: "No existe mejor, existe favorito". Editorial, no corporativo. Calma Apple + carácter de revista. Uso real prioritario: móvil, en el Uber, escuchando el audio.

## Color (tokens en globals.css)
- Fondo: `#ffffff` / surface `#f5f5f7` / elevated `#fafafa`.
- Texto: primary `#1d1d1f` · **secondary `#5c5c61`** · muted `#6e6e73` (dos grises reales = jerarquía + margen WCAG AA).
- Acento negro `#1d1d1f` (el "negro" ancla la jerarquía).
- Cálido (tier-S, único color): `--color-warm #985d11` para **texto/badge** (legible AA 4.9:1) · `--color-warm-fill #b8731a` solo para **fills gráficos grandes** (markers, dots). NUNCA usar #b8731a en texto pequeño (falla AA).
- Regla: el ámbar = un solo significado (excelencia / tier-S / featured). "watch/observación" usa su propio dot, no roba el ámbar.

## Elevación (nueva — antes plano)
`--shadow-card` (cards normales, se despegan del fondo) · `--shadow-raised` (hover) · `--shadow-featured` (tier-S, halo cálido tenue). `.glass` ya las trae.

## Tipografía (Helvetica Neue, system, sin webfonts)
Carácter por **peso + escala + tracking + ritmo**, nunca por mezclar familias.
- Hero: `.editorial-display` + `font-bold` (700) + `text-wrap: balance`. Es el negro más fuerte de la página.
- Prosa larga: `.prose-editorial` (`text-wrap: pretty` + micro-tightening -0.011em).
- Eyebrow: `.eyebrow` (uppercase, 0.08em, tnum). En dossier el número es índice editorial grande y tenue, no prefijo.
- Quote (frase ancla): `.quote` (400, hanging-punctuation, balance).
- Stats: `.stat-number` (tnum + lnum, line-height 1).
- Pesos: 700 hero · 600 títulos · 500 labels · 400 prosa/italic.

## Espaciado
`--space-2xs … --space-3xl` con saltos no lineales. Regla: salto pequeño DENTRO de un grupo, salto grande ENTRE grupos. No usar el mismo gap dentro y entre bloques.

## Motion (reglas Emil)
- `--ease-out` cubic-bezier(0.16,1,0.3,1) entradas · `--ease-in-out` (0.65,0,0.35,1) movimiento · `--ease-spring` momentos físicos (markers, share pop).
- UI <300ms. `.btn-press` (scale 0.97, 100ms) en todo interactivo. Solo animar transform/opacity (la barra de audio usa scaleX, no width).
- Entradas de lista: `.animate-fade-up-item` (420ms) + stagger ≤6×45ms.
- Deleite signature: `.animate-share-pop` (check del compartir) · `.play-btn.is-playing` (el play respira mientras reproduce).
- `prefers-reduced-motion` global + hover gates `@media (hover:hover)`.

## Mobile / detalle
- Touch targets ≥44px. `-webkit-tap-highlight-color: transparent` + `overscroll-behavior-y: none`. Overlays bloquean el scroll del body. `safe-area-inset` en sticky bars (en el contenido, no solo el wrapper). `.scrollbar-none` para scrollers horizontales.
- AudioPlayer: MediaSession (lock screen), ±15s, seek táctil. El audio domina su sección (no 50/50 con video).

## Anti-template (lo que NO hacemos)
Cards uniformes sin jerarquía · dossier "dashboard-by-numbers" (el número es editorial) · gris-sobre-blanco genérico (hay dos grises + elevación + ámbar semántico) · emojis decorativos (dots tipográficos) · motion default (curvas custom siempre).

## Entorno (importante)
Node 25 local **cuelga `next build` y `tsc`**. Verificar SIEMPRE vía `vercel deploy --prod --yes` (compila en Vercel). Ver `~/.claude/.../reference_tacotios_visitas_build_deploy.md`.
