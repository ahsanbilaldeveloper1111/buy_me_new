# Project overview: Next.js + PostgreSQL + Redis advanced CRUD

This document explains the repository end-to-end: features, PostgreSQL, Redis (cache + pub/sub), realtime (SSE + Socket.IO), Docker, CI/CD, and how the pieces connect.

---

## What this project is

A **learning and reference** Next.js application that combines:

- **PostgreSQL** as the primary data store (users and tasks).
- **Prisma** as the ORM and migration tool (schema + SQL migrations).
- **Redis** (optional via `REDIS_URL`) for **response caching** of task lists and analytics, plus **pub/sub** channels for user-scoped events.
- **App Router** patterns: SSG, ISR, SSR, and CSR with TanStack React Query.
- **JWT-based sessions** (cookie + Edge middleware for `/api/tasks/*`; Node `jsonwebtoken` for pages and Socket gateway).
- **Realtime demos**: **Server-Sent Events** (`GET /api/realtime/sse`) and a **Socket.IO sidecar** on port **3002** (`Dockerfile.socket` + `realtime/socket-server.mjs`), both fed by the same Redis pub/sub channel.
- **Server actions** for Redis publish / cache bust without REST (`src/app/actions/redis-realtime.ts`).
- **Docker Compose** for Postgres, Redis, Next (dev or prod profile), and the socket gateway.
- **GitHub Actions**: **CI** (Postgres + Redis services, migrate, lint, typecheck, build); **CD** (publish production image to GHCR after CI succeeds on `main`/`master`).

The package name is `nextjs-postgres-advanced-crud` (`package.json`).

---

## Feature overview

### Authentication

- **Register / login** under `src/app/api/auth/`.
- Passwords hashed with **Node `crypto` (`scrypt`)** in `src/lib/auth.ts`.
- Session **JWT** signed with **jsonwebtoken**, cookie name **`session_token`**.
- **Server pages** use `requireAuth()` in `src/lib/server-auth.ts`.
- **Middleware** (`src/middleware.ts`): **`/api/tasks/*`** only — verifies JWT with **jose**, sets **`x-user-id`**. Other routes (e.g. `/api/realtime/sse`) authenticate inside the route handler.

### Tasks (CRUD + analytics)

- **`/api/tasks`**, **`/api/tasks/[id]`** — CRUD + `GET ?view=analytics` (raw SQL in `src/services/task-service.ts`).
- **`/csr`** — React Query + components under `src/components/`.
- **`/ssr`** — live Prisma analytics after auth.

### Redis, caching, pub/sub, SSE, Socket.IO, server actions

| Concern | Where / how |
|---------|----------------|
| **Cache keys** | `cache:tasks:list:{userId}`, `cache:tasks:analytics:{userId}` (`taskCacheKeys` in `src/lib/redis.ts`). |
| **TTL** | Task list ~30s, analytics ~20s (`src/services/task-service.ts`). |
| **Invalidation** | On create/update/delete and via server action **bust cache** — `invalidateTaskCaches()`. |
| **Pub/sub channel** | `app:user:{userId}:events` — `publishUserEvent()` after mutations and from server actions. |
| **SSE** | `src/app/api/realtime/sse/route.ts` — subscribes with a **dedicated** `ioredis` connection (not the shared publisher). |
| **Socket.IO** | Container **`socket-gateway`** (`Dockerfile.socket`): cookie + JWT auth, rooms `user:{id}`, `@socket.io/redis-adapter`, `PSUBSCRIBE app:user:*:events` → emit **`event`** to clients. |
| **Server actions** | `src/app/actions/redis-realtime.ts` — `publishDemoServerAction`, `bustTaskCacheServerAction`. |
| **UI** | `/realtime` — forms bound to server actions, `EventSource`, `socket.io-client` (`NEXT_PUBLIC_SOCKET_URL`, default `http://localhost:3002`). |

If **`REDIS_URL`** is unset, Redis helpers no-op: **no cache**, **no publish**; Postgres and the rest of the app still work.

### Rendering strategy demos

| Route | Idea |
|-------|------|
| `/` | Overview + links to concepts. |
| `/csr` | Client data + React Query + `/api/tasks`. |
| `/ssg` | Static + links to `/ssg/[topic]`. |
| `/ssg/[topic]` | `generateStaticParams`, `params`, `searchParams`. |
| `/isr` | `revalidate = 60` + server data. |
| `/ssr` | `force-dynamic` + Prisma + `requireAuth()`. |
| `/auth` | Register / login UI. |
| `/realtime` | Redis + SSE + Socket.IO + server actions (log in first). |

---

## PostgreSQL in detail

### Role

