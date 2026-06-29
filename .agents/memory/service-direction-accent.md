---
name: Service page current-direction accent
description: How a shared service page picks which direction's accent/breadcrumb to show when it belongs to several directions
---

A service can be linked to many directions (join table). Its public page
(`/uslugi/<slug>`) must render the accent + breadcrumb of the direction the user
came *from*, not a fixed primary one.

**Mechanism:** links into a service carry `?from=<directionSlug>` (set in the
direction page grid and the header mega-menu). The service page reads `from`
**server-side** via the page's `searchParams` prop and passes it as a prop into
the client component, which matches it against the `directions[]` the API
returns (falling back to the API's `direction`, i.e. first linked).

**Why:** never use `useSearchParams` on SEO/content pages here — it forces a
client-render bailout and breaks SSR (same reason YandexMetrika avoids it). Read
query params in the server page component and thread them down.

**How to apply:** canonical breadcrumb JSON-LD stays on the primary direction
for SEO stability; only the visible UI accent/breadcrumb follow `?from=`.
