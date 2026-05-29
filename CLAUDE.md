# CLAUDE.md — F1Pulse Project Memory

This file anchors every Claude Code session. Read it first.

---

## 1. Product

**F1Pulse** is a cinematic, immersive Formula 1 experience covering the **living 2026 season**
and the **full history, 1950 → present**.

It is **NOT a dashboard.** Every screen answers _"what should the user FEEL here?"_ — not "what
components go here?" The bar is Awwwards-tier: one unforgettable signature moment (the 1967
black-and-white → color transition), typography doing heavy lifting, choreographed and restrained
motion, atmosphere on every screen (grain, depth, vignette), and real, correct, live data that
die-hard fans trust.

---

## 2. HARD RULES (non-negotiable)

1. **No hardcoded race data. Ever.** No driver names, standings, results, schedules, or stats
   typed into the code. The only local constants allowed are **cosmetic** — team brand colors,
   nationality flags, and hand-written narrative copy. Never numbers, results, standings, or
   schedules.
2. **The frontend never calls a third party directly.** All external data flows:

   ```
   third-party API → server ingest → normalize → Postgres → Redis cache → F1Pulse's own API → web
   ```

3. **All external fetches live only in `apps/server`.** `apps/web` talks exclusively to our own
   API (`NEXT_PUBLIC_API_URL`).
4. **Before wiring any new endpoint**, fetch one real API response and inspect the actual JSON
   shape. Model the schema to reality, not assumptions.
5. **Placeholders:** fine for IMAGERY and narrative COPY. Never for numbers/results/standings/schedules.

> If a task ever tempts hardcoding standings/results "for now" or "as a placeholder" — stop.
> That is the one rule that cannot bend.

---

## 3. Data Sources (verified live)

### Jolpica (Ergast successor) — history, schedule, standings, results

- Base: `https://api.jolpi.ca/ergast/f1`
- JSON via `?format=json`. Covers **1950 → present**.
- Pagination: `limit` (max 100, default 30) + `offset`. Paginate large pulls.
- `/current/` alias = the live season.
- **Volunteer-run + rate-limited** → cache server-side aggressively; never hit from the browser.
- Example endpoints (verify shapes before wiring):
  `/current/driverStandings/`, `/current/constructorStandings/`, `/current/` (schedule),
  `/current/{round}/results/`.

### OpenF1 — live sessions / telemetry

- Base: `https://api.openf1.org/v1`
- CORS-enabled, but per HARD RULES we **still proxy through our server**. Race-weekends only.

---

## 4. Motion Architecture (locked)

| Layer               | Tech                             | Role                                             |
| ------------------- | -------------------------------- | ------------------------------------------------ |
| Base motion         | **Framer Motion**                | Component-level transitions & micro-interactions |
| Scroll choreography | **GSAP ScrollTrigger**           | Scroll-driven sequences                          |
| Smooth scroll       | **Lenis**                        | Drives ScrollTrigger                             |
| Atmospheric 3D      | **React Three Fiber**            | Depth / immersion                                |
| Signature effects   | **SVG masks + clip-path + GLSL** | The "Telemetry Masking" identity                 |

Motion is **choreographed and restrained** — sequences, not scattered micro-animations. Respect
`prefers-reduced-motion`. Keep micro-interactions 150–300ms; exits faster than enters.

---

## 5. Conventions

- **Strict TypeScript. No `any`.** Shared base config in `tsconfig.base.json` (strict, no unused,
  `noUncheckedIndexedAccess`, `verbatimModuleSyntax`).
- **Feature-first folders** within each app.
- **All external fetches live only in `apps/server`** (clients in `src/lib` / future `src/clients`).
- Server is ESM + NodeNext → relative imports use explicit `.js` extensions.
- Cosmetic constants (team colors, flags) may be local; everything else is ingested.
- Icons: SVG only (Lucide). No emoji as icons.

---

## 6. Monorepo Layout

