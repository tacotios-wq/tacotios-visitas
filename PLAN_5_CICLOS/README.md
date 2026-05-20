# PLAN 5 CICLOS — Cómo se invoca

## Para arrancar ejecución completa

En una sesión Claude Code (cualquier dir, abro yo el repo):

```
/ejecuta los 5 ciclos del plan en PLAN_5_CICLOS/. Sin preguntar entre items. Aplica las 5 decisiones pre-asumidas del master. Si algo falla 3 intentos, rollback y reporte. Lee 00_MASTER.md primero.
```

## Para arrancar un ciclo aislado

```
/ejecuta ciclo 1 del plan PLAN_5_CICLOS/. Lee 01_ARQUITECTURA.md y ejecuta items 1.1 a 1.9 secuencial. Deploy al final. Verifica los 7 criterios éxito.
```

Sustituir `1` por el ciclo deseado (1-5).

## Para correr solo diagnóstico

```
/diagnostico ciclo 3 del plan PLAN_5_CICLOS/. Solo fase A.
```

## Para rollback explícito

```
/ejecuta ciclo N --rollback del plan PLAN_5_CICLOS/.
```

---

## Estimación total

- C1 ARQUITECTURA: 4-6h
- C2 CONTENIDO: 8-12h
- C3 IDENTIDAD: 3-5h
- C4 DISTRIBUCIÓN: 4-6h
- C5 ESCALA: 6-10h

**Total: 25-40h Claude Code dirigido.**

Si Aniol lo arranca al mismo tiempo en una sola sesión "los 5 ciclos", la sesión va a durar 1-2 días. Considerar dividir en 3 sesiones de 8-12h cada una.

---

## Pre-requisitos antes de arrancar

1. `notebooklm login` corrido si el audio de Xokol no quedó listo el 19 may.
2. Plausible Cloud cuenta creada (para C4) — gratis trial 30d, https://plausible.io/sites/new con domain `tacotios-visitas.vercel.app`.
3. Supabase project creado (para C5) — gratis tier, https://supabase.com/dashboard, anotar URL + ANON_KEY + SERVICE_ROLE_KEY en `.env.local` del repo.
4. Google Cloud project con Places API habilitada + key (para C5 enrichment) — costo ~$6 por las 149 búsquedas, billing activado.
5. Foto de Aniol disponible (para C3) — puede ser placeholder SVG con iniciales si no hay.

Sin 1: salta audio Xokol manualmente después.
Sin 2: C4 falta tracking, todo lo demás funciona.
Sin 3: C5 entero queda bloqueado. Web sigue con static data como hoy.
Sin 4: C5 corre admin pero sin enrichment automático.
Sin 5: C3 usa placeholder.

---

## Archivos

- [00_MASTER.md](00_MASTER.md) — visión, tabla maestra, decisiones pre-asumidas, criterios globales
- [01_ARQUITECTURA.md](01_ARQUITECTURA.md)
- [02_CONTENIDO.md](02_CONTENIDO.md)
- [03_IDENTIDAD.md](03_IDENTIDAD.md)
- [04_DISTRIBUCION.md](04_DISTRIBUCION.md)
- [05_ESCALA.md](05_ESCALA.md)
- `_DIAG_CICLO_N.md` — diagnósticos por ciclo (se generan en ejecución)
- `_LOG_CICLO_N.jsonl` — log estructurado de cada ciclo
- `_METRICAS_CICLO_N.md` — antes/después por ciclo
- `BACKLOG_DESCUBIERTOS.md` — items fuera de scope encontrados durante ejecución
