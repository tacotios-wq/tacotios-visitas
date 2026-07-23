# Auditoría escéptica tacotios-visitas — 2026-04-20

> Auditoría adversarial de https://tacotios-visitas.vercel.app contrastada contra Brand Bible v1, Design System Tacotios, design-quality rules y mind-downloads de 5 expertos. No-touch: solo reporta. Evidencia con archivo:línea.

---

## Veredicto en una frase

El sitio proclama "Cada lugar pasa el filtro: ¿lo recomendarías a tu mejor amigo? Sin excepciones" — mientras 97 de 100 fotos son de Unsplash, 56 de 100 fichas están vacías, la ruta del mapa es geográficamente inventada, y el único lugar donde aparece "La Anti-Guía" como tesis es un footer de 12px que encima falla WCAG AA. Es una app de tracking personal con estética premium disfrazada de manifiesto público.

---

## Lo más doloroso (1 issue)

**El sitio no sabe que es un manifiesto.** [`src/app/layout.tsx:5`](src/app/layout.tsx:5) + [`src/components/layout/Header.tsx:80-125`](src/components/layout/Header.tsx:80). Si alguien llega al link sin contexto previo:
- El `<title>` dice "Tacotios Visitas" (nombre de panel interno de CRM).
- No hay OG image, Twitter Card, `theme-color`, description rica, ni `@tacotios` como handle — compartir el link en WhatsApp deja un preview mudo.
- No hay mención a Anthony Bourdain (referente declarado en Brand Bible §2.2), a "La Vuelta a México en 80 Tacos" (el proyecto mayor), ni a "viaja como local".
- No hay CTA, newsletter, link a Instagram. Cero camino al ecosistema.
- "La Anti-Guía gastronómica de México" aparece una única vez: en el footer `text-xs text-text-muted` (que además falla contraste).

La diferencia entre "catálogo privado de Aniol" y "La Anti-Guía de México" es enorme. El copy, la metadata y la jerarquía dicen lo primero. El proyecto merece lo segundo.

---

## CRITICAL (5)

1. **[`src/app/globals.css:16`](src/app/globals.css:16) — `--color-text-muted: #636366` sobre `--color-bg-primary: #050507` rinde 3.65:1 (FAIL WCAG AA, requiere ≥4.5:1 para texto normal).**
   Cálculo: L_muted=0.1339, L_bg=0.000401 → (0.1839/0.0504)=3.65. Afecta zone/city captions en RestaurantCard ([`RestaurantCard.tsx:137`](src/components/restaurant/RestaurantCard.tsx:137)), RestaurantListItem ([`RestaurantListItem.tsx:87`](src/components/restaurant/RestaurantListItem.tsx:87)), footer del sitio ([`page.tsx:212`](src/app/page.tsx:212)), leyenda del mapa ([`RestaurantMap.tsx:260`](src/components/restaurant/RestaurantMap.tsx:260)), tp-cuisine en popup, hero sub ([`Header.tsx:89`](src/components/layout/Header.tsx:89)). **Por qué importa:** es ubicuo; literalmente cada card del catálogo tiene metadata ilegible para lectores con baja visión. **Fix:** subir `--color-text-muted` a `#8a8a8f` (≈4.61:1) o usar `text-secondary` en metadata de cards.

2. **`src/data/restaurants.ts` — 97 de 100 restaurantes usan imágenes stock de Unsplash (patrón `images.unsplash.com/photo-XXXX`).**
   Ejemplos confirmados: Tacos Charly [`restaurants.ts:71`](src/data/restaurants.ts:71) `photo-1551504734-5ee1c4a1479b`, El Vilsito `photo-1599974579688`, El Gran Abanico `photo-1565299585323`. **Por qué importa:** el Brand Bible §1.7 dice explícitamente "Copiar el formato no copia el fondo" y §2.1 define la misión como "Divulgar gastronomía con la honestidad de quien le habla a su mejor amigo". Una Anti-Guía visual con 97% stock photos es la antítesis literal del filtro "¿se lo recomendarías a tu mejor amigo?". **Fix:** o subes fotos reales vía Supabase Storage, o eliminas `image_url` y dejas el fallback `<span>🌮</span>` — cualquier cosa menos mentir con stock.

