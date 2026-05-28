# Proyecto-5-PathFinder

Digital simulator reducing job‑related anxiety and mismatch for university students in Peru (target: PUCP Gestión y Alta Dirección). Initial specialization: HR.

**MVP scope**: CV upload (PDF) → auto‑complete profile, DISC psychometric test (manual interpretation), mock interview scheduling (Google Calendar redirect), SkillPath (learning routes), PathChallenge (case‑based challenges, initial focus HR), Admin panel for users/content/metrics.

**Non‑functional**: Docker on AWS EC2, Google OAuth + JWT, <3s load, 24/7, highly visual/gamified UI for Gen Z.

Monorepo: `backend/` (Spring Boot 3.3.5, Java 21, Maven Wrapper) + `frontend/` (Next.js 16, React 19, TypeScript, Tailwind CSS v4). Deployed via Docker Compose to EC2 with nginx + Let's Encrypt SSL behind `pathfinder.work.gd`.

## Branch workflow

- `main` ← `develop` ← `feature/*` — no direct commits to `main` or `develop`.
- CI/CD: push to `develop` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): SSH into EC2, selective `docker-compose build` (only changed stack), `docker-compose up -d`.

## Backend (`backend/`)

- **Entrypoint**: `com.pathfinder.PathfinderApplication` (`backend/src/main/java/...`)
- **Build/test**: `./mvnw clean package -DskipTests` (build), `./mvnw test` (runs with `@ActiveProfiles("test")` → H2 in PostgreSQL mode)
- **Dev server**: `./mvnw spring-boot:run` (uses `application.properties` with H2 by default)
- **Profiles**: `dev` (default, H2), `test` (H2, explicit), `prod` (PostgreSQL via env vars)
- **Auth**: JWT + OAuth2/Google. Keys from env in prod; hardcoded defaults in dev.
- **API docs**: Swagger UI at `/swagger-ui/` (blocked to admin email `jhuamanp@pucp.edu.pe` in prod)
- **Key deps**: jwt (jjwt 0.12.6), Lombok (annotation processing), PDFBox 3.0.3, springdoc-openapi 2.5.0

## Frontend (`frontend/`)

- **Dev**: `npm run dev` (Next.js dev on :3000)
- **Build**: `npm run build` then `npm start` for prod-like
- **Lint**: `npm run lint` — uses ESLint flat config (`eslint.config.mjs`), `eslint-config-next` v16
- **Tailwind**: v4 with `@tailwindcss/postcss` plugin (NOT classic `tailwindcss` config)
- **TypeScript**: strict mode, `@/*` path alias maps to project root
- **Auth**: NextAuth v4 with custom `next-auth.d.ts` type extensions. Session carries `backendJwt`, `idUsuario`, `rol`, `nuevoUsuario`, `requiereCompletarPerfil`
- **API calls**: centralized via `@/lib/api.ts` — injects `Bearer` token from session, handles FormData for CV upload
- **UI libs**: radix-ui, lucide-react, recharts, react-hook-form, sonner (toast), vaul (drawer), cmdk, embla-carousel, react-day-picker

## Infrastructure

- **Docker**: `docker-compose.yml` defines `backend`, `frontend`, `nginx` services on `pathfinder-net` bridge network.
- **Nginx**: SSL termination, reverse-proxy — `/api/` → backend:8080, `/api/auth/` → frontend:3000 (NextAuth), `/swagger-ui/` / `/v3/api-docs/` → backend, `/oauth2/` → backend.
- **Env vars**: `.env*` files gitignored. Prod secrets injected at runtime to Docker.

## Key files

| File | Purpose |
|---|---|
| `.github/workflows/deploy.yml` | CI/CD: build + deploy to EC2 on push to `develop` |
| `docker-compose.yml` | Orchestrates all 3 containers with health checks |
| `nginx/nginx.conf` | Reverse-proxy rules for frontend, backend, swagger, OAuth |
| `backend/pom.xml` | Maven build, all Spring Boot + security deps |
| `frontend/package.json` | npm scripts: `dev`, `build`, `start`, `lint` |
| `frontend/eslint.config.mjs` | ESLint flat config (Next.js core-web-vitals + TypeScript) |
| `frontend/next-auth.d.ts` | Session/User/JWT type extensions for custom auth fields |
| `frontend/lib/api.ts` | Centralized `apiFetch()` helper with token injection |