- Database **`appdb`** in Docker; connect with **`DATABASE_URL`**.
- Inside Compose: `postgres://postgres:postgres@postgres:5432/appdb`. From the **host** (DBeaver, `psql`): **`localhost:5432`** (not hostname `postgres` — that name is only on the Docker network).
- **Prisma** + **`pg`** + **`@prisma/adapter-pg`** (`src/lib/db.ts`).

### Schema (summary)

- **`users`**: id, name, email (unique), password_hash, created_at.
- **`tasks`**: id, user_id → users (ON DELETE CASCADE), title, description, status (`todo` \| `in_progress` \| `done`), priority 1–5, due_date, timestamps + indexes.

### Migrations & SQL

- `prisma/migrations/` — SQL source of truth for constraints.
- **`getTaskAnalytics`** — `db.$queryRaw` / CTEs for aggregates and JSON aggregates.

---

## Redis in detail

### Role

- **Cache**: reduce repeated Postgres reads for `listTasks` / `getTaskAnalytics` when keys exist and TTL not expired.
- **Pub/sub**: decouple writers (Next API, server actions, future workers) from readers (SSE connections, Socket.IO gateway). One publish can fan out to **many** SSE tabs and **many** WebSocket clients for the same user.

### Configuration

- **`REDIS_URL`**: e.g. `redis://redis:6379` in Compose, `redis://localhost:6379` from host CLI (`redis-cli`).
- Compose service **`redis`**: image `redis:7-alpine`, **AOF** persistence, volume **`redis_data`**, host port **6379**.

### Socket gateway image

- **`Dockerfile.socket`**: production `npm ci --omit=dev`, runs **`node realtime/socket-server.mjs`**.
- Uses the **same** `package.json` / **`package-lock.json`** as the app (keep lockfile committed after `npm install` so CI and this image stay reproducible).
- Env: **`REDIS_URL`**, **`JWT_SECRET`**, **`PORT`** (default 3002 in Compose).

### Next.js bundling

- **`next.config.ts`**: `serverExternalPackages: ["ioredis"]` so the Redis client is not incorrectly bundled for server code paths.
- **`experimental.typedRoutes`** — strict `Link` href types; new routes may need `as Route` until generated types refresh.

---

## Technology stack

| Layer | Choices |
|-------|---------|
| Framework | **Next.js** (App Router), TypeScript |
| Config | **`next.config.ts`**: typed routes, `serverExternalPackages` for `ioredis` |
| TS | **`tsconfig.json`**: strict, `ignoreDeprecations: "6.0"` (e.g. `baseUrl` deprecation path) |
| UI | **React**, **Sass** (`globals.scss`) |
| Database | **PostgreSQL 16** |
| Cache / pub-sub | **Redis 7**, **ioredis** |
| ORM | **Prisma** → `src/generated/prisma` |
| DB driver | **`pg`** + **`@prisma/adapter-pg`** |
| Validation | **Zod** |
| Client async | **TanStack React Query** |
| Auth | **jose** (middleware), **jsonwebtoken** (Node), **scrypt** passwords |
| Realtime libs | **socket.io**, **socket.io-client**, **@socket.io/redis-adapter** |
| Lint | **ESLint 9** + **`eslint.config.mjs`** (`eslint-config-next/core-web-vitals`) |
| Containers | **Docker Compose** — `postgres`, `redis`, `socket-gateway`, `next-dev`; **`next-prod`** under **`production`** profile |

---

## Repository layout (high level)

```
src/app/                 # App Router: pages, layouts, API routes
src/app/actions/         # Server actions (Redis demo)
src/app/api/auth/        # Login, register, me, logout
src/app/api/tasks/       # Task CRUD + analytics
src/app/api/realtime/    # SSE stream
src/app/realtime/        # Realtime demo page + client panel
src/components/          # UI (tasks, auth, …)
src/hooks/               # React Query hooks
src/lib/                 # db, redis, auth, server-auth
src/middleware.ts        # JWT for /api/tasks/*
src/models/              # Zod + types
src/services/            # task-service, auth-service
realtime/socket-server.mjs   # Socket.IO gateway (Node ESM)
prisma/                  # schema, migrations, prisma.config
public/                  # Static files (Dockerfile expects folder)
docker/                  # entrypoint.dev.sh, entrypoint.prod.sh
Dockerfile               # Production Next image
Dockerfile.dev           # Dev Next image
Dockerfile.socket        # Socket gateway image
.github/workflows/     # ci.yml, cd.yml
PROJECT.md               # This file
```

---

## Docker

