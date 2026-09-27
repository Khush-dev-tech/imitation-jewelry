# Maruti Imitation Jewelry — Website

Mobile-first e-commerce website for Maruti Imitation Jewelry, a Rajkot-based
manufacturer of imitation and micro gold-plated jewellery. Retail shopping
plus a dedicated wholesale/bulk-order enquiry flow.

**Specification lives in `../docs/`** (relative to this folder), not here:

- `00-app-brief.md` — client, goals, audience, business details, constraints
- `01-prd.md` — product requirements and scope (source of truth for functionality)
- `02-trd.md` — technical decisions and architecture
- `03-app-flow.md` — every screen, route, and state
- `04-ui-ux-brief.md` — visual design system and interaction rules
- `05-backend-schema.md` — database schema and access rules
- `06-implementation-plan.md` — the phased build plan this codebase follows

Read those before changing scope, adding a feature, or picking a library —
this codebase should never drift from what's approved there.

## Stack

Next.js (TypeScript, App Router) · Tailwind CSS v4 · Prisma + PostgreSQL ·
Auth.js (customer accounts) · Radix UI primitives (dialog/toast) — see
`docs/02-trd.md` for the full reasoning behind each choice.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in real values as each phase needs them
npm run dev
```

Open http://localhost:3000.

A real PostgreSQL database isn't provisioned yet — `DATABASE_URL` in
`.env.example` is a local placeholder. Provision one (Neon/Supabase/Railway,
per TRD §1) before running `npx prisma migrate dev`.

## Scripts

| Command                           | Purpose                                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------------------- |
| `npm run dev`                     | Local dev server                                                                          |
| `npm run build`                   | Production build                                                                          |
| `npm run lint`                    | ESLint                                                                                    |
| `npm run typecheck`               | TypeScript, no emit                                                                       |
| `npm run test`                    | Vitest — unit tests for pricing, WhatsApp templates, validation, payment signatures, etc. |
| `npm run format` / `format:check` | Prettier                                                                                  |
| `npx prisma generate`             | Regenerate the Prisma client (also runs automatically on `npm install` via `postinstall`) |
| `npx prisma migrate dev`          | Apply schema migrations — needs a real `DATABASE_URL`                                     |

## Project status

Complete, in the reconciled phase order (see chat history for the
reconciliation against `docs/06-implementation-plan.md`):

- **Foundation** — scaffold, design tokens, component library, header/
  footer/mobile menu, floating WhatsApp widget.
- **Admin Foundation** — custom admin auth (not Auth.js — Backend Schema
  §2), rate-limited login, protected `/admin/*`. Product/category CRUD,
  image upload (local disk — see `lib/uploads.ts` for the Cloudinary
  swap-in point), stock toggle, soft-delete.
- **Storefront** — real homepage, Shop/Category pages, filter/sort.
- **Product Pages & Search** — product detail (gallery, variants, WhatsApp
  enquiry), search, cart state (Zustand + localStorage, TRD §2).
- **Cart & Checkout (non-payment)** — `/cart`, `/checkout` (guest only —
  account login/register, PRD §8.11, is **not yet built**), order
  creation with server-side price/stock re-verification, order
  confirmation, minimal admin order visibility (`/admin/orders`).
- **Payment Integration** — Razorpay (TRD §5). **Code-complete but
  unverified against a live account** — no sandbox credentials were
  available at build time. `/admin/settings` toggles
  `payment_gateway_enabled` and refuses to turn on without
  `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` set. The webhook signature
  logic (`lib/payments/razorpay.ts`) was verified with hand-computed HMAC
  payloads; the actual Checkout.js round-trip and live webhook delivery
  have not been. Before this goes live: add real sandbox keys, run a full
  test-mode payment, then configure the webhook URL
  (`/api/webhooks/razorpay`) in the Razorpay dashboard with events
  `payment.captured` and `payment.failed`.

- **Order Confirmation & Admin Order Management** — admin can update an
  order's status (`/admin/orders/[id]`, audit-logged) and filter the
  orders list by status. Automated order-confirmation email via Resend
  (TRD §4) fires on non-payment order placement and on payment success;
  gracefully no-ops (logs a warning, never breaks checkout) when
  `EMAIL_API_KEY`/`EMAIL_FROM_ADDRESS` are unset. The email-content
  builder is unit-tested; **no email has been sent through a live Resend
  account** — same "code-complete, unverified" caveat as payment.

- **Wholesale Leads, Contact & Policy Pages** — `/wholesale` (form +
  durable lead storage + WhatsApp handoff, matching TRD §6's exact
  template), `/contact` (real business details from `site_settings`, plus
  a working Google Maps embed built from the address with **no API key**
  — see `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_URL` in `.env.example` for the
  optional precise-pin override), `/about` (only the confirmed App Brief
  facts — no invented founding story), and `/policies/[slug]` (shipping/
  returns/privacy/terms — all four show an honest "still being finalized"
  state, per the App Brief's explicit list of claims not to make until
  confirmed: free shipping, COD, delivery timelines, returns, exchanges).
  Admin can view and mark wholesale leads as contacted/closed
  (`/admin/wholesale-leads`, audit-logged).

- **Launch Readiness** — `robots.txt` and a live `sitemap.xml` (products/
  categories, not frozen at build time — same force-dynamic reasoning as
  the homepage), `metadataBase` for correct OG/canonical URL resolution,
  a Vitest unit-test suite (48 tests: WhatsApp template exact-matching,
  payment/webhook signature verification, email content, cart-store
  logic, Zod validation, `formatINR`/`slugify` — now wired into CI),
  Google Analytics 4 and Sentry error monitoring (both TRD §4 confirmed
  choices, both code-complete but **unverified** — no real GA4 property
  or Sentry project existed at build time; both render/initialize nothing
  while their env vars are unset, never a broken empty script).

Not yet built: account login/registration (PRD §8.11).

Local dev database: this project currently runs against a local
Prisma-managed Postgres instance (`npx prisma dev`), not a cloud-managed
one yet. Note the `pgbouncer=true` flag required on `DATABASE_URL` — the
local dev proxy reuses connections in a way that collides with Prisma's
default server-side prepared statements without it. This local instance
has repeatedly and unpredictably become unresponsive during this build
(port still listening, queries failing) — `npx prisma dev stop default`
then `npx prisma dev --detach` resolves it. A real provisioned Postgres
instance (Neon/Supabase/Railway) will not have this problem.

No product data (prices, stock, photos, policies) is invented anywhere in
this codebase — see `docs/01-prd.md` §6/§9 for the constraint this
enforces.

## Launch checklist

Everything below is genuinely unverified against a live third-party
account/service, or requires a decision only the business can make.
Each was built to the standard, documented integration pattern for its
service and is either unit-tested where that's possible without live
credentials, or gracefully no-ops when unconfigured — but "code-complete"
is not the same claim as "confirmed working end-to-end," and this list
exists so that distinction is never lost.

**Blocking (nothing here works at all until done):**

- [ ] Provision a real PostgreSQL instance (Neon/Supabase/Railway) and
      run `npx prisma migrate dev` against it — everything currently
      runs against a local, occasionally-flaky dev-only database.
- [ ] Get real product data from the business: photography, prices,
      descriptions, stock, categories. The catalogue is empty by design
      (Backend Schema §13 — no sample products were ever seeded).
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real production domain (affects
      `sitemap.xml`, `robots.txt`, and OG/canonical tags).

**Payment (Razorpay) — needs a live/sandbox account:**

- [ ] Complete Razorpay KYC/business onboarding (TRD §5 flags this can
      take longer than the integration itself).
- [ ] Add real `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET`/`RAZORPAY_WEBHOOK_SECRET`.
- [ ] Run one real test-mode payment through Checkout.js end-to-end.
- [ ] Register the webhook URL (`/api/webhooks/razorpay`) in the Razorpay
      dashboard with `payment.captured` and `payment.failed` events.
- [ ] Only then turn the toggle on in `/admin/settings`.

**Email (Resend) — needs a live account:**

- [ ] Add real `EMAIL_API_KEY`/`EMAIL_FROM_ADDRESS` (a verified sending domain).
- [ ] Confirm one real order-confirmation email is actually delivered.

**Analytics & monitoring — needs live accounts:**

- [ ] Create a GA4 property, set `NEXT_PUBLIC_GA_MEASUREMENT_ID`, confirm
      real traffic appears in GA4's realtime view.
- [ ] Create a Sentry project, set `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN`
      (and optionally `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN`
      for readable source maps), confirm a deliberately-thrown test error
      actually reaches the Sentry dashboard.

**Images (Cloudinary) — needs a live account:**

- [ ] Add real `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET`
      and swap `lib/uploads.ts` from local disk (`public/uploads/`, which
      does not survive most serverless deploys) to Cloudinary.

**Content the business needs to supply (never invented — see PRD §6/§9):**

- [ ] About Us story/craftsmanship content (currently a labeled "coming soon").
- [ ] Shipping, Returns, Privacy, and Terms policy text (currently a
      labeled "still being finalized" state on all four pages).
- [ ] Confirmation on whether COD or other payment methods beyond
      Razorpay are needed.

**Product decisions still open (flagged across the planning docs, never
silently assumed):**

- [ ] Whether customer accounts (login/register/order history, PRD
      §8.11) are needed for launch, or guest checkout is acceptable
      indefinitely — guest checkout is fully functional today either way.
- [ ] Per-variant stock tracking vs. product-level only (Backend Schema
      §4.9 — currently product-level, variants inherit unless overridden).
- [ ] Soft-delete semantics for products/categories (Backend Schema §8 —
      implemented as soft-delete, not explicitly confirmed by the client).
- [ ] Final `orders.status`/`wholesale_leads.status` vocabulary (Backend
      Schema §16 — current values are a reasonable proposal, not confirmed).

**Recommended before real traffic, not build-blocking:**

- [ ] Set up a staging environment (separate DB/env vars, TRD §10)
      distinct from production.
- [ ] Confirm the Vercel hosting recommendation (TRD §11) and budget
      ceiling with the business.
- [ ] A DPDP Act (India) compliance review — this codebase follows
      reasonable minimal-collection practice but a formal legal review
      is explicitly out of scope here (Backend Schema §15).