3. **Hero promete "100 lugares" — 56 de esos lugares (56%) son shells vacíos sin dossier.**
   Evidencia: `grep has_dossier: false` → 56 matches. Al seleccionar un restaurante sin dossier, RestaurantDetail muestra "Por escribir todavía. El dossier completo aparecerá aquí cuando termine el research de campo" ([`RestaurantDetail.tsx:153-164`](src/components/restaurant/RestaurantDetail.tsx:153)). **Por qué importa:** el hero contabiliza los 100 como si hubieran pasado el filtro; 56 ni siquiera tienen ficha. **Fix corto:** filtrar `has_dossier:true` del recuento principal del hero y añadir un segundo contador "N dossiers listos / 100 planeados". **Fix largo:** publicar solo lo que tiene dossier y dejar el resto como "shortlist" separado.

4. **Feature bandera del mapa (ruta "La Vuelta a México") está apagada por defecto y es geográficamente inventada.**
   - [`RestaurantMap.tsx:48`](src/components/restaurant/RestaurantMap.tsx:48) inicializa `showRoute` con `currentTab === "80tacos"`, pero el tab por defecto es `"pendiente"` ([`page.tsx:43`](src/app/page.tsx:43)). Usuario aterriza en Mapa → la ruta no se ve.
   - [`coordinates.ts:73-81`](src/lib/coordinates.ts:73) define la secuencia CDMX → Puebla → Oaxaca → GDL → Mazatlán → MTY → Ensenada. Esta ruta no está en ningún documento de memoria del proyecto (`~/.claude/projects/.../memory/` no contiene ningún archivo sobre la ruta física de Vuelta 80 Tacos). Geográficamente: Oaxaca → GDL implica saltar ~700km en diagonal sin pasar por Michoacán; Mazatlán → MTY cruza el desierto; MTY → Ensenada salta 2.500km ignorando Bajío, Sonora, BCS. Parece inventada para cubrir las 7 ciudades con markers. **Por qué importa:** es el único elemento narrativo del mapa, y si alguien la lee como "así fue el viaje", es falso. **Fix:** o pones la ruta real (obtenla de tu Notion o Google Maps de la producción) o quitas la línea y dejas solo markers por ciudad.

5. **"Marcar Visitado" es una mentira funcional: el estado no persiste.**
   [`page.tsx:80-88`](src/app/page.tsx:80) hace `setData((prev) => prev.map(...))` — mutación solo en memoria. Al recargar la pestaña, el estado "visitado" se pierde y vuelve a `seedData`. Supabase está en `dependencies` ([`package.json:12-13`](package.json:12)) y `src/lib/supabase/client.ts` existe, pero cero llamadas. La UI no comunica al usuario que el click es efímero. **Por qué importa:** si el caso de uso declarado es "lo uso en ruta móvil para marcar visitados", la feature central no funciona. **Fix:** o conectas Supabase (1-2 horas), o etiquetas el botón como "Marcar (solo sesión)" hasta que esté conectado.

---

## HIGH (12)

1. **Metadata de `layout.tsx` es un shell vacío.** [`layout.tsx:4-8`](src/app/layout.tsx:4): solo `title` + `description`, ambos sin tildes, sin OG (`og:image`, `og:title`, `og:description`, `og:url`), sin Twitter Card (`twitter:card`, `twitter:creator`), sin `theme-color`, sin favicon explícito, sin `viewport` custom, sin `robots`. Compartir el link es un preview mudo.

2. **`@import url("https://fonts.googleapis.com/...")` en [`globals.css:1`](src/app/globals.css:1) es render-blocking.** Añade ~200-400ms al LCP en primera visita. `next/font` lo eliminaría completamente. `preconnect` en layout.tsx:18 ayuda al RTT pero no desbloquea el CSSOM.

