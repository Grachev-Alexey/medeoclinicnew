---
name: Lenis smooth-scroll vs modal/overlay scroll
description: Why overlays/modals/dropdowns need data-lenis-prevent so their inner scroll works instead of scrolling the page background
---

# Lenis hijacks wheel scroll inside overlays

The site runs global smooth scroll via `@studio-freight/lenis` (set up in `web/src/hooks/use-smooth-scroll.ts`, mounted in providers). Lenis listens for `wheel`/`touch` on `window` and converts them into page scroll. Inside any fixed overlay (search palette, Radix Dialog/AlertDialog, Select dropdown, fullscreen mobile menu) this means the wheel scrolls the page **behind** the modal instead of the modal's own content.

**Fix:** put `data-lenis-prevent` on the scrollable overlay container. Lenis (v1.0.42) walks the event's `composedPath()` up to its root element and, if any node has `data-lenis-prevent` (or `-touch` / `-wheel` variants), it bails out and lets native scroll happen.

**Why:** confirmed by reading the bundled `lenis.mjs` — the `onVirtualScroll` handler scans `composedPath` for `hasAttribute("data-lenis-prevent")`. There is NO `prevent:` callback option in this version, so the attribute is the supported mechanism.

**How to apply:** any new scrollable modal/overlay/dropdown that renders over the page must carry `data-lenis-prevent` on the element that scrolls (or an ancestor of it within the overlay). Already applied to shared `ui/dialog`, `ui/alert-dialog`, `ui/select` content, the custom `SearchOverlay`, and the mobile menu panel in `SiteHeader`.

## Pitfall: do NOT put data-lenis-prevent on horizontal-only in-page strips
`data-lenis-prevent` stops Lenis for the **whole** wheel event (both axes), so it must only go on elements that have their own **vertical** scroll. Putting it on an in-page horizontal carousel/thumbnail strip (`overflow-x-auto`, no vertical overflow) swallows vertical wheel: the page won't scroll while the pointer is over the strip — feels "stuck". Lenis is vertical-only here, so horizontal strips need NO prevent attr (native horizontal scroll already works, vertical wheel passes to page scroll). Bit us on the homepage doctor thumbnails (`HeroWelcomeSection`).
