# Running This Project Locally

Step-by-step instructions to get this app running on `http://localhost:3000`,
plus the tools/technologies it's built on. This supplements `README.md`
(which covers the intended, provisioned-database setup) with the exact
steps needed when running from a fresh checkout/extract with only the
local dev database.

## Tech stack

| Layer            | Technology                                             |
| ----------------- | ------------------------------------------------------ |
| Framework         | Next.js 16 (App Router, Turbopack, TypeScript)          |
| UI                | React 19, Tailwind CSS v4, Radix UI (dialog/toast)      |
| State             | Zustand (cart, persisted to localStorage)               |
| Database          | PostgreSQL, accessed via Prisma ORM 6                   |
| Auth (admin)      | Custom session auth (bearer token), bcryptjs password hashing |
| Auth (customers)  | Not yet built (guest checkout only)                     |
| Payments          | Razorpay (code-complete, disabled until keys are set)   |
| Email             | Resend (order confirmations; no-ops until keys are set) |
| Image storage     | Local disk (`public/uploads/`) — Cloudinary swap-in planned |
| Analytics/Monitoring | Google Analytics 4, Sentry (both no-op until configured) |
| Validation        | Zod                                                     |
| Testing           | Vitest                                                  |
| Linting/Formatting| ESLint, Prettier                                        |

## Prerequisites

- Node.js (v20+; this was run with v22)
- npm
- No local PostgreSQL install needed — Prisma's own local dev server
  (`npx prisma dev`) provides one automatically.

## Step-by-step

1. **Install dependencies** (also regenerates the Prisma client via the
   `postinstall` script):

   ```bash
   npm install
   ```

2. **Set up environment variables.** A `.env` should already exist with a
   local `DATABASE_URL`. If not, copy the example and leave the optional
   integrations (Razorpay, Resend, Cloudinary, GA4, Sentry) blank — the
   app runs fine without them:

   ```bash
   cp .env.example .env.local
   ```

3. **Start the local Postgres dev database** (Prisma-managed, no Docker
   required):

   ```bash
   npx prisma dev --detach
   ```

   This starts a local Postgres instance matching the `DATABASE_URL` in
   `.env`/`.env.local`. Leave it running in the background — it persists
   data between restarts. If it ever becomes unresponsive:

   ```bash
   npx prisma dev stop default
   npx prisma dev --detach
   ```

4. **Apply database migrations:**

   ```bash
   npx prisma migrate deploy
   ```

5. **Regenerate the Prisma client for your machine**, even if `npm install`
   already did this — a client generated on a *different* machine (e.g.
   bundled in a zip/export) bakes in absolute file paths and will fail
   with `PrismaClientInitializationError: could not locate the Query
   Engine`:

   ```bash
   npx prisma generate
   ```

6. **Seed the database** (creates one admin login, default site settings,
   and product categories — no sample products, by design):

   ```bash
   npx prisma db seed
   ```

   This prints an admin email + a **randomly generated password once**.
   Copy it immediately — it is not stored anywhere and cannot be
   recovered, only reset by re-running against an empty `admin_users`
   table or updating the DB directly.

7. **Start the dev server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Admin panel is at
   [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Troubleshooting

- **Port 3000 already in use / "Another next dev server is already
  running":** an old `next dev` process is still holding the port. Find
  and stop it:

  ```bash
  netstat -ano | findstr :3000
  taskkill /PID <pid> /F
  ```

- **`PrismaClientInitializationError` / query engine not found:** re-run
  `npx prisma generate`, then fully stop and restart `npm run dev` (a
  hot-reloaded dev server won't pick up a freshly regenerated native
  client — it needs a fresh process). Clearing the Turbopack cache also
  helps if the error persists:

  ```bash
  rm -rf .next/dev/cache .next/cache/turbopack
  ```

- **Database connection errors:** confirm the local dev Postgres is
  running with `npx prisma dev --detach` and that `DATABASE_URL` in
  `.env`/`.env.local` includes `&pgbouncer=true`.

## Useful scripts

| Command                  | Purpose                                    |
| ------------------------- | ------------------------------------------- |
| `npm run dev`              | Start local dev server                      |
| `npm run build`            | Production build                            |
| `npm run start`            | Run a production build locally              |
| `npm run lint`             | ESLint                                      |
| `npm run typecheck`        | TypeScript check, no emit                   |
| `npm run test`             | Vitest unit tests                           |
| `npm run format`           | Prettier — auto-fix                         |
| `npx prisma studio`        | Browse/edit the local database in a GUI     |
| `npx prisma migrate dev`   | Create + apply a new migration (dev only)   |

## Not required to run locally

- The `docs/` folder referenced by `README.md`/`AGENTS.md` (product spec,
  architecture decisions) — useful context if extending the app, but the
  app runs without it.
- Razorpay, Resend, Cloudinary, GA4, and Sentry credentials — all
  integrations gracefully no-op when unset (see `.env.example` for what
  each unlocks).
