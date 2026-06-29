---
name: Brand color (blue)
description: The site brand color and the fact it's hardcoded hex, not a token — where to change it and the teal→blue mapping.
---

# Brand color

Brand color is **blue `#005eb8`** (rgb 0,94,184), medical-blue. Changed from the
old teal/green `#007d83` on request ("сделать основной цвет синим, гармонично").

**There is NO central color token for the brand color.** It is hardcoded as
Tailwind arbitrary hex values (`bg-[#005eb8]`, `text-[#005eb8]`) and inline
styles across ~27 files in `web/app` and `web/src`. The shadcn `--primary` in
`web/app/globals.css` is navy (222 47% 11%) and is **unrelated** to the brand —
do NOT touch globals.css/tailwind.config.ts to change the brand color.

**Why:** brand color lives only as literal hex, so a color change = a global
find/replace of the hex family, not a token edit.

**How to apply** (the blue family in use, so future edits stay consistent):
- `#005eb8` primary · `#004a93` dark hover · `#1e72c8` light hover/lighter tone
- `#2f86dd` bright accent (gradient ends, decorative glows)
- light tints: `#e7f0fb` `#eef4fc` `#e8f1fc` `#f2f8fe` `#eaf3fc`
- `rgba(0,94,184,*)` for shadow/gradient alphas
- `accentPalette` arrays (SiteHeader.tsx, ServiceOverviewSection.tsx) are a
  deliberately multi-hue per-category decorative set (rose/navy/gold/blue/purple/
  light-blue) — keep them varied but teal-free.

**Keep green:** `emerald-*` / `green-*` classes are genuine "Принимает / доступен"
status badges — they are semantic, not brand. Do not recolor them.

**Keep navy:** `#0f1c2e` (and `#1a2535`, `#1e3a5f`) are headings/dark header bg —
intentional, pairs well with the blue.

**Favicons:** `web/public/favicon.svg` is the vector source; the raster set
(`favicon-16/32/48/192/512.png`, `apple-touch-icon.png`, multi-size `favicon.ico`)
must be regenerated from it on any color change (use `sharp`; build `.ico` by hand
since `png-to-ico` is not installed).

**Outstanding:** `web/public/image/og-cover.png` (social-share card) is a raster
image still in the old teal — needs a separate regeneration to match blue.
