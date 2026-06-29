---
name: Static image references live in THREE places
description: Where /image/* paths are referenced, so renaming/deleting a static asset doesn't break the site or a fresh reseed
---

# Renaming or deleting a file under web/public/image requires updating THREE sources
Static images (doctor portraits, promotion images, section hero/about images) are served from `web/public/image`. Their paths are referenced from three independent places — miss any one and you get 404s or a broken fresh-seed:

1. **Live DB rows** — `doctors.image_url`, `promotions.image_url` + `promotions.hero_image_url`, `directions.image_url` + `directions.hero_image_url`. Update with SQL `UPDATE ... SET col = REPLACE(col, '.png', '.webp') WHERE col LIKE '/image/%.png'`.
2. **Hardcoded code paths** — `web/app/_components/service-landing-data.ts` (stomatology/cosmetology hero+about), `web/app/lib/site.ts` (`OG_IMAGE`), plus scattered `src="/image/..."` in components.
3. **Seed sources (the easy one to forget)** — `server/doctorsData.ts`, `script/seed.ts`, `script/seed-content.ts`. The dev DB can look healthy after a direct SQL update while these still point at deleted files; any fresh-environment seed/reseed then inserts broken URLs.

**Why:** an image optimization pass converted ~29 PNGs→WebP and direct-SQL-updated the dev DB, but the seed files still pointed at the deleted `.png` — a latent break for new environments / disaster recovery.
**How to apply:** after any static-image rename/delete, grep `rg "/image/.*\.png" server script web` and confirm it only matches intentional survivors before finishing.

## Keep og-cover.png as PNG (do NOT convert to WebP)
The Open Graph share image (`/image/og-cover.png`, referenced by `OG_IMAGE` in `web/app/lib/site.ts`) stays PNG. **Why:** some OG consumers (e.g. LinkedIn) don't render WebP, so social previews would break.

## Optimization pipeline that matched the in-app uploader
WebP conversion used sharp with `.rotate().resize({width:1920, withoutEnlargement:true}).webp({quality:80})` — same settings as `server/imageService.ts`, so direct-added static images match library-uploaded ones. ~36.5MB→1.3MB (~96%).

## Favicon is an icon SET, not a single file
The favicon lives in `web/public/` as a set generated from the brand mark (4 teal `#007d83` ellipses, same shape as the `<Logo>` SVG in `SiteHeader.tsx`): `favicon.svg` (source of truth, white rounded-square bg), `favicon.ico` (multi-size 16/32/48), `favicon-16/32/48/192/512.png`, `apple-touch-icon.png` (180, flattened on white so iOS corners aren't black). Regenerate PNGs/ICO from the SVG via sharp (density 384) + ImageMagick `magick ... favicon.ico`.
**Referenced in TWO places** — update both on any rename: `web/app/layout.tsx` (`metadata.icons`) and `web/app/lib/seo.ts` (JSON-LD `MedicalClinic.logo` → `/favicon-192.png`, NOT the tiny ico). The old single `/favicon.png` was deleted.

## Prod is a separate VPS
The converted files ship via git deploy + `next build`, but the DB `.png`→`.webp` UPDATEs must be replayed on the prod Postgres (separate DB). Order matters: ship files + run DB update together (maintenance window) or prod serves 404s while DB still points at old paths.
