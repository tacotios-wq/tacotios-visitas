# CICLO 2 — CONTENIDO EDITORIAL

> Cada ficha tiene dossier completo nivel Bourdain. Cero dossiers vacíos. Frase ancla en todos. QA Brand Bible + Storynomics.
> **Tiempo estimado:** 8-12h Claude Code dirigido con paralelización fuerte.
> **Pre-requisito:** Ciclo 1 (rutas existentes para que el contenido tenga dónde vivir).
> **Output:** 0 fichas `has_dossier: true && historia: null`. 100% frase_ancla. 100% emocion_target. Brand Bible check pasa en 10 fichas random.

---

## FASE A — DIAGNÓSTICO (30 min)

Subagente que cuenta y categoriza el estado real del contenido:

```
SUBAGENT general-purpose, prompt:

Audita el contenido editorial de tacotios-visitas. Lee src/data/restaurants.ts y produce:

1. **Conteo:**
   - Total restaurants: ¿cuántos?
   - has_dossier=true: ¿cuántos?
   - has_dossier=true && existe en dossiers: ¿cuántos?
   - has_dossier=true && dossiers[r.id] null o sin historia: ¿cuántos? (LOS HUECOS)
   - has_dossier=false: ¿cuántos?

2. **Calidad de los existentes:**
   - Cuántos tienen frase_ancla
   - Cuántos tienen emocion_target
   - Cuántos tienen tesis_central
   - Cuántos tienen audio_url (preparación mental)
   - Longitud media de historia (palabras)
   - Cuántos hooks por ficha en promedio

3. **Distribución por ciudad:**
   - CDMX, GDL, La Paz, Ensenada, MTY, Oaxaca, Puebla, Mazatlán, Nápoles: cuántos sin dossier completo

4. **Lista de huecos prioritarios:**
   - Top 20 fichas sin dossier ordenadas por viral_score DESC y por city in (CDMX, GDL) primero
   - Top 20 fichas con dossier pero sin frase_ancla
   - Top 10 fichas con dossier vacío en `pedir` o `preguntas`

5. **Patrones detectados:**
   - Hooks duplicados o muy similares entre fichas (Hamming distance)
   - Dossiers que usan corporate-speak o "gourmet" (rechazar)
   - Dossiers con em-dashes (rechazar Aniol-style)

Output formato tabla + listas. 500-800 palabras. Sin em-dashes. Guarda el reporte en `PLAN_5_CICLOS/_DIAG_CICLO_2.md`.
```

---

## FASE B — PLANIFICACIÓN

Herramientas internas:
- **Skills:** `visita-prompt`, `storynomics`, `content-strategy`, `content-humanizer`, `de-ai-ify`, `copywriting`, `viral-content`, `morder-al-espectador`
- **Agents:** `researcher` (uno por ficha, paralelizable), `writer` (voz Aniol), `reviewer` (QA)
- **Brand Bible:** `~/Desktop/02_MARCA-TACOTIOS/BRAND_BIBLE_TACOTIOS_v1.md`
- **MCP:** Web tools para research por ficha

Modelo de paralelización:
- Batch de 5-10 fichas por lote.
- Cada ficha = 1 sub-agente researcher con prompt único.
- Tras research, otro sub-agente writer genera dossier en formato exacto.
- QA con script de validación.

---

## FASE C — EJECUCIÓN

### Item 2.1 — Pre-flight + load diagnóstico

```bash
git tag pre-ciclo-2 || true
cat PLAN_5_CICLOS/_DIAG_CICLO_2.md  # leer lista de huecos
```

### Item 2.2 — Generar template superprompt para research por ficha

Crear `PLAN_5_CICLOS/_TEMPLATE_RESEARCH_FICHA.md` con el prompt maestro reutilizable. Es el mismo que usamos para Xokol pero parametrizado.