```
F1Pulse/
├─ apps/
│  ├─ web/      Next.js 14 App Router. Source under src/. Talks only to our API.
│  └─ server/   Express API. Only tier that touches third parties.
│     ├─ prisma/schema.prisma   normalized F1 domain (see Schema below) + IngestRun
│     └─ src/
│        ├─ config/env.ts        typed env (all 3rd-party URLs/keys live here)
│        ├─ lib/prisma.ts        shared PrismaClient singleton
│        ├─ lib/redis.ts         shared ioredis (lazyConnect; cache + BullMQ)
│        ├─ lib/queue.ts         BullMQ connection + queue factory
│        └─ index.ts             Express bootstrap + /health
├─ docker-compose.yml            local Postgres 16 + Redis 7
├─ tsconfig.base.json            shared strict TS
└─ pnpm-workspace.yaml
```

### Database schema (`apps/server/prisma/schema.prisma`)

Normalised to the real Ergast JSON. Natural string keys are primary keys.

- **Season** (`year` PK) → Race[], DriverStanding[], ConstructorStanding[]
- **Circuit** (`circuitId` PK): name, locality, country, lat, long
- **Driver** (`driverId` PK): given/family name, code, permanentNumber, nationality, dateOfBirth
- **Constructor** (`constructorId` PK): name, nationality
- **Race** (surrogate `id`, unique `[seasonYear, round]`): name, date, session times
  (fp1–3/qualifying/sprint/sprintQualifying), `isSprintWeekend`, → Circuit, Season
- **RaceResult** (unique `[raceId, driverId]`): position/positionText, points, grid, laps, status,
  time, fastest lap → Race/Driver/Constructor
- **QualifyingResult** (unique `[raceId, driverId]`): position, q1/q2/q3
- **DriverStanding** / **ConstructorStanding** — **PER-ROUND SNAPSHOTS**, unique
  `[seasonYear, round, (driver|constructor)Id]`, indexed `[seasonYear, round]`. This is what makes
  championship **progression over a season** queryable. DriverStanding↔Constructor is m2m (lossless
  for mid-season team changes).

Key facts learned from live JSON: `positionText` is canonical (can be `R`/`D`/…); points are
fractional (half-points) → `Float`; standings carry a Constructors **array**; results/qualifying
have many optional fields. Migration: `prisma migrate dev --name init_f1_schema` (needs Postgres up).

### F1Pulse's own API (planned, served from `apps/server`)

Built incrementally; always reads from Postgres/Redis, never live third parties at request time:
`/health` (live) · `/api/standings/drivers` · `/api/standings/constructors` · `/api/schedule` ·
`/api/races/:round`.

---

## 7. Per-Day Workflow

1. Plan the files you'll touch first, then implement.
2. Before wiring any endpoint, fetch one real API response and inspect the actual JSON shape.
3. Commit at the end with a clear message.
4. **Update this file** when conventions or endpoints change.

Hard days (motion sync, R3F, History Mode) may spill across milestones — the sequence protects the
build, not the calendar. Polish is where the bar is earned.

---

## 8. Status Log

- **Day 1 — Foundation.** pnpm monorepo scaffolded. `apps/web` (Next 14 + Tailwind v3.4 + full
  locked motion/3D/state stack installed) and `apps/server` (Express + Prisma + ioredis + BullMQ)
  both boot and pass typecheck/lint/format. Verified: web homepage `200`, API `/health` `200`.
  `docker-compose.yml` (Postgres 16 + Redis 7) is authored but **not yet verified** — Docker
  Desktop is not installed on the dev machine. Prisma has only an `IngestRun` bookkeeping model
  (no race data yet). No features built. CLAUDE.md established.
- **Day 2 — Database schema.** Full normalised F1 schema designed against real Jolpica JSON (see
  Schema above). `prisma validate` ✓, `prisma generate` ✓, migration SQL previewed via
  `migrate diff` ✓ (applies cleanly). Standings stored as per-round snapshots → progression
  queryable. **Migration not yet applied** — blocked on Postgres (Docker still not installed). Run
  `pnpm --filter @f1pulse/server exec prisma migrate dev --name init_f1_schema` once `pnpm db:up`
  works. No ingestion yet.
