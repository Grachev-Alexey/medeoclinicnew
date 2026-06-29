---
name: MEDEO data quirks & prod DB
description: Non-obvious data-model facts and prod-migration steps for the medeo-mmc.ru hybrid Next+Express app
---

## Two parallel "stats" concepts
- DB-backed `/api/stats` was **removed** (banal "15 лет/30+/50 000+" numbers nobody rendered).
- Per-service hardcoded stats still live in `web/app/_components/service-landing-data.ts` (rendered by `ServiceLandingClient.tsx`). These are **intentional** — do not confuse them with the deleted DB feature when grepping "stats".

## Removing a DB-backed feature touches all these layers
page.tsx (initialData fetch) → HomeClient (prop + useQueries seed) → section components → admin nav (AdminShell) → admin page dir + entityConfigs → routes.ts (registerCrud + schema import) → storage.ts (import, IStorage iface, impl) → shared/schema.ts (table+zod+types) → seed.ts (import + block) → DROP TABLE.

## Price catalog: live DB can drift from catalogData.ts
**Why:** `seedPriceCatalogIfEmpty` (server/seedCatalog.ts) seeds `price_categories`/`price_items` from `server/catalogData.ts` ONLY when the table is empty; afterward the catalog is admin-editable, so the live DB and `catalogData.ts` diverge over time.
**How to apply:** to remove/change a price category you must edit BOTH `catalogData.ts` (so a fresh seed matches) AND run DELETE/UPDATE on the live DB. Never assume the DB mirrors `catalogData.ts` — query it first (e.g. when 5 categories existed in source, only 1 was still in DB; the rest had been curated out via admin).

## Directions kinds: audience vs specialty (auto-derived)
**Why:** `directions` rows are `kind='audience'` (dentistry/cosmetology/women/men/children, seeded with child `services`) or `kind='specialty'` (auto-created in seed.ts from "orphan" price categories that have no audience section). A specialty section is only created if its price category isn't already claimed by an audience service via SERVICE_CATEGORY_LINKS.
**How to apply:** removing a specialty means touching seed.ts (dirData services arrays + SERVICE_CATEGORY_LINKS + SPECIALTY_SECTIONS), seed-content.ts (service content blocks + SEO meta), catalogData.ts (category block), and the live DB (services/directions/price_categories deletes). Frontend is fully data-driven — no hardcoded slugs.

## Bookings are external (Medflex) — no in-app persistence
**Why:** the "Записаться" modal now embeds the Medflex booking widget as an iframe (booking.medflex.ru, user-token URL); Medflex owns all lead data, and a cross-origin iframe can't pipe submissions back into our DB. So the entire `bookings` table + /api/bookings + /api/admin/bookings + admin "Заявки" manager were removed.
**How to apply:** don't try to re-add a leads DB/admin for online booking — it can't capture iframe data. The modal lives in `BookingProvider.tsx` (still uses the global `a[href$="#contacts"]` click-interceptor to open). Prod VPS must also run `DROP TABLE IF EXISTS bookings;` to match.

## Reviews come only from the Yandex widget — no DB reviews feature
**Why:** reviews are sourced live from the official Yandex Maps reviews widget (iframe, org `226407459658`); the previous DB-backed reviews feature was deliberately removed to avoid maintaining duplicate/stale review data.
**How to apply:** don't re-add a DB reviews table/API/admin — the site is Yandex-only. The Yandex iframe wrapper needs `data-lenis-prevent` or Lenis hijacks wheel scroll. Prod VPS still has the old `reviews` table — run `DROP TABLE IF EXISTS reviews;` there at deploy (separate VPS, see prod-DB note).

## Production DB is a SEPARATE Ubuntu VPS (not Replit)
**Why:** `npm run dev` only touches the Replit dev Postgres. Any schema change (CREATE/DROP TABLE) made here via `psql "$DATABASE_URL"` does NOT reach prod.
**How to apply:** schema changes must be replayed manually on the prod VPS DB at deploy time. `drizzle-kit push` hangs (interactive TTY) — use raw SQL matching the model exactly. Commit each schema change as an idempotent `IF NOT EXISTS` SQL file under `deploy/sql/` (dated) so prod replay is repeatable, not a chat-only ALTER.

## Doctor "about" replaced by rating widgets (ПроДокторов/Яндекс)
**Why:** the long per-doctor bio ("простыня текста") was dropped from the page; instead each doctor shows branded ПроДокторов + Яндекс rating cards (`DoctorRatings.tsx`). The `about` column is KEPT — it's still the SEO meta-description fallback in `vrachi/[slug]/page.tsx` (admin field relabeled SEO-only).
**How to apply:** rating fields are admin-editable text columns (rating/reviews/url ×2); seeded values are PLACEHOLDERS the clinic must replace with real numbers/links. URLs empty → the card shows rating but no "Смотреть отзывы" link.
