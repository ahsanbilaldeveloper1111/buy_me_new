# Advanced Next.js + PostgreSQL CRUD (ISR/SSR/SSG/CSR)

This project includes:

- Next.js (App Router) + TypeScript
- Clean project structure (`components`, `hooks`, `models`, `services`, `lib`)
- React Query for client-state and server-state handling
- Full CRUD APIs using PostgreSQL + Prisma ORM
- Authentication flow (register/login/logout/me) with JWT HttpOnly cookie sessions
- Advanced PostgreSQL analytics query (CTEs + window functions + JSON aggregation)
- Docker setup for development and production
- CI/CD pipelines using GitHub Actions

## Architecture

- `src/app/api/tasks`: REST endpoints
- `prisma/schema.prisma`: Prisma datasource + models
- `prisma/migrations/*`: versioned SQL migrations (separate files per table)
- `src/generated/prisma`: generated Prisma client (latest generator flow)
- `src/services/task-service.ts`: Prisma CRUD + advanced SQL analytics query
- `src/services/auth-service.ts`: users table and auth data logic
- `src/services/task-client.ts`: frontend API client
- `src/services/auth-client.ts`: frontend auth API client
- `src/hooks/use-tasks.ts`: React Query hooks
- `src/components/*`: reusable UI blocks
- `src/app/csr`: CSR CRUD interface
- `src/app/auth`: signup + login UI
- `src/app/ssg`: SSG example
- `src/app/isr`: ISR example (`revalidate = 60`)
- `src/app/ssr`: SSR example (`dynamic = "force-dynamic"`)

## Run with Docker (development)

```bash
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000)

## Run production container profile

```bash
docker compose --profile production up --build
```

Prod app: [http://localhost:3001](http://localhost:3001)

## Local (without Docker)

1. Install Node.js 22+
2. Copy `.env.example` to `.env`
3. Run:

```bash
npm install
npm run prisma:migrate:deploy
npm run dev
```

## Prisma commands

```bash
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `GET /api/tasks?view=analytics`

`/api/tasks*` endpoints are protected and require login.

## CI/CD

- CI workflow: lint + typecheck + build (with Postgres service)
- CD workflow: build and push Docker image to GHCR
