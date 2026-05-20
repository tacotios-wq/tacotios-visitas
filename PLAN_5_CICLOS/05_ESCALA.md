# CICLO 5 — ESCALA + OPERACIÓN

> Operación 500+ fichas sin tocar git. Liz CRUD desde admin web. Pipeline enrichment Python que pobla lat/lng/phone/horario en lote.
> **Tiempo estimado:** 6-10h Claude Code dirigido.
> **Pre-requisito:** ninguno (paralelizable con C2-C4 si Aniol quiere). Idealmente al final.
> **Output:** Liz añade restaurante sin pedir ayuda. Pipeline pobla los 149 con lat/lng en <30 min.

---

## FASE A — DIAGNÓSTICO (30 min)

```
SUBAGENT general-purpose, prompt:

Audita la operación actual de tacotios-visitas desde el ángulo "puede crecer a 500 fichas?".

1. **Inventario actual:**
   - Cuántas líneas tiene src/data/restaurants.ts (esperado >2400)
   - Cuánto tarda `pnpm build` con 146 restaurantes
   - Cuánto tarda `vercel deploy --prod` (consultar last 3 deploys via `vercel ls`)
   - Tamaño del bundle JS al servir grid

2. **Flujo actual de añadir restaurante:**
   - ¿Hay UI para crear restaurante? No.
   - ¿Hay UI para crear dossier? No.
   - ¿Hay tool externo (Notion sync, Airtable, sheets)? Check `.env*` y package.json.
   - Workflow real: editar TS a mano + commit + push + deploy.

3. **Capacidad de Liz hoy:**
   - ¿Tiene acceso al repo? Cuestionable.
   - ¿Puede añadir un restaurante sin Aniol/Claude? No.

4. **Supabase:**
   - Repo ya tiene `@supabase/ssr` y `@supabase/supabase-js`. Buscar uso real en src/. Hay alguna llamada? Tabla creada? Schema en migrations/?
   - .env.local tiene SUPABASE_URL + ANON_KEY + SERVICE_ROLE_KEY?

5. **Pipeline enrichment:**
   - ¿Existe script Python que pobla lat/lng desde Google Places? No, asumir.
   - ¿Otros pipelines en `~/Desktop/01_PROYECTOS/ANTIGUIA/VISITAS/` que puedan reutilizarse? Buscar Python scripts.

6. **Costo y blockers:**
   - Vercel build minutes consumidos
   - Supabase free tier suficiente para 500 rows + 1GB storage?
   - Google Places API: cost por request, requiere billing setup

Reporta en formato del audit anterior. Max 800 palabras. Guarda en `PLAN_5_CICLOS/_DIAG_CICLO_5.md`.
```

---

## FASE B — PLANIFICACIÓN

Herramientas internas:
- **Skills:** `postgres-patterns`, `mcp-server-patterns`, `data-scraper-agent`, `api-design`, `n8n-workflow-patterns` (si Aniol prefiere visual)
- **Agents:** `architect`, `database-reviewer` (Supabase schema), `python-reviewer` (pipeline), `security-reviewer` (admin auth)
- **MCP:** Supabase (si configurado), Google Places (a configurar)
- **External:** Supabase Cloud (free tier), Google Cloud Console (Places API)

---

## FASE C — EJECUCIÓN

### Item 5.1 — Pre-flight

```bash
git tag pre-ciclo-5 || true
cat PLAN_5_CICLOS/_DIAG_CICLO_5.md
```

### Item 5.2 — Schema Supabase + migración inicial

