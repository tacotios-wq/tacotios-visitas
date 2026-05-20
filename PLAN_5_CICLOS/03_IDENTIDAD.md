# CICLO 3 — IDENTIDAD + BRAND

> Web grita "@tacotios" en 3 segundos al ojo nuevo. Manifiesto Anti-Guía leíble en 2 min. Foto Aniol arriba. Tesis HERENCIA implícita en cada página.
> **Tiempo estimado:** 3-5h Claude Code dirigido.
> **Pre-requisito:** ninguno (paralelizable con C2).
> **Output:** pasa Brand Bible check + Storynomics check. Visitante nuevo entiende quién es Aniol y por qué hace esto.

---

## FASE A — DIAGNÓSTICO (15 min)

```
SUBAGENT general-purpose, prompt:

Audita la identidad y brand de tacotios-visitas.vercel.app desde el punto de vista de un visitante que llega del reel de Xokol sin conocer a @tacotios.

WebFetch a home + 2 fichas random + URL principal.

Para cada uno responde con honestidad brutal:

1. **Test 3 segundos:** al cargar la página, ¿el visitante sabe que esto es @tacotios? Sí/No + qué señales hay (logo, nombre, foto, color, tipografía, voz).

2. **Test quién es Aniol:** ¿hay alguna foto, bio, breve descripción visible sin scroll? Sí/No.

3. **Test por qué existe esta web:** ¿hay un manifiesto, tesis, posicionamiento Anti-Guía expuesto? Cita literal del HTML.

4. **Test prensa/awards:** ¿hay trust signals visibles (Vice, El País, Best Chef, Michelin, etc.)? Sí/No.

5. **Test contacto / footer:** ¿hay forma de contactar, ver redes, leer más sobre @tacotios? Sí/No.

6. **Coherencia con Brand Bible** (`~/Desktop/02_MARCA-TACOTIOS/BRAND_BIBLE_TACOTIOS_v1.md`): de los 10 elementos de la voz Aniol (cap 4), ¿cuántos están presentes en el copy de la web? Lista.

7. **Coherencia con Design System Tacotios** (`~/Desktop/02_MARCA-TACOTIOS/DESIGN_SYSTEM_TACOTIOS.md`): paleta, tipografía, espaciado coinciden? Sí/No con citas CSS.

8. **Anti-template check:** ¿la web podría confundirse con un template Tailwind genérico? Sí/No + por qué.

9. **Tesis HERENCIA** (`~/.claude/projects/.../memory/project_herencia.md`): ¿aparece de alguna forma (morder = morder bola de nieve ancestral; placer = nostalgia mayor peso; comensal → invitado)? Sí/No.

10. **Footer estado actual:** ¿qué hay en el footer? ¿qué falta?

Reporta en formato del audit anterior pero solo identidad. Max 600 palabras. Cero em-dashes. Guarda en `PLAN_5_CICLOS/_DIAG_CICLO_3.md`.
```

---

## FASE B — PLANIFICACIÓN

Herramientas internas:
- **Skills:** `brand-voice`, `frontend-design`, `web-design-pro`, `emil-design-eng`, `de-ai-ify`, `copywriting`, `storynomics`, `liquid-glass-design`
- **Agents:** `writer` (voz Aniol), `code-reviewer`, `architect`
- **Reference docs canónicas:**
  - `~/Desktop/02_MARCA-TACOTIOS/BRAND_BIBLE_TACOTIOS_v1.md` (cap 4 voz, cap 6 posts fundacionales)
  - `~/Desktop/02_MARCA-TACOTIOS/PLAYBOOK_OPERATIVO_TACOTIOS_v1.md`
  - `~/Desktop/02_MARCA-TACOTIOS/DESIGN_SYSTEM_TACOTIOS.md`
  - `~/.claude/projects/-Users-aniolguellferres-Downloads-agency-agents-main/memory/project_herencia.md`

---

## FASE C — EJECUCIÓN

### Item 3.1 — Pre-flight

```bash
git tag pre-ciclo-3 || true
cat PLAN_5_CICLOS/_DIAG_CICLO_3.md
```

### Item 3.2 — Manifiesto Anti-Guía (página `/sobre`)

