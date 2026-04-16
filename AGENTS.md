# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project overview

This is a Node.js (ESM) Express API with:

- Drizzle ORM over Neon Postgres (`@neondatabase/serverless` + `drizzle-orm/neon-http`)
- Zod request validation
- Auth using bcrypt + JWT + cookie-based token storage
- Arcjet-based security middleware (shield/bot detection/rate limiting)
- Winston + Morgan logging

Primary runtime entrypoint is `src/index.js`, which imports:

- `src/app.js` (Express app and middleware/routes setup)
- `src/server.js` (HTTP server startup on `PORT` or `3000`)

## Common commands

Use npm scripts from `package.json`:

- Install dependencies:
  - `npm ci`
- Run app locally (non-docker):
  - `npm run dev`
- Run app in production mode (non-docker):
  - `npm start`
- Lint:
  - `npm run lint`
- Auto-fix lint issues:
  - `npm run lint:fix`
- Format:
  - `npm run format`
- Check formatting:
  - `npm run format:check`
- Generate Drizzle migration files from schema:
  - `npm run db:generate`
- Apply migrations:
  - `npm run db:migrate`
- Open Drizzle Studio:
  - `npm run db:studio`

Docker workflows:

- Development stack (app + Neon Local):
  - `npm run dev:docker`
  - or `docker compose -f docker-compose.dev.yml --env-file .env.development up --build`
- Production-like stack (app + Neon Cloud URL from env):
  - `npm run prod:docker`
  - or `docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d`

## Tests

Current state:

- `npm test` is a placeholder that exits with error.
- No test files/framework are currently configured in the repository.

Single test execution:

- Not available until a test framework and test suite are added.

## Configuration and environment

Key env files:

- `.env.development` for Neon Local/docker development
- `.env.production` for production-like docker runs
- `.env.example` as reference

Critical variables used by runtime/database code:

- `DATABASE_URL` (required by `src/config/database.js`)
- `NEON_LOCAL_FETCH_ENDPOINT` (used for Neon Local HTTP fetch endpoint resolution)
- `ARCJET_KEY` (security middleware)
- `JWT_SECRET` (JWT signing)
- `PORT`, `NODE_ENV`, `LOG_LEVEL` (runtime/logging behavior)

## High-level architecture

Request flow is layered:

1. `src/app.js` initializes global middleware (CORS, Helmet, parsers, cookie parser, Arcjet security, Morgan logging) and mounts routes.
2. Route modules in `src/routes/*.routes.js` map HTTP paths to controller handlers.
3. Controllers in `src/controllers/*.controller.js` handle request/response orchestration:
   - validate input (Zod schemas in `src/validations`)
   - call service-layer functions
   - translate domain errors to HTTP status/messages
4. Services in `src/services/*.service.js` contain business logic and database interaction via Drizzle.
5. Data model schema lives in `src/models/User.model.js`; Drizzle config/migrations are in `drizzle.config.js` and `drizzle/`.

Cross-cutting modules:

- `src/config/database.js`: Neon + Drizzle initialization, including Neon Local special handling.
- `src/config/arcjet.js` + `src/middleware/security.middleware.js`: request protection and role-based rate limiting.
- `src/config/logger.js`: central Winston logger; Morgan writes HTTP logs into it.
- `src/utils/jwt.js`, `src/utils/cookies.js`, `src/utils/format.js`: auth/cookie/error-format helpers.

## Import conventions

`package.json` defines import aliases:

- `#config/*`, `#controllers/*`, `#middleware/*`, `#models/*`, `#routes/*`, `#services/*`, `#utils/*`

Prefer alias imports over long relative paths when editing code in these areas.