```
SUPERPROMPT 2.2 (template, ejecutado N veces, una por ficha sin dossier):

SUBAGENT researcher, prompt:

Investigación profunda para visita @tacotios al restaurante **{NAME}** en {CITY}, {ZONE}. Cocina: {CUISINE}. Score: {VIRAL_SCORE}.

CONTEXTO: Aniol Guell (@tacotios) divulga gastronomía mexicana en redes. Posicionamiento Anti-Guía (Bourdain), tono cercano-apasionado-honesto. Filtro: "lo recomendaría a mi mejor amigo". Doctrina: persona > lugar > platos.

Reporta en español con 12 campos exactos (formato markdown estricto):

## 1. NOMBRE_OFICIAL
## 2. DIRECCION (zona + ciudad + dirección si encuentras)
## 3. CHEF_PROPIETARIO (200-300 palabras, historia humana, vulnerabilidad)
## 4. TESIS_CENTRAL (single paragraph, 300-400 palabras, "X parece Y. Pero es Z. La razón:")
## 5. FRASE_ANCLA (1 oración max 20 palabras, sin em-dashes, paradoja + carga)
## 6. EMOCION_TARGET (1-3 palabras)
## 7. PLATOS_FIRMA (3-7 platos con why)
## 8. TECNICA_DIFERENCIAL
## 9. CONTEXTO_CULTURAL
## 10. PRENSA_DESTACADA (5-10 URLs con nota)
## 11. ANGULOS_NARRATIVOS_3 (3 ángulos: título + transformación + por qué funciona)
## 12. RED_FLAGS

Reglas:
- Cero em-dashes
- Cero corporate-speak ("gourmet", "alta cocina", "experiencia culinaria", "fusión")
- Honesto: si no verificas algo, lo dices
- Nivel de confianza final: alta / media / baja

Max 1500 palabras totales.
```

### Item 2.3 — Generar el dossier final para `restaurants.ts`

Otro sub-agente writer toma el research y produce el bloque exacto de TypeScript a insertar en `dossiers` de `restaurants.ts`.

```
SUPERPROMPT 2.3 (template, ejecutado por ficha post-research):

SUBAGENT writer, prompt:

Dado el research de la ficha {NAME} (en archivo {PATH_RESEARCH}), genera el dossier final en formato TypeScript para insertar en `dossiers` de `src/data/restaurants.ts`.

Forma exacta:

```ts
"{ID_FICHA}": {
  id: "d{ID_FICHA}", restaurant_id: "{ID_FICHA}",
  historia: "...", // 200-300 palabras, single paragraph, voz Aniol
  hooks: ["...", "...", "..."], // 3 hooks, cada uno 1-2 oraciones, paradoja o carga
  datos: ["...", "...", "...", "..."], // 4 datos clave verificables
  pedir: [{ name: "...", why: "..." }, ...], // 2-4 platos
  preguntas: [{ role: "...", texto: "..." }, ...], // 2-3 preguntas para Aniol al chef/comensal
  candidatura_status: "si" | "watch" | "no",
  candidatura_razon: "...",
  angulo: "...", // descripción visual del reel: planos + frase nuclear
  alertas: ["...", "..."], // red flags + cosas a confirmar in-situ
  audio_url: null,
  audio_duration_s: null,
  emocion_target: "...",
  frase_ancla: "...",
  tesis_central: "...",
  prepared_at: "2026-05-19",
},
```

Reglas de voz (NO negociables):
- Cero em-dashes (—). Comas, paréntesis, puntos.
- Cero corporate-speak.
- Honesto. Si no sabes algo, no inventes.
- Frase_ancla es la herramienta más potente: paradoja + carga emocional + nombre propio si aplica.
- emocion_target en 1-3 palabras únicas y precisas, no "alegría" genérica.

Output ÚNICO: el bloque ts listo para pegar. Sin explicación adicional.
```

### Item 2.4 — Loop de ejecución (60-90 min por lote de 10 fichas)

```python
# Pseudocode del loop que Claude Code ejecuta:

huecos = parse_diag("PLAN_5_CICLOS/_DIAG_CICLO_2.md")  # lista de IDs sin dossier
huecos_priorizados = sort_by(huecos, key=lambda r: (-r.viral_score, r.city in ["Guadalajara", "CDMX"], r.name))

for batch in chunks(huecos_priorizados, size=5):
    # Paralelo: 5 sub-agents researcher
    research_results = parallel_invoke(
        [Agent(researcher, prompt_template_2_2.format(r)) for r in batch]
    )
    # Paralelo: 5 sub-agents writer
    dossier_blocks = parallel_invoke(
        [Agent(writer, prompt_template_2_3.format(r, research_results[r.id])) for r in batch]
    )
    # Insert en restaurants.ts (validar TS antes)
    for r, block in zip(batch, dossier_blocks):
        insert_dossier(repo_path, r.id, block)
    
    # Build verifica
    if not run("pnpm tsc --noEmit"):
        rollback_batch(batch)
        report_fail(batch)
        break
    
    # Commit por batch
    git_commit(f"ciclo-2: batch de {len(batch)} dossiers ({[r.name for r in batch]})")
```

