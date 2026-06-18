# PathFinder — Agent Guide

## Domain
Career guidance platform for Peruvian university students (target: PUCP Gestión y Alta Dirección). MVP features:
- CV upload (PDF) → auto-complete student profile
- DISC psychometric test (manual interpretation)
- Mock interview scheduling (Google Calendar redirect)
- SkillPath (learning routes) & PathChallenge (case-based challenges, initial focus HR)
- Admin panel for users/content/metrics

## Architecture
Two independent packages:
- `frontend/` — Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS v4, Radix UI, NextAuth.js 4 (Google OAuth2)
- `backend/` — Spring Boot 3.3.5, Java 21, Maven wrapper (`./mvnw`), PostgreSQL (prod) / H2 (test/dev)
- nginx reverse proxy: `/api/auth/*` → frontend `:3000`, `/api/*` → backend `:8080`. Order matters.
- CI/CD: push to `develop` or `main` → auto-deploy to AWS EC2 via GitHub Actions (`docker compose up -d --build`). Both branches are production.

## Branching & Deployment

Both `develop` and `main` are production branches. Active development targets `develop` directly (time-constrained). GitHub Actions deploys automatically on push to either branch.

**Docker compose roles:**
- `docker-compose.yml` (default) — production config for AWS EC2. No direct port exposure on services; nginx handles SSL with Let's Encrypt. Env vars come from host/CI secrets.
- `docker-compose.local.yml` — local development. Exposes `:8080` (backend) and `:3000` (frontend). Uses `nginx/local.conf` (no SSL, includes WebSocket `/ws`). Env vars loaded from `.env` file.

**Nginx configs differ:**
| Aspect | `nginx.conf` (prod) | `local.conf` (dev) |
|--------|---------------------|---------------------|
| SSL | Yes, Let's Encrypt | No |
| Domain | `pathfinder.work.gd` / `www.pathfinder.work.gd` | `localhost` |
| WebSocket `/ws` | ✅ Included | ✅ Included |
| Port | 80 → 301 → 443 | 80 only |

## Commands

### Frontend
| Action | Command |
|--------|---------|
| Dev server | `npm run dev` (port 3000) |
| Build | `npm run build` |
| Lint | `npm run lint` (ESLint only — no Prettier) |
| Typecheck | `npx tsc --noEmit` |
| Tests | None configured. Install test framework if needed. |

### Backend
| Action | Command |
|--------|---------|
| Dev server | `./mvnw spring-boot:run` (port 8080) |
| Build | `./mvnw clean package -DskipTests` |
| Tests | `./mvnw test` |
| Single test | `./mvnw test -Dtest=ClassName#methodName` |

### Full stack
- `docker-compose up -d` (production)
- `docker-compose -f docker-compose.local.yml up -d` (local)

## Architecture notes
- **3 roles** (User, Mentor, Admin) each with route groups under `frontend/app/{user,mentor,admin}/(authenticated)/`.
- Middleware is **auth-only** (minimal). Role validation happens in role layouts via `useSession()` — see `frontend/PRODUCTION_SAFE_ROLES.md`.
- Backend API calls go through `lib/api.ts` (`apiFetch`). Server-side uses `BACKEND_URL`, client-side uses `NEXT_PUBLIC_BACKEND_URL`.
- Backend wraps all responses in `{success, message, data}`; `apiFetch` unwraps to `json.data`.
- Spring profile `test` uses H2 with `MODE=PostgreSQL` for compatibility.
- API docs: Swagger UI at `/swagger-ui.html`.

## Gotchas
- **No frontend test framework.** Add one from scratch if needed.
- Duplicate route groups: `app/user/` and `app/usuario/`, also `test_login/` and `test-login/`.
- Root `node_modules/` exists (not gitignored) — likely accidental. Real frontend deps are in `frontend/node_modules/`.
- Dev JWT secret is hardcoded in `application.properties`; prod uses env var `JWT_SECRET`.
- Backend requires many env vars (DB, Google OAuth, AWS S3, JWT, Mail) — see `docker-compose.yml`.
- Known past gap: production `nginx.conf` and CORS in `SecurityConfig.java` were missing `/ws` and `www.` origin. Fixed in `feature/ws-config`. If you see WebSocket or CORS issues on production, check both files.

## Existing instruction files
- `frontend/AGENTS.md` — **critical**: Next.js 16 has breaking changes from prior versions. Read before writing frontend code.
- `frontend/ROLES_STRUCTURE.md` — 3-role architecture details.
- `frontend/PRODUCTION_SAFE_ROLES.md` — production auth strategy with layered validation.