```
SUPERPROMPT 5.2:

Asumir: proyecto Supabase ya creado por Aniol (si no, crear pidiendo intervención manual con instrucciones).

Crear migration en `supabase/migrations/0001_initial.sql`:

```sql
-- Tabla restaurants
create table if not exists public.restaurants (
  id text primary key,
  name text not null,
  slug text unique not null,
  zone text not null,
  city text not null,
  cuisine text,
  status text not null default 'pendiente' check (status in ('pendiente','visitado','80tacos')),
  image_url text,
  viral_score int,
  price_tier int check (price_tier between 1 and 4),
  notes text,
  content_links jsonb default '[]'::jsonb,
  address text,
  phone text,
  instagram_handle text,
  lat numeric,
  lng numeric,
  hours jsonb,
  visited_at timestamptz,
  has_dossier boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Tabla series
create table if not exists public.series (
  id text primary key,
  name text not null,
  short_name text not null,
  color text not null,
  icon text
);

-- Junction restaurants <-> series
create table if not exists public.restaurant_series (
  restaurant_id text references public.restaurants(id) on delete cascade,
  series_id text references public.series(id) on delete cascade,
  primary key (restaurant_id, series_id)
);

-- Tabla dossiers
create table if not exists public.dossiers (
  id text primary key,
  restaurant_id text references public.restaurants(id) on delete cascade unique,
  historia text,
  hooks jsonb default '[]'::jsonb,
  datos jsonb default '[]'::jsonb,
  pedir jsonb default '[]'::jsonb,
  preguntas jsonb default '[]'::jsonb,
  candidatura_status text check (candidatura_status in ('si','watch','no')),
  candidatura_razon text,
  angulo text,
  alertas jsonb default '[]'::jsonb,
  audio_url text,
  audio_duration_s int,
  video_url text,
  video_duration_s int,
  notebook_url text,
  youtube_video_id text,
  emocion_target text,
  frase_ancla text,
  tesis_central text,
  prepared_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trigger updated_at
create or replace function public.handle_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger restaurants_updated_at before update on public.restaurants for each row execute function public.handle_updated_at();
create trigger dossiers_updated_at before update on public.dossiers for each row execute function public.handle_updated_at();

-- RLS
alter table public.restaurants enable row level security;
alter table public.dossiers enable row level security;
alter table public.series enable row level security;
alter table public.restaurant_series enable row level security;

-- Lectura pública
create policy "read_restaurants_public" on public.restaurants for select using (true);
create policy "read_dossiers_public" on public.dossiers for select using (true);
create policy "read_series_public" on public.series for select using (true);
create policy "read_restaurant_series_public" on public.restaurant_series for select using (true);

-- Escritura solo authenticated (Aniol + Liz vía Supabase auth)
create policy "write_restaurants_auth" on public.restaurants for all to authenticated using (true) with check (true);
create policy "write_dossiers_auth" on public.dossiers for all to authenticated using (true) with check (true);
create policy "write_series_auth" on public.series for all to authenticated using (true) with check (true);
create policy "write_restaurant_series_auth" on public.restaurant_series for all to authenticated using (true) with check (true);

-- Indices
create index restaurants_city_idx on public.restaurants(city);
create index restaurants_status_idx on public.restaurants(status);
create index restaurants_slug_idx on public.restaurants(slug);
```

Aplicar migration vía Supabase CLI o dashboard. Aniol confirma proyecto y aplica.

Criterio éxito:
- Tablas restaurants, dossiers, series, restaurant_series visibles en Supabase dashboard.
- RLS policies aplicadas.
```

### Item 5.3 — Seed: importar restaurants.ts a Supabase

```
SUPERPROMPT 5.3:

Crear scripts/seed-supabase.ts (TypeScript ejecutable con tsx o ts-node):

```ts
import { createClient } from "@supabase/supabase-js";
import { restaurants, dossiers } from "../src/data/restaurants";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supa = createClient(url, key);

async function main() {
  // Series únicos
  const allSeries = new Map<string, { id: string; name: string; short_name: string; color: string; icon: string | null }>();
  restaurants.forEach((r) => r.series.forEach((s) => allSeries.set(s.id, s)));
  
  await supa.from("series").upsert([...allSeries.values()]);
  
  // Restaurants (sin series)
  const restaurantRows = restaurants.map((r) => {
    const { series, ...rest } = r;
    return rest;
  });
  await supa.from("restaurants").upsert(restaurantRows);
  
  // Junction
  const junction = restaurants.flatMap((r) =>
    r.series.map((s) => ({ restaurant_id: r.id, series_id: s.id })),
  );
  await supa.from("restaurant_series").upsert(junction);
  
  // Dossiers
  const dossierRows = Object.values(dossiers);
  await supa.from("dossiers").upsert(dossierRows);
  
  console.log(`Seeded ${restaurants.length} restaurants, ${dossierRows.length} dossiers, ${allSeries.size} series.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Ejecutar con `dotenv -e .env.local -- tsx scripts/seed-supabase.ts`.

Criterio éxito:
- `select count(*) from restaurants` en Supabase → 149.
- `select count(*) from dossiers` → 87.
- `select count(*) from series` → 8.
```

### Item 5.4 — Dual-source data: leer de Supabase con fallback a static

```
SUPERPROMPT 5.4:

Modificar src/data/restaurants.ts → src/data/static-restaurants.ts (rename).
Crear nuevo src/data/restaurants.ts que exporta funciones server-side:

```ts
import { createClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { restaurants as staticRestaurants, dossiers as staticDossiers } from "./static-restaurants";

export async function getRestaurants() {
  try {
    const supa = createClient(/* ... */);
    const { data, error } = await supa.from("restaurants").select("*, restaurant_series(series(*))");
    if (error || !data) return staticRestaurants;
    return data.map(/* map shape */);
  } catch {
    return staticRestaurants;
  }
}

export async function getDossiers() {
  // similar
}
```

NextJS App Router: como `restaurants.ts` se importa en server components (page.tsx), las llamadas async funcionan. Para client components, exponer una API route `/api/restaurants` que devuelve JSON cacheable.

Estrategia ISR: revalidate cada 60 segundos para que Liz vea cambios en <1min.

Criterio éxito:
- Editar un restaurant en Supabase dashboard → tras 60s recargar /xokol → cambio visible.
- Si Supabase down, web sigue funcionando con datos static (fallback).
```

### Item 5.5 — Admin panel mínimo para Liz

```
SUPERPROMPT 5.5:

Crear src/app/admin/page.tsx con Supabase Auth (magic link):

Estructura:

1. /admin (login):
   - Si no auth: form con email → magic link.
   - Si auth: redirect a /admin/restaurantes.

2. /admin/restaurantes:
   - Tabla con TODOS los restaurants (paginated 50/page).
   - Filtros: ciudad, estado, has_dossier.
   - Acciones: editar, ver dossier, marcar visitado.
   - Botón "Nuevo restaurante" arriba.

3. /admin/restaurantes/nuevo:
   - Form con campos requeridos: name, slug (auto-generado del name), zone, city, cuisine, viral_score, notes.
   - Series multi-select.
   - Submit → insert Supabase → redirect a edición.

4. /admin/restaurantes/[id]:
   - Form edición. Todos los campos.
   - Pestaña "Dossier" para editar historia, hooks, frase_ancla, etc.
   - Botón "Generar dossier con Claude" (placeholder por ahora, integración futura).
   - Botón "Subir audio preparación mental".

UI minimal: Tailwind + shadcn-style sin overdesign. Form fields nativos. Sin librería de tabla heavy (usar table HTML).

Auth via Supabase:
- Email allowlist: tacotios@gmail.com + lizliz@email.com (Aniol confirma email Liz).
- Magic link.

Seguridad:
- RLS policies ya filtran.
- Server actions con `revalidatePath` post-mutation.

Criterio éxito:
- Liz puede loggearse con su email.
- Liz puede crear un restaurante nuevo de prueba ("Test Liz") y verlo en home tras revalidate.
- Liz puede subir audio mp3 a Supabase Storage.
- Aniol puede borrar el "Test Liz" desde admin.
```

### Item 5.6 — Pipeline Python enrichment

```
SUPERPROMPT 5.6:

Crear ~/Desktop/01_PROYECTOS/ANTIGUIA/VISITAS/scripts/enrich_restaurants.py:

```python
#!/usr/bin/env python3
"""
enrich_restaurants.py — Pobla campos faltantes (lat, lng, phone, address, hours, instagram_handle)
desde Google Places API + fallback.

Uso:
  python3 enrich_restaurants.py --dry-run        # Solo lista qué actualizaría
  python3 enrich_restaurants.py --apply          # Aplica cambios a Supabase
  python3 enrich_restaurants.py --city CDMX      # Solo una ciudad
"""

import os
import sys
import time
import json
import argparse
import requests
from supabase import create_client

GOOGLE_PLACES_KEY = os.environ["GOOGLE_PLACES_API_KEY"]
SUPABASE_URL = os.environ["NEXT_PUBLIC_SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]

supa = create_client(SUPABASE_URL, SUPABASE_KEY)

def find_place(name: str, city: str, zone: str) -> dict | None:
    """Busca el restaurante en Google Places."""
    query = f"{name} {zone} {city} Mexico"
    url = "https://places.googleapis.com/v1/places:searchText"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_PLACES_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.nationalPhoneNumber,places.regularOpeningHours,places.priceLevel",
    }
    payload = {"textQuery": query, "languageCode": "es-MX"}
    r = requests.post(url, headers=headers, json=payload, timeout=10)
    r.raise_for_status()
    places = r.json().get("places", [])
    if not places:
        return None
    return places[0]  # best match

def enrich_one(r: dict, dry_run: bool) -> dict:
    """Devuelve patch a aplicar."""
    place = find_place(r["name"], r["city"], r["zone"])
    if not place:
        return {}
    patch = {}
    if loc := place.get("location"):
        patch["lat"] = loc["latitude"]
        patch["lng"] = loc["longitude"]
    if addr := place.get("formattedAddress"):
        patch["address"] = addr
    if phone := place.get("nationalPhoneNumber"):
        patch["phone"] = phone
    if hours := place.get("regularOpeningHours"):
        patch["hours"] = hours
    if price := place.get("priceLevel"):
        # PRICE_LEVEL_INEXPENSIVE = 1, MODERATE = 2, EXPENSIVE = 3, VERY_EXPENSIVE = 4
        map_price = {"PRICE_LEVEL_INEXPENSIVE": 1, "PRICE_LEVEL_MODERATE": 2, "PRICE_LEVEL_EXPENSIVE": 3, "PRICE_LEVEL_VERY_EXPENSIVE": 4}
        patch["price_tier"] = map_price.get(price)
    return patch

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--apply", action="store_true")
    p.add_argument("--city")
    args = p.parse_args()
    
    query = supa.table("restaurants").select("*")
    if args.city:
        query = query.eq("city", args.city)
    restaurants = query.execute().data
    
    total, patched = len(restaurants), 0
    for r in restaurants:
        if r.get("lat") and r.get("address"):
            continue  # ya enriched
        patch = enrich_one(r, args.dry_run)
        if not patch:
            print(f"[SKIP] {r['name']} no encontrado en Places")
            continue
        print(f"[PATCH] {r['name']}: {list(patch.keys())}")
        if args.apply:
            supa.table("restaurants").update(patch).eq("id", r["id"]).execute()
            patched += 1
        time.sleep(0.2)  # rate limit
    
    print(f"\n{patched}/{total} restaurantes enriched")

if __name__ == "__main__":
    main()
```

Setup:
- Aniol crea Google Cloud project + habilita Places API + key + restringe.
- `export GOOGLE_PLACES_API_KEY=...` en .env.

Costo: ~0.04 USD por búsqueda. 149 búsquedas = ~$6 USD. OK.

Criterio éxito:
- `python3 enrich_restaurants.py --dry-run` lista 100+ patches.
- `python3 enrich_restaurants.py --apply` corre en <30 min.
- Tras corrida: `select count(*) from restaurants where lat is not null` ≥ 130 (algunos fallos esperados).
```

### Item 5.7 — Búsqueda server-side (escalabilidad UX)

```
SUPERPROMPT 5.7:

Cuando hay 500 restaurantes en Supabase, el client-side filter+search se vuelve pesado. Migrar a:

- API route `/api/search?q=...&city=...&price=...` que usa Postgres full-text + filtros.
- React Server Component que llama y renderiza grid.
- Cliente solo controla el input (debounced).

Index Supabase:
```sql
create index restaurants_search_idx on public.restaurants using gin(to_tsvector('spanish', name || ' ' || cuisine || ' ' || zone || ' ' || notes));
```

Criterio éxito: search "birria" devuelve resultados en <100ms con 500 rows.
```

### Item 5.8 — Build + deploy + verificación

```bash
pnpm tsc --noEmit
pnpm build
vercel deploy --prod --yes
```

Verificar:
- Home muestra los 149 desde Supabase.
- Editar un campo en Supabase → cambio visible tras revalidate.
- Admin /admin accesible para Aniol con magic link.

### Item 5.9 — Commit + tag final

```bash
git add -A && git commit -m "ciclo-5: escala — supabase schema + seed + admin Liz + pipeline enrichment Python"
git tag post-ciclo-5
```

---

## CRITERIO ÉXITO CICLO 5 (verificable)

| # | Test | Esperado |
|---|---|---|
| 1 | Supabase tablas creadas | restaurants, dossiers, series, restaurant_series |
| 2 | Seed completo | 149 restaurants, 87 dossiers, 8 series |
| 3 | Web lee de Supabase | mutar 1 row → cambio visible en 60s |
| 4 | Fallback static funciona | apagar Supabase env vars → web sigue OK |
| 5 | Admin login | magic link a tacotios@gmail.com llega |
| 6 | Liz crea restaurante test | aparece en home tras revalidate |
| 7 | Pipeline Python pobla 130+ con lat/lng | `select count(*) ... where lat is not null` ≥ 130 |
| 8 | Performance | grid carga en <1.5s con 500 rows simulados |

---

## ROLLBACK

```bash
git reset --hard pre-ciclo-5
vercel rollback
# Supabase: no eliminar tablas (data preservada por safety)
```

---

## OUTPUT EN DISCO

- `PLAN_5_CICLOS/_DIAG_CICLO_5.md`
- `PLAN_5_CICLOS/_LOG_CICLO_5.jsonl`
- `PLAN_5_CICLOS/_METRICAS_CICLO_5.md` — # rows en Supabase, tiempo build pre/post, costo Google Places API
- `supabase/migrations/0001_initial.sql`
- `scripts/seed-supabase.ts`
- `~/Desktop/01_PROYECTOS/ANTIGUIA/VISITAS/scripts/enrich_restaurants.py`
- Manual operativo para Liz: `PLAN_5_CICLOS/_MANUAL_LIZ.md` con screenshots cómo añadir restaurante desde admin
- Commit `ciclo-5: escala`
- Tag `post-ciclo-5`