Si el repo tiene 62 huecos identificados, son ~12 batches de 5 fichas. Cada batch 30-45 min real (research + write + insert + verify). Total 6-9h.

### Item 2.5 — QA editorial al pasar por las 87 fichas existentes

```
SUPERPROMPT 2.5:

Para cada uno de los 87 dossiers existentes, correr QA con 3 skills en paralelo:

1. `/brand-voice enforce <texto historia>` — pasa el filtro de voz @tacotios? Si NO, reescribir con el output del skill.
2. `/storynomics check <texto historia>` — pasa los 5/5 ítems? protagonista NO es Aniol, significado pre-cargado, etc.
3. `/de-ai-ify <texto>` — limpia jerga AI-generada. Si detecta corporate-speak, reescribe.

QA gates:
- Frase ancla sin em-dashes.
- Si historia tiene "gourmet", "alta cocina", "experiencia culinaria", "fusión", "leverage", "stakeholders" → reescribir.
- Si hooks duplican estructura entre fichas (3+ con misma plantilla), reescribir el más débil.

Reportar al final: cuántas pasaron sin tocar / cuántas reescritas / patrones detectados.
```

### Item 2.6 — Build + deploy + verificación

```bash
pnpm tsc --noEmit
pnpm build
vercel deploy --prod --yes
```

Verificación post-deploy:
- `curl -s https://tacotios-visitas.vercel.app/sitemap.xml | grep -c "<url>"` ≥ 150
- Random sample 10 fichas: cada una tiene meta description con primer hook real (no placeholder).
- Plausible (si C4 ya corrió): bounce rate por ficha < 70%.

### Item 2.7 — Commit + tag final

```bash
git add -A && git commit -m "ciclo-2: 62 dossiers nuevos + QA editorial 87 existentes + frase_ancla en 100%"
git tag pre-ciclo-3
```

---

## CRITERIO ÉXITO CICLO 2 (verificable)

| # | Test | Esperado |
|---|---|---|
| 1 | `grep -c 'historia: null' src/data/restaurants.ts` para entries con has_dossier:true | `0` |
| 2 | `grep -c 'frase_ancla:' src/data/restaurants.ts` | ≥ 149 |
| 3 | `grep -c 'emocion_target:' src/data/restaurants.ts` | ≥ 149 |
| 4 | `grep -c '—' src/data/restaurants.ts` (em-dashes) | `0` |
| 5 | `grep -ciE 'gourmet\|alta cocina\|experiencia culinaria\|leverage\|stakeholders' src/data/restaurants.ts` | `0` |
| 6 | Brand Bible check en 10 fichas random | 10/10 pasan |
| 7 | Storynomics check en 5 dossiers tier-S | 5/5 pasan |
| 8 | `pnpm build` | verde |
| 9 | Vercel deploy | READY |

---

## ROLLBACK

Por batch (no por ciclo completo). Si un batch falla:
```bash
git reset --hard HEAD~1  # solo deshace el último batch
```
El ciclo continúa con el siguiente batch.

Si tras 3 batches fallidos consecutivos:
```bash
git reset --hard pre-ciclo-2
```
Reporte a Aniol con patrón de fallo.

---

## OUTPUT EN DISCO

- `PLAN_5_CICLOS/_DIAG_CICLO_2.md` (diagnóstico inicial)
- `PLAN_5_CICLOS/_RESEARCH_BATCH_N.md` (research por batch, archivado)
- `PLAN_5_CICLOS/_LOG_CICLO_2.jsonl`
- `PLAN_5_CICLOS/_METRICAS_CICLO_2.md` — # fichas con dossier antes/después, longitud media historia, # frase_ancla, hooks duplicados detectados
- Commits incrementales `ciclo-2: batch N`
- Tag `pre-ciclo-3`
