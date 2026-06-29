---
name: Logo & favicon
description: How the brand mark and favicons relate; constraints for regenerating icons.
---

# Brand mark & favicons

- The single source of truth for the brand mark is the `BrandMark` SVG component
  (blue medical cross + three diagonal wave strokes in the lower-left). Header and
  footer both render it; do not re-inline a separate logo SVG.
- The favicon set (`favicon.svg`, `favicon.ico`, `favicon-16/32/48/192/512.png`,
  `apple-touch-icon.png` in `web/public/`) is **rasterized from the same artwork**.
  If the mark changes, regenerate all of them so they stay in sync.

**Regeneration:** use `sharp` to render the SVG → PNG and ImageMagick `convert`
(16+32+48 PNGs → `.ico`). `sharp` lives in the workspace root `node_modules`, so run
the script with `NODE_PATH=/home/runner/workspace/node_modules`, otherwise it fails
with `Cannot find module 'sharp'`.

**Why the favicons have an opaque white rounded background (but the in-page
`BrandMark` is transparent):** a transparent blue cross is nearly invisible on a
dark browser tab strip. Favicons therefore get a white rounded square so the blue
cross reads on any browser theme. The in-page logo stays transparent because it
sits on white surfaces (and white "wave" strokes read as cuts in the cross only
over the blue).
