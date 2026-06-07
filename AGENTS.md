# AGENTS.md — PathFinder

## Project structure

Full-stack monorepo: Spring Boot 3.3.5 (Java 21) backend + Next.js 16.2.6 (React 19) frontend + nginx proxy. Deployed via Docker on AWS EC2.

```
backend/       Spring Boot + Maven (./mvnw)
frontend/      Next.js App Router + Tailwind CSS v4
nginx/         Reverse proxy config (local.conf / nginx.conf)
HU/            User story spreadsheets
```

## Branch workflow

- `main` — production; only receives merges from `develop` (implantador role)
- `develop` — integration branch; receives `feature/*` PR merges (integrador role)
- `feature/*` — developers work here, push commits, never merge themselves
- Push to `develop` triggers GitHub Actions → EC2 deploy

## Backend (Spring Boot)

- **Entrypoint**: `com.pathfinder.PathfinderApplication`
- **Port**: 8080
- **Profiles**: `dev` (default, env-var DB), `test` (H2 in-memory), `prod` (PostgreSQL env vars)
- **Build**: `./mvnw clean package -DskipTests` (in backend/)
- **Run locally**: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev`
- **Swagger**: `/swagger-ui/` and `/v3/api-docs` (proxied through nginx)
- **Health**: `/actuator/health`

### Auth system
- Dual auth: Google OAuth2 (`/oauth2/`) + JWT email login (`/api/auth/login`)
- `JwtAuthenticationFilter` runs before `UsernamePasswordAuthenticationFilter`
- Admin detected by hardcoded email `jhuamanp@pucp.edu.pe` (configurable via `app.admin.email`)
- Mentor set hardcoded in `OAuth2SuccessHandler`
- All responses wrapped in `ApiResponse<T>` envelope `{ success, message, data }`

### Conventions
- Interface-separated services (interface in `service/`, impl in `service/impl/`)
- Heavy Lombok: `@RequiredArgsConstructor`, `@Slf4j`, `@Builder`
- All entities extend `AuditoriaBase` (soft-delete via `activo` boolean, audit timestamps)
- CORS allows: `pathfinder.work.gd`, localhost:3000, localhost:8080

### Key deps
- JPA, PostgreSQL (prod), H2 (test), Lombok, JJWT 0.12.6, AWS S3 SDK, PDFBox 3.0.3, SpringDoc OpenAPI 2.5.0

## Frontend (Next.js 16)

- **This is NOT the Next.js your training data knows** — read `frontend/node_modules/next/dist/docs/` before writing code
- **React 19.2.4**, **Tailwind CSS v4** (PostCSS: `@tailwindcss/postcss`), **NextAuth v4**
- **Commands** (in frontend/):
  - `npm run dev` — dev server on :3000
  - `npm run build` — production build
  - `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
  - No test command configured
- **Path alias**: `@/*` → `frontend/`
- **Backend URL**: `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:8080`)

### Auth & routing
- **middleware.ts** is minimalist: only checks auth token, delegates role validation to client layouts
- Role-protected route groups: `/user/*`, `/mentor/*`, `/admin/*`
- Role validation happens client-side in each layout via `useSession()` + `useRouter()`
- Login → `/role-redirect` → role-specific home
- Legacy `/usuario/*` routes exist as duplicates **without** role validation
- NextAuth route: `api/auth/[...nextauth]/route.js`
- Session augmentation in `next-auth.d.ts`: fields `backendJwt`, `rol`, `idUsuario`, `nuevoUsuario`, etc.

### API client
- `lib/api.ts`: `apiFetch()` handles auth token injection, FormData vs JSON, unwraps `ApiResponse` envelope

### Role utils
- `lib/role-utils.ts`: `getRoleBasePath()`, `getRoleHomePath()`, `isValidRole()`, `getRoleDisplayName()`
- `hooks/use-role.ts`: `useUserRole()`, `useUserInfo()`

## Docker

- **Production**: `docker-compose.yml` — 3 services (backend, frontend, nginx) on `pathfinder-net`
- **Local**: `docker-compose.local.yml` — same 3 services, nginx uses `local.conf`, ports exposed
- Backend healthcheck: `curl -f http://localhost:8080/actuator/health`
- Frontend waits for backend healthy before starting
- Nginx routes: `/` → frontend:3000, `/api/` → backend:8080, `/api/auth/` → frontend:3000 (NextAuth), `/oauth2/` → backend:8080
- SSL certs expected at `/etc/letsencrypt/live/pathfinder.work.gd/` (not in repo)
- `certbot/` is gitignored

## CI/CD

- **File**: `.github/workflows/deploy.yml`
- **Trigger**: push to `develop`
- **Action**: SSH into EC2, `git reset --hard origin/develop`, `docker-compose down`, selective `docker-compose build`, `docker-compose up -d`
- Selective rebuild based on changed paths (`frontend/` vs `backend/`)

## Environment

- `.env`, `.env.local`, `.env.production` are gitignored — create manually
- Required vars: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`, `NEXT_PUBLIC_BACKEND_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `AWS_*`
- Frontend: `NEXTAUTH_URL` must match actual URL (local: `http://localhost:3000`, prod: `https://...`)
- `backend_logs.txt` and `backend_errors.txt` exist at repo root (not gitignored, likely transient)

## Gotchas

- Root `package-lock.json` is empty — no root-level `package.json`; all JS deps are in `frontend/`
- Frontend `AGENTS.md` and `CLAUDE.md` exist in `frontend/` — `CLAUDE.md` just references `@AGENTS.md`
- `application.properties` sets `spring.profiles.active=dev` but does **not** configure a datasource — dev expects env-var DB or falls back to defaults
- Lombok annotation processing is configured in `pom.xml` via `maven-compiler-plugin`
- ESLint uses flat config (`eslint.config.mjs`), not `.eslintrc.*`
- Upload limit: 10MB (backend multipart) / 15MB (nginx `client_max_body_size`)