3. **Design System violado: 3 familias tipográficas en vez de 2.** DESIGN_SYSTEM_TACOTIOS.md:45-51 define `Inter Tight` (display) + `Inter` (body). [`globals.css:25-27`](src/app/globals.css:25) añade `Fraunces` como `--font-editorial`. Si la decisión es consciente, actualiza el Design System; si no, es desviación no documentada.

4. **Design System violado: 9 colores activos vs 5 permitidos.** DESIGN_SYSTEM_TACOTIOS.md line 37-39 dice "El naranja #e99b2a es el ÚNICO color de acento. No azul, no verde, no rojo." [`restaurants.ts:3-57`](src/data/restaurants.ts:3) introduce 7 series cada una con color propio (#c41e3a rojo ESP, #8b5cf6 violeta OMEGA, #06b6d4 cyan ENS, #dc2626 rojo OAX, #2563eb azul PUE, #1B4965 azul marino MZT, + #22c55e verde visitado y #f59e0b amber en [`globals.css:19-22`](src/app/globals.css:19)). Visualmente: `RestaurantCard` puede mostrar hasta 3 colores de series simultáneos por card → parking lot.

5. **Bourdain no aparece en ninguna parte.** El Brand Bible lo cita como referente explícito ("viaja como local, Bourdain"). Grep: `bourdain` en src/ → 0 matches. El posicionamiento editorial declarado no existe en ninguna string user-facing.

6. **Footer entierra la tesis en 12px muted con contraste roto.** [`page.tsx:211-216`](src/app/page.tsx:211). Si "La Anti-Guía" es la tesis, no puede ir como nota al pie. O va en hero prominente o no va.

7. **Sin clustering en el mapa + coordenadas fallback para ≥11 restaurantes.** Zonas sin match en `ZONE_COORDS`: "Narvarte Poniente" (El Vilsito → CDMX centro), "Coyoacan" (El Gran Abanico), "Tlalpan", "Azcapotzalco", "Por definir" (×3), "Zapopan", "San Juan de Dios", "Oblatos", "San Pedro", "Mitras". Todos caen al `CITY_CENTERS[city]` o a CDMX. El Vilsito real está a ~4km del punto donde lo pinta el mapa. Sin clustering, 50+ markers CDMX a zoom 4.3 colapsan en una bola. [`coordinates.ts:66-71`](src/lib/coordinates.ts:66).

8. **"Por definir" como `zone` aparece 3 veces en producción.** `grep 'zone: "Por definir"' src/data/restaurants.ts` → 3 hits. Placeholder filtrable visible al usuario final.

9. **Móvil landscape: mapa fuerza overflow.** [`RestaurantMap.tsx:231`](src/components/restaurant/RestaurantMap.tsx:231): `h-[calc(100dvh-240px)] min-h-[420px]`. En iPhone SE landscape (viewport 375 alto), calc=135px pero `min-h[420]` fuerza 420 → scroll de 285px sobre el contenido. El "uso en ruta" declarado (teléfono landscape, 1 mano) rompe.

10. **Mapa: markers nunca se repintan al cambiar status.** [`RestaurantMap.tsx:158`](src/components/restaurant/RestaurantMap.tsx:158) usa `if (existing.has(r.id)) continue` — si marcas un restaurante como visitado, `getMarkerColor()` no se re-ejecuta en el DOM. El marker queda naranja cuando debería ser verde. Bug de sincronización visible.

11. **Popups del mapa solo funcionan con hover (mouseenter/mouseleave).** [`RestaurantMap.tsx:174-194`](src/components/restaurant/RestaurantMap.tsx:174). En móvil (sin hover), iOS simula un `mouseenter` en el primer tap pero queda pegado hasta tap fuera; sin mecanismo de cierre explícito. Keyboard-only no puede ver la info del popup.

12. **Tabs duplican los 12 items de "80 Tacos" dentro de "Por Visitar".** [`filters.ts:7-10`](src/lib/filters.ts:7): `matchesTab` trata "pendiente" como `status==="pendiente" || status==="80tacos"`. El usuario ve "Por Visitar 100" + "80 Tacos 12" sin pistas de que los 12 están DENTRO de los 100. Ambigüedad taxonómica.

---

## MEDIUM (14)

1. **Tildes inconsistentes.** "Anti-Guia" en eyebrow [`Header.tsx:83`](src/components/layout/Header.tsx:83), "recomendaria" en hero sub [`Header.tsx:90`](src/components/layout/Header.tsx:90), "aparecera"/"terminel research de campo" en RestaurantDetail empty, "gastronomica" en footer, "espanola" en cuisine descriptions. El Brand Bible tampoco usa tildes (estilo ASCII de Aniol) — pero en un sitio profesional de 2026 se lee como descuido. Decide: estilo o error, pero consistente.

2. **"Edicion 2026" en masthead es burocrático.** [`Header.tsx:42`](src/components/layout/Header.tsx:42). "Visitas · Edicion 2026" = lenguaje de CRM interno. En un manifiesto público suena a índice de revista corporativa.

3. **Logo "TT" en cuadrado naranja 32×32** [`Header.tsx:34`](src/components/layout/Header.tsx:34) — monograma genérico. Aniol tiene logo real (ver `~/Desktop/02_MARCA-TACOTIOS/01_BRAND-BIBLE/`); no se usa.

4. **Empty state "Capítulo I"** [`RestaurantGrid.tsx:26-35`](src/components/restaurant/RestaurantGrid.tsx:26) — pretencioso antes que evocador. El usuario ve esto porque no ha marcado nada, no porque esté empezando una obra literaria.

5. **Empty state de dossier usa jerga de agencia.** "cuando termine el research de campo" [`RestaurantDetail.tsx:161`](src/components/restaurant/RestaurantDetail.tsx:161). Propuesta: "Aparece aquí cuando cierre la visita."

6. **Emoji 🌮 como placeholder** en [`RestaurantDetail.tsx:60`](src/components/restaurant/RestaurantDetail.tsx:60), [`RestaurantCard.tsx:71`](src/components/restaurant/RestaurantCard.tsx:71), [`RestaurantListItem.tsx:55`](src/components/restaurant/RestaurantListItem.tsx:55) — incongruente con pretensión editorial Bourdain.

7. **"Marcar Visitado" verbo genérico.** [`RestaurantDetail.tsx:175`](src/components/restaurant/RestaurantDetail.tsx:175). En un manifiesto con peso emocional, "Ya fui" o "Cierro visita" carga más.

8. **`viewMode: "auto" | "map"` naming confuso.** [`page.tsx:37`](src/app/page.tsx:37). "auto" mapea a list/grid según `isDesktop`. Debería llamarse "list".

9. **Desktop + Mapa + detail seleccionado squashea el mapa a ~45% ancho.** [`page.tsx:163-202`](src/app/page.tsx:163). El panel derecho `w-[55%]` aparece sobre el flex-1 del mapa. Sin condicional que oculte detail en modo mapa o lo transforme en overlay.

10. **Sin `priority` prop en ninguna `<Image>`.** RestaurantCard / RestaurantDetail / RestaurantListItem. El hero image del detail compite con las 100 thumbnails por la cola de red. LCP image no declarada.

11. **Image over-fetching 2x en móvil.** Unsplash sirve `w=800&q=80`, next/image pide `w=128` o `w=256` via sizes. Next hace proxy redimensionado pero transfiere el original → coste extra en servidor.

12. **Sin virtualización con 100 cards.** Montan todas a la vez. En desktop grid denso, first paint monta ~12-20 imágenes simultáneas.

13. **Empty states layout centrado simétrico.** `flex-col items-center justify-center text-center` en [`RestaurantGrid.tsx:24`](src/components/restaurant/RestaurantGrid.tsx:24) y [`:40`](src/components/restaurant/RestaurantGrid.tsx:40). Violación de anti-template rule #2 (stock hero con centered headline).

14. **Hero stats: "Progreso %" hidden sm:block** — [`Header.tsx:113-122`](src/components/layout/Header.tsx:113). En móvil el usuario no ve el progreso %. Si el sitio es para "uso en ruta móvil", la métrica principal de avance desaparece.

---

## LOW (7)

1. `max-w-2xl` en el H1 hero con `text-3xl` en mobile causa wrap a 2 líneas — "Una\npromesa." en 2 líneas visualmente. Funciona pero el rhythm se rompe cuando la itálica salta solo.

2. Focus ring con `border-radius: 8px` uniforme [`globals.css:239-243`](src/app/globals.css:239) no respeta el shape real de botones circulares (back button, markers).

3. Scrollbar `6px` custom [`globals.css:81-93`](src/app/globals.css:81) — discreta pero feel default de "dark dashboard SaaS".

4. Header scroll-hide via JS no respeta `prefers-reduced-motion` en comportamiento (la animación sí, la desaparición no).

5. RestaurantMap `popupRef` no se resetea a null explícitamente en cleanup del useEffect 1 — menor.

6. `restaurants.ts` 1458 líneas inline. Para 100 items es aceptable pero imposible de escalar. Debería ir a Supabase o a JSON separado por ciudad.

7. `animate-fade-up` con stagger hasta index 10 — cards 11-100 montan sin delay ([`RestaurantCard.tsx:31`](src/components/restaurant/RestaurantCard.tsx:31)). Frame-jank potencial en montaje.

---

## Lo que SÍ funciona (3 genuinos)

1. **Dot rating en lugar de 5 fires emoji** [`globals.css:348-366`](src/app/globals.css:348). Es un pequeño sistema visual coherente, no el cliché de "🔥🔥🔥🔥" que se ve en cada listing de food. Tiene variantes `featured` con glow. Decisión con postura.

2. **Reduced-motion respetado en CSS + hover gates con `@media (hover: hover)`** — [`globals.css:200-233`](src/app/globals.css:200) y [`:538-549`](src/app/globals.css:538). Las reglas Emil aplicadas correctamente a nivel CSS; hover-lift solo dispara donde hay puntero fino. Trabajo honesto.

3. **Empty state "El viaje empieza aquí" con italic en "aquí"** [`RestaurantGrid.tsx:28-30`](src/components/restaurant/RestaurantGrid.tsx:28). Único copy del sitio con voz editorial genuina — el italic pone el acento en el verbo correcto, el resto del sitio podría imitarlo.

---

## Lo que NO auditaste y por qué

- **Lighthouse real contra producción.** Intenté WebFetch a `tacotios-visitas.vercel.app` pero el tool solo procesa body rendered; no pude extraer el HTML `<head>` verbatim ni correr Lighthouse CLI. Estimo CWV a partir del código (render-blocking Google Fonts + 100 imágenes sin priority) pero no tengo LCP/INP/CLS medidos.
- **Mobile landscape real (812×375).** Medí por código; no abrí dispositivo físico.
- **Vista Mapa interactiva en live.** `preview_click` falló al seleccionar el toggle — no hice screenshot del mapa renderizado con los 100 markers reales. La auditoría del mapa depende de lectura estática del código + lógica geográfica, no de visual de markers en canvas.
- **Focus trap del Drawer (FilterSheet) y SearchOverlay.** No inspeccioné esos dos componentes — contrato de accesibilidad desconocido.
- **Screen reader real (VoiceOver/NVDA).** No corrí screen reader sobre la página.
- **E2E flows** (click marker → detail → mark visited → refresh). El subagente de arquitectura confirmó el bug de persistencia desde código, pero no lo reprodujimos en browser.

---

## Consejo de expertos (síntesis)

- **Virgil Abloh:** Esto es Tourist disfrazado de Purist. Fraunces italic sobre dark es el uniforme de "quiero parecer editorial" — un Purist pone el nombre del lugar en Helvetica 14px y gana. La ruta con dash punteado es un icono genérico de "viaje", no una declaración de un viaje real. Rompe algo: quita las 97 fotos Unsplash hoy mismo. Polaroid > stock.
- **Jonathan Anderson:** La composición no tiene postura. Grid `auto-fill minmax(320px, 1fr)` es anti-decisión. Editorial real es asimetría: 2 cards enormes, 4 pequeñas, gap variable, ritmo. La itálica de Fraunces disfraza una uniformidad que en contenido es plana. Si el hero es "100 lugares", ese número debería ocupar media pantalla, no `clamp(2rem, 5vw, 4rem)`.
- **David Chang:** Abro en el celular — no entiendo que es Anti-Guía hasta el scroll 2. Los nombres están bien (Aitana, Alfonsina, Augurio son solo nombres, no marketing). Pero las fotos son todas iguales: no distingo mediterránea fine dining de birria de chivo. Pierdo en 3 segundos. Si es para gente que come, foto real o nada.
- **Stanley Tucci:** Da ganas de hacer click, no ganas de comer. Las dots en naranja chillan como notificación de app. "Una promesa" en itálica es bello pero es la promesa de un menú, no de un bocado. Falta textura: el aceite, el humo, el chile. Dark sin grano = cocina sin olor.
- **Rick Rubin:** Sobra: logo TT, "Edicion 2026", footer con la tesis en muted, 9 colores de series, el emoji 🌮 placeholder, las 97 fotos stock. Falta: una sola cosa que diga "esto es de Aniol" más allá del nombre. Inevitable = declaración. Lo que hay es producto.

---

## Si solo puedo arreglar 3 cosas esta semana

1. **Convertir el sitio en manifiesto, no en panel.** Cambiar `<title>` a "La Anti-Guía · @tacotios", añadir OG image (usar la foto hero más fuerte de Instagram como og:image), meta description con la tesis Bourdain, `twitter:creator: "@tacotios"`. Mover "La Anti-Guía gastronómica de México" del footer al hero. Añadir un único CTA visible: link a `instagram.com/tacotios` o newsletter. 1 hora de trabajo. Es el cambio que más mueve el producto.

2. **Resolver el ruido de las 97 fotos stock.** Opción A (45 min): cambiar `image_url` a `null` en los 56 sin dossier → muestran el fallback (cambiando el 🌮 por un color sólido con el nombre en Fraunces 32px — ver patrón en DESIGN_SYSTEM_TACOTIOS.md:175). Opción B (2 horas): subir fotos reales de Instagram/crudos a Supabase Storage para los 44 con dossier. Combinar A+B si el tiempo permite. El hero "100 lugares. Una promesa" no aguanta otra semana con fotos de Unsplash.

3. **Subir `--color-text-muted` a `#8a8a8f`** (cumple 4.61:1 WCAG AA) y verificar que city captions, footer y leyenda del mapa se leen. 5 min de cambio + 15 min de verificar. Al mismo tiempo: auditar qué strings críticas viven en `text-muted` y migrar las importantes (footer manifiesto, dossier "Dossier listo") a `text-secondary` o `text-primary`.

**Bonus 4º (si sobra tiempo):** activar `showRoute` por defecto siempre en vista Mapa (`useState(true)` en vez de la condicional ligada a tab), y añadir un `aria-label` al contenedor del mapa. 5 minutos.

---

**Quedó fuera de scope de esta semana pero anota:**
- Conectar Supabase para que "Marcar Visitado" persista.
- Rehacer `coordinates.ts` con la ruta real de Vuelta a México (extraer de tu Notion de producción).
- Añadir `next/font` y migrar fuera del `@import` render-blocking.
- Decidir si Fraunces entra al Design System oficial o sale del sitio.
- Reducir los 9 colores de series a naranja + 1-2 soportes (ej: "serie activa" vs "serie archivada").

Archivo generado: 2026-04-20 · audit contra commit local HEAD. Próxima pasada recomendada: después de implementar los 3 fixes, repetir esta auditoría con screenshots del live para ver qué cambió el posicionamiento.
