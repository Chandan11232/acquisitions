# Acquisitions API Docker setup (Neon Local + Neon Cloud)
This project is dockerized with separate development and production database flows:
- Development uses Neon Local in Docker.
- Production uses your Neon Cloud database URL.

## Files
- `Dockerfile`: multi-stage image for development and production.
- `docker-compose.dev.yml`: runs app + Neon Local proxy for local development.
- `docker-compose.prod.yml`: runs app and connects to Neon serverless Postgres through external `DATABASE_URL`.
- `.env.development`: development variables for Neon Local.
- `.env.production`: production variables for Neon Cloud.

## Development environment (Neon Local)
The app connects to Neon Local using:
- `DATABASE_URL=postgres://neon:npg@neon-local:5432/neondb`
- `NEON_LOCAL_FETCH_ENDPOINT=http://neon-local:5432/sql`

Neon Local creates ephemeral branches automatically. In this setup:
- `PARENT_BRANCH_ID` defines the parent branch to clone from.
- `DELETE_BRANCH=true` deletes the ephemeral branch when the container stops.

### Start development stack
1. Fill `.env.development` with your Neon values:
   - `NEON_API_KEY`
   - `NEON_PROJECT_ID`
   - `PARENT_BRANCH_ID`
2. Run `docker compose -f docker-compose.dev.yml --env-file .env.development up --build`.
3. App runs at `http://localhost:3000`.

### Stop development stack
Run `docker compose -f docker-compose.dev.yml --env-file .env.development down`.

## Production environment (Neon Cloud)
Production does not run Neon Local. The app connects directly to Neon Cloud with:
- `DATABASE_URL=postgresql://...neon.tech...`

### Start production stack
1. Fill `.env.production` with production secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ARCJET_KEY` (and any additional secrets your app needs)
2. Run `docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d`.

### Stop production stack
Run `docker compose -f docker-compose.prod.yml --env-file .env.production down`.

## Environment switching (`DATABASE_URL`)
- Development command uses `.env.development`, so app points to `neon-local:5432`.
- Production command uses `.env.production`, so app points to Neon Cloud.
- No database URLs are hardcoded in application source.

## Deployment note
For real deployments, inject `DATABASE_URL` and secrets from your platform secret manager instead of committing real secret values to repository files.
