---
name: Analytics / tracking pixels (Yandex.Metrika + victorycorp)
description: How third-party trackers are wired into the Next.js App Router site and why SPA tracking is pathname-only
---

# Trackers live in client components rendered from the root layout
Both trackers are rendered from `web/app/layout.tsx` body: `AnalyticsPixel` (victorycorp beacon) and `YandexMetrika` (counter 109376811). Each is its own `"use client"` component in `web/app/_components/`.

## SPA page-view tracking is by pathname only — deliberate
**Rule:** fire page views on `usePathname()` changes; do NOT use `useSearchParams()`.
**Why:** (1) `useSearchParams()` in App Router forces a client-side-render bailout up to the nearest Suspense boundary — on this SEO-critical site that would de-opt page SSR. (2) The site has NO query-param navigation (no `useSearchParams` anywhere; all routing is pathname/hash via `router.push(path)`), so query-keyed pageviews would add nothing and could over-count client-side filters. Keeping pathname-only also lets the Yandex `<noscript>` stay server-rendered on public pages.
**How to apply:** if query-param page states are ever introduced, track full URL by isolating a `useSearchParams()` tracker inside its own `<Suspense fallback={null}>` so the bailout doesn't reach page content.

## Yandex.Metrika init vs hit (avoid double-count)
The Metrika `ym(ID,'init',...)` call (loaded via `next/script` `afterInteractive`) already registers the FIRST page view. So the hit effect skips its first run (`isInitialLoad` ref) and only calls `ym(ID,'hit',url,{referer})` on subsequent navigations. `next/script` dedupes by `id`, so remounts don't re-init.

## Admin is excluded from ALL trackers
**Why:** never send internal `/admin*` URLs to third parties and never let Metrika webvisor record admin sessions (privacy).
**How to apply:** every tracker checks `pathname.startsWith("/admin")` and renders/fires nothing there — including suppressing the Yandex `<noscript>` in SSR on admin routes. Keep this guard on any new tracker.

## Verifying SSR locally
`$REPLIT_DEV_DOMAIN` does NOT respond to `curl` from the shell here — use `curl http://localhost:5000/` instead. `afterInteractive` inline scripts are injected client-side, so they never appear in raw SSR HTML; only the Yandex `<noscript>` watch pixel is in the SSR output.