| File / service | Purpose |
|----------------|---------|
| **`docker-compose.yml`** | Orchestrates all services. |
| **`postgres`** | DB, volume `postgres_data`, `:5432`. |
| **`redis`** | Cache + pub/sub, AOF, volume `redis_data`, `:6379`. |
| **`socket-gateway`** | Builds **`Dockerfile.socket`**, `:3002`, depends on **`redis`**. |
| **`next-dev`** | `:3000`, bind mount **`.:/app`**, depends **`postgres`** + **`redis`**, env includes **`REDIS_URL`**, **`NEXT_PUBLIC_SOCKET_URL`**. |
| **`next-prod`** | Profile **`production`**, `:3001`→`3000`, same DB/Redis/socket URL pattern. |

**Npm shortcuts** (from `package.json`):

| Script | Command |
|--------|---------|
| `docker:dev` | `docker compose up --build next-dev postgres redis socket-gateway` |
| `docker:dev:detach` | Same with `-d` |
| `docker:dev:down` | `docker compose down` |
| `docker:prod` / `docker:prod:detach` | Profile **production** + `next-prod` + postgres + redis + socket-gateway |
| `docker:prod:down` | `docker compose --profile production down` |
| `docker:db` | Postgres only, detached |
| `docker:logs` | Follow logs for next-dev, postgres, redis, socket-gateway |

---

## CI / CD

### CI (`ci.yml`)

- Triggers: **push** to `main` / `master`, all **pull_request**s.
- **Services**: **Postgres 16** + **Redis 7** (healthchecks).
- **Env**: `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`.
- Steps: `checkout` → `setup-node` (22, npm cache) → **`npm ci`** → **`prisma migrate deploy`** → **`npm run lint`** → **`npm run typecheck`** → **`npm run build`**.

### CD (`cd.yml`)

- Trigger: **`workflow_run`** after workflow **`CI`** completes (not `needs:` across files — GitHub Actions only allows `needs` **within one workflow**).
- Job runs if: **`conclusion == success`** and branch is **`main`** or **`master`**.
- Builds **`Dockerfile`** (Next production app only) and pushes **`ghcr.io/<repository_owner>/nextjs-postgres-app:latest`**.

> The **Socket.IO gateway** image is built via Compose (`Dockerfile.socket`), not the CD workflow, unless you add a second push step later.

---

## Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes (app) | Postgres connection string. |
| `JWT_SECRET` | Strong value in prod | JWT sign/verify (Next + socket-gateway). |
| `REDIS_URL` | No | If set, enables cache + pub/sub + SSE subscriber + publishes consumed by socket-gateway. |
| `NEXT_PUBLIC_SOCKET_URL` | No | Browser URL for Socket.IO client (Compose default `http://localhost:3002`). Inlined at **Next build** for client bundles. |

---

## Common commands

```bash
# Install (commit package-lock.json after dependency changes)
npm ci

# Database
npm run prisma:migrate:deploy

# Local Next (host)
npm run dev

# Quality
npm run lint
npm run typecheck
npm run build
npm run check          # lint + typecheck

# Docker (recommended shortcuts)
npm run docker:dev:detach
npm run docker:logs
npm run docker:dev:down

# Production profile locally
npm run docker:prod:detach
```

Equivalent raw Compose:

```bash
docker compose up --build -d next-dev postgres redis socket-gateway
docker compose --profile production up --build -d next-prod postgres redis socket-gateway
```

---

## Quick start: realtime page

1. Start stack: **`npm run docker:dev:detach`** (or Compose command above).
2. Open **`http://localhost:3000/auth`**, register / log in.
3. Open **`http://localhost:3000/realtime`**:
   - **SSE** log from `/api/realtime/sse`.
   - **Socket.IO** log from gateway on **`NEXT_PUBLIC_SOCKET_URL`** (default port **3002**).
4. Use **Publish** / **Bust task cache** forms (server actions) or change tasks on **`/csr`** to see **`task.created`** / **`task.updated`** / **`task.deleted`** style events when Redis is enabled.

---

## Design notes and trade-offs

- **Why a separate Socket.IO container?** Next’s default server does not expose WebSocket upgrades on the same app port the way a classic `ws` + `http` server does. The **sidecar** reuses your **session cookie + JWT** and Redis so you still get a realistic WebSocket path in Docker.
- **SSE vs WebSocket**: SSE is one-way (server → browser) over normal HTTP and fits Next route handlers; WebSockets are full-duplex and suit the gateway (`client:ping` / `client:pong` demo).
- **Middleware vs route auth**: `/api/tasks/*` uses Edge middleware; **`/api/realtime/sse`** verifies the cookie in the **route** so it does not need to be added to the middleware matcher.
- **Prisma `status`**: string in Prisma model; SQL CHECK enforces allowed values; `mapTask` narrows for API types.
- **Generated Prisma client** under `src/generated/prisma` may produce ESLint warnings; you can extend `eslint.config.mjs` ignores if needed.

The **source of truth** for behavior is always the code next to each feature (routes, services, `realtime/socket-server.mjs`, migrations).
