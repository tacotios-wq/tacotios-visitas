# PLAN 5 CICLOS — tacotios-visitas hacia nivel Anti-Guía Bourdain

> Plan operativo para llevar tacotios-visitas.vercel.app de "inventario funcional" (estado 2026-05-19) a "manifiesto cultural digital nivel Anti-Guía". 5 ciclos secuenciales, autoejecutables, criterios verificables.

**Fecha de plan:** 2026-05-19
**Estado al cierre del plan:** web production-ready para mandar el reel de Xokol, los siguientes 100 reels @tacotios, el dossier UNESCO de Gloria López Morales, y el Mundial 2026.

---

## TABLA MAESTRA

| # | Ciclo | Objetivo | Tiempo estimado | Dependencia | Output verificable |
|---|---|---|---|---|---|
| 1 | **ARQUITECTURA** | Web es indexable, shareable, responsive, accesible | 4-6h | ninguna | `/xokol` devuelve 200 con OG + JSON-LD válido + share button + sin overlaps mobile |
| 2 | **CONTENIDO** | Cada ficha tiene dossier completo con tesis + frase ancla + 3 hooks + anclas de save | 8-12h | C1 (rutas existen) | 0 fichas con `has_dossier: true` y `historia: null`. 100% frase_ancla. 100% emocion_target |
| 3 | **IDENTIDAD** | Web grita "@tacotios" en 3 segundos al ojo nuevo. Manifiesto Anti-Guía leíble en 2 min | 3-5h | ninguna | Pasa Brand Bible check + Storynomics check. Foto Aniol arriba. About + Manifiesto + Footer trust |
| 4 | **DISTRIBUCIÓN** | Cada ficha es un nodo viral: share, embed reel, YouTube, tracking, OG por ciudad/serie | 4-6h | C1+C2 | Plausible recibe eventos. Embed reels en fichas visitadas. OG `/ciudad/cdmx` y `/serie/80tacos` |
| 5 | **ESCALA** | Operación 500+ fichas sin tocar git. Liz CRUD desde admin. Pipeline enrichment Python | 6-10h | ninguna | Liz añade restaurante sin pedir ayuda. Pipeline pobla lat/lng/phone/horario en 149 |
| **Total** | | | **25-40h Claude Code** | | |

---

## ORDEN DE EJECUCIÓN

Secuencial estricto **C1 → C2 → C4** (camino crítico para el reel de Xokol y siguientes).
Paralelizables **C3 y C5** durante o después de C1/C2.

```
C1 ─┬─ C2 ─┬─ C4 (lleva al usuario al máximo)
    │      │
    └─ C5 (operación) — paralelo
    
C3 (identidad) — paralelo en cualquier momento, ideal post-C2
```

Si Aniol tiene foco un fin de semana: C1 + C3 sábado (10h), C2 lunes-martes (12h), C4 + C5 miércoles-jueves (16h). Total 5 días Claude Code dirigido.

---

## CÓMO INVOCAR LA EJECUCIÓN

Aniol escribe uno de:

- **`/ejecuta ciclo 1`** → Claude lee `01_ARQUITECTURA.md`, monta TodoWrite con los items, ejecuta secuencial, deploy + verifica, reporta. Sin preguntar entre items.
- **`/ejecuta los 5`** → Claude ejecuta C1→C2→C3→C4→C5 en orden, sin parar. Reporte intermedio tras cada ciclo. Sin preguntar.
- **`/ejecuta ciclo N --rollback`** → Si algo falla, deshace y reporta.
- **`/diagnostico ciclo N`** → Solo corre la fase A (diagnóstico) del ciclo N, sin ejecutar.

**Reglas de autonomía durante ejecución:**

1. Las 5 decisiones humanas pendientes del [AUDIT_2026-05-19.md](../AUDIT_2026-05-19.md) las asumo con la recomendación del audit. NO pregunto.
2. Cualquier error de build, lo arreglo. Si tras 3 intentos no compila, rollback + reporte.
3. Cualquier error de Vercel deploy, lo arreglo. Si tras 2 intentos falla, rollback + reporte.
4. Si un sub-agente devuelve algo que viola Brand Bible (em-dashes, corporate-speak, "gourmet"), reescribo sin avisar.
5. Si encuentro un bug fuera de scope del ciclo actual, lo apunto en `BACKLOG_DESCUBIERTOS.md` y sigo.
6. No toco `.env*`, secretos, git credentials, ni archivos fuera del repo.