```
SUPERPROMPT 3.2:

Crear src/app/sobre/page.tsx como Server Component (página estática editorial).

CONTENIDO (texto base que el writer reescribe en voz @tacotios sin em-dashes):

# La Anti-Guía

Cargo gastronómico no soy. Crítico tampoco. Soy un español viviendo en Ciudad de México que come en cada sitio que recomiendo y que solo escribo de lo que comería con mi mejor amigo.

Esta web no es una guía de mejores restaurantes. Es la lista de los lugares que me pasaron por dentro. Algunos son tier S de cualquier ranking del mundo. Otros son una fonda donde la señora me dio un consomé y me cambió el día. Los dos cuentan igual.

La regla es simple: no pongo aquí nada que no le mandaría a Iaia Encarna por WhatsApp si pudiera. Si lo recomendaría a mi mejor amigo, entra. Si lo recomiendo "porque está bien", no entra.

No hay puntuaciones de 100, ni rankings de "los 50 mejores". Hay un dossier por lugar, una historia humana, una frase ancla, una emoción que se vive ahí. Y un audio que escucho yo mismo antes de entrar, para no llegar vacío.

Estoy haciendo La Vuelta a México en 80 Tacos, recorriendo el país para entender qué se come y qué se siente al comer. Esta es la base operativa. Si llegaste por algún reel, bienvenido. Si vives aquí y conoces un sitio que debería entrar, escríbeme: tacotios@gmail.com.

— Aniol Guell, @tacotios

PD: el primer trozo de cartón mojado de polvo de chile y limón que comí en la calle de Bucareli en 2018 sigue siendo el ancla de todo esto. Lo recordé el otro día. No se me olvidará.

---

ESTRUCTURA VISUAL:
- Hero: foto Aniol B&W o color sutil, 60% alto pantalla, frase pull "Si lo recomendaría a mi mejor amigo, entra"
- Body: editorial column max-w-2xl mx-auto, leading-relaxed, tipografía display + serif (consultar DESIGN_SYSTEM)
- Pull quotes flotantes a derecha en 2-3 puntos
- Signature manuscrita o type-set "Aniol Guell · @tacotios"
- Botón CTA "Ver la lista" → home
- Footer compartido (a hacer en item 3.5)

REGLAS:
- Cero em-dashes
- Cero corporate
- Frase final memorable ("PD: el primer trozo...")
- Aplicar emil-design-eng: entrada con fade-up stagger 60ms entre párrafos
- Paleta Design System Tacotios dark modern

Criterio éxito: a un visitante nuevo en mobile le toma <2 min leer y sale sabiendo quién es Aniol y por qué.
```

### Item 3.3 — Hero del home: tesis + foto Aniol

```
SUPERPROMPT 3.3:

Modificar src/app/page.tsx (home) hero actual:

ANTES (asumido): título genérico "La Anti-Guía" + descripción funcional.

DESPUÉS:
- Eyebrow tracking-widest uppercase amber "LA ANTI-GUÍA · @TACOTIOS"
- H1 editorial display clamp(2.25rem, 6vw, 5rem) "Lo que comería con mi mejor amigo. Y nada más."
- Subtítulo serif clamp(1rem, 2vw, 1.25rem) max-w-prose: "146 lugares en 9 ciudades. Un dossier por sitio. Audio de preparación antes de entrar. Tres generaciones de cocineros, una sola regla."
- Stats discreto (no card): "X visitados · Y por visitar · Z con dossier listo"
- CTA secundario "Sobre la Anti-Guía" → /sobre

Foto Aniol pequeña arriba derecha (avatar 48x48 circle) con tooltip "Aniol Guell · @tacotios" + link a Instagram. Solo desktop.

Mobile: avatar va en header con texto "@tacotios" al lado.

Criterio éxito: screenshot home mobile + desktop. Ambos comunican voz + identidad en 3s.
```

### Item 3.4 — Header: Logo TT + @tacotios visible

```
SUPERPROMPT 3.4:

src/components/layout/Header.tsx:

- Logo "TT" en monogram serif a la izquierda (link a /)
- Texto "@tacotios" pequeño tracking-wide al lado del TT, en mobile oculto o smaller
- Nav minimal a la derecha: "Lista" | "Sobre" | "Instagram" (external)
- Cuando scroll-down oculta header (mantener UX actual)
- Glass-header backdrop blur (mantener)

Reglas:
- Sin shadow heavy
- Hover gates con @media (hover: hover)
- Active state scale(0.97)
- Transición specific properties, no all
```

### Item 3.5 — Footer trust

