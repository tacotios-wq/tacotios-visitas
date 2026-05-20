# BACKLOG DESCUBIERTOS — items fuera de scope detectados durante ejecución

> Cuando durante un ciclo encuentro algo que no es parte del scope del ciclo actual pero que merece atención, lo apunto aquí sin parar la ejecución. Aniol revisa al cierre de cada ciclo.

| Fecha | Ciclo origen | Item | Severidad | Acción sugerida |
|---|---|---|---|---|
| 2026-05-19 | C1 | Navegación híbrida home grid → `/[slug]` en mobile. URL existe y es compartible, pero el click desde grid en mobile abre el panel `fixed` actual en vez de navegar a la URL completa. Esto reduce SEO interno y el back nativo del navegador no funciona. | P2 | Modificar `RestaurantCard.tsx` para envolver en `<Link href={`/${slug}`}>` en mobile (detectar via useMediaQuery o usar `<Link prefetch={false}>` por defecto y manejar override desktop con onClick + preventDefault). Sprint 1. |
| 2026-05-19 | C1 | `package.json`, `next.config.ts`, `.gitignore` y otros archivos base del proyecto no están en git (solo trackea cambios incrementales de restaurants.ts). Si alguien clona el repo, no compila. Vercel hoy debe estar deployando desde local sin push. | P1 | `git add -A` con review previo de no incluir secrets, commit "snapshot: incorpora proyecto completo al tracking". Permite onboarding de Liz/colaboradores. Sprint 1. |