---

## DECISIONES PRE-ASUMIDAS (sin preguntar)

| Decisión | Recomendación que ejecuto |
|---|---|
| Tracking | Plausible Cloud trial 30d. Si Aniol no compra el plan después, cambio a PostHog gratis |
| Tiers de precio | $<200, $$200-450, $$$450-900, $$$$>900 MXN. Pongo todos en `null` y dejo nota para Liz |
| Fotos | NO Unsplash. NO Google Places. Placeholder Anderson sigue. Slot Supabase Storage listo para fotos propias futuras |
| YouTube por ficha | Solo el video de la visita. Campo `youtube_video_id` opcional |
| Address/phone/IG | Campos en modelo con null. Sin poblar. Liz spreadsheet aparte |
| Admin panel | Auth Supabase básica (magic link). Solo Aniol + Liz. CRUD restaurantes + dossiers |
| Tracking IDs | Plausible domain `tacotios-visitas.vercel.app` |

---

## CRITERIOS DE ÉXITO GLOBAL (post 5 ciclos)

Web pasa los siguientes 7 tests sin trampa:

1. **Test reel:** comparto `tacotios-visitas.vercel.app/xokol` en WhatsApp. La OG card muestra el nombre + cocina + city + zona. Click abre la ficha completa en 1.5s en mobile 4G.
2. **Test Google:** `site:tacotios-visitas.vercel.app` en Google devuelve 50+ fichas indexadas a los 7 días post-deploy.
3. **Test Bourdain:** un visitante que llega del reel sabe en 30s quién es @tacotios y por qué hace esto. Lee la tesis HERENCIA implícita.
4. **Test mobile:** abro en iPhone 15 Pro (375x812). Cero overlaps, cero scroll horizontal, cero contenido tapado por home indicator.
5. **Test Liz:** Liz añade un restaurante nuevo (nombre + ciudad + zona) desde admin web. Aparece en la lista a los 30 segundos sin git push.
6. **Test Brand Bible:** corro `/brand-voice enforce` en 5 dossiers random. Pasa los 5 sin reescritura.
7. **Test tracking:** abro Plausible dashboard. Veo `Maps Click`, `Audio Play`, `Restaurant View` con breakdown por slug y por ciudad.

---

## SI ALGO SALE MAL — PROTOCOLO ROLLBACK

Cada ciclo termina con commit explícito + tag. Si la verificación falla y no logro arreglarlo en los intentos pre-acordados:

```bash
cd ~/Desktop/02_MARCA-TACOTIOS/tacotios-visitas
git reset --hard pre-ciclo-N
vercel rollback
```

Reporte a Aniol incluye: qué falló, qué intenté, qué necesito de él. NO continúo al siguiente ciclo.

---

## TRACKING Y APRENDIZAJE

Cada ciclo deja:
- `PLAN_5_CICLOS/_LOG_CICLO_N.jsonl` con cada acción tomada (timestamp, agent invocado, tool, outcome).
- `PLAN_5_CICLOS/_METRICAS_CICLO_N.md` con números antes/después: bundle size, Lighthouse, número de fichas con dossier, etc.
- Commit en repo con mensaje `ciclo-N: <resumen>`.
- Push a Vercel con tag `pre-ciclo-(N+1)` antes del siguiente.

---

## ARCHIVOS DEL PLAN

- [01_ARQUITECTURA.md](01_ARQUITECTURA.md) — Rutas, OG, JSON-LD, responsive, safe-area, share
- [02_CONTENIDO.md](02_CONTENIDO.md) — Rellenar 62 fichas vacías + QA editorial de las 87 existentes
- [03_IDENTIDAD.md](03_IDENTIDAD.md) — About, manifiesto, foto Aniol, footer trust, Design System
- [04_DISTRIBUCION.md](04_DISTRIBUCION.md) — Tracking, embed reels, YouTube, OG por ciudad/serie, share
- [05_ESCALA.md](05_ESCALA.md) — Supabase migración, admin Liz, pipeline enrichment Python

---

## NOTA SOBRE INFINITUM

Este plan NO es un ciclo Infinitum (que es protocolo de descubrimiento + skill chain). Esto es plan táctico con superprompts. Cuando termine cada ciclo, registro en `~/.claude/memory/infinitum_log.jsonl` como aprendizaje (ciclo N completado, qué funcionó, qué no).