```
SUPERPROMPT 3.5:

Crear src/components/layout/Footer.tsx con 3 zonas:

ZONA 1 — Sobre @tacotios
- Logo TT
- "La Anti-Guía. Aniol Guell, comiendo desde 2018."
- Link "Sobre" → /sobre

ZONA 2 — Conecta
- Instagram @tacotios (external link)
- Email tacotios@gmail.com (mailto)
- Newsletter signup minimal (input + button "Recibir") — opcional, crear si C4 monta sistema, si no, ocultar
- Spotify/YouTube si aplica (placeholders por ahora)

ZONA 3 — Editorial
- "Última actualización: {fecha del último commit}"
- "Hecho en Ciudad de México"
- Año © 2026 — sin "all rights reserved" porque la voz Aniol no lo dice

Integrar Footer en src/app/layout.tsx después del children.

Sin em-dashes. Tipografía discreta.
```

### Item 3.6 — Aplicar Design System (paleta + tipografía)

```
SUPERPROMPT 3.6:

Leer `~/Desktop/02_MARCA-TACOTIOS/DESIGN_SYSTEM_TACOTIOS.md` completo.

Auditar src/app/globals.css y tailwind.config* contra el Design System. Identificar discrepancias:
- Paleta tokens (bg-primary, text-primary, accent-amber, etc.)
- Tipografía: editorial display, serif body, mono labels
- Animation tokens (durations + easing emil)
- Spacing scale

Aplicar los tokens faltantes como CSS custom properties en `:root`. NO romper componentes existentes.

Criterio éxito:
- Paleta coincide con Design System Tacotios (dark modern para pitches/digital).
- Tipografía display + serif visibles en hero + manifiesto.
- Tailwind classes utility refactorizadas para usar tokens donde aplique.
```

### Item 3.7 — QA Brand Voice global

```
SUPERPROMPT 3.7:

Correr en paralelo 3 chequeos sobre todos los archivos .tsx/.ts/.md modificados en C3:

1. `grep -rn '—' src/app/sobre/ src/app/page.tsx src/components/layout/`  # debe ser 0
2. `grep -rniE 'gourmet|alta cocina|leverage|stakeholders|ecosystem|journey|experience' src/`  # 0 matches en strings de UI
3. Aplicar `/brand-voice enforce` a:
   - Texto del manifiesto /sobre
   - Hero copy del home
   - Footer copy

Si algo falla, reescribir antes de continuar.
```

### Item 3.8 — Build + deploy + verificación visual

```bash
pnpm tsc --noEmit
pnpm build
vercel deploy --prod --yes
```

Verificación visual:
- preview_start (local) o navegar a deploy URL
- preview_resize a 375x812 (mobile) y 1440x900 (desktop)
- preview_screenshot home + /sobre + 1 ficha
- Lighthouse mobile ≥ 90 performance + accesibilidad

### Item 3.9 — Commit + tag

```bash
git add -A && git commit -m "ciclo-3: identidad — manifiesto /sobre + hero home + footer + design system"
git tag pre-ciclo-4
```

---

## CRITERIO ÉXITO CICLO 3 (verificable)

| # | Test | Esperado |
|---|---|---|
| 1 | `curl -s /sobre \| grep -c "Iaia Encarna"` | ≥ 1 |
| 2 | `curl -s / \| grep -c "@tacotios"` | ≥ 2 (header + meta) |
| 3 | Foto Aniol presente en home y /sobre | Sí (screenshot confirma) |
| 4 | `grep -rn '—' src/app/sobre/ src/app/page.tsx` | 0 em-dashes |
| 5 | Footer con email + Instagram visibles | Sí |
| 6 | Lighthouse accesibilidad mobile | ≥ 95 |
| 7 | Brand Bible check en hero + manifiesto | Pasa los 2 |
| 8 | Test 3 segundos (subjective): nuevo visitante sabe que es @tacotios | Sí (verificable por screenshot) |

---

## ROLLBACK

```bash
git reset --hard pre-ciclo-3
vercel rollback
```

---

## OUTPUT EN DISCO

- `PLAN_5_CICLOS/_DIAG_CICLO_3.md`
- `PLAN_5_CICLOS/_LOG_CICLO_3.jsonl`
- `PLAN_5_CICLOS/_METRICAS_CICLO_3.md` — Lighthouse antes/después de identidad
- `public/aniol-portrait.jpg` (placeholder hasta que Aniol suba foto real) — generar SVG placeholder con iniciales AG si no hay foto
- Commit `ciclo-3: identidad`
- Tag `pre-ciclo-4`
