---
name: Light palette rule (Medeo site)
description: What counts as a forbidden "dark card" on the Medeo medical site
---

The user's light-palette preference forbids dark cards/sections, and this extends
beyond the dark navy (#0f1c2e). A card fully filled with saturated brand teal
(#007d83) + white text also reads as a "dark card" and was rejected in review.

**Why:** code review flagged a teal-gradient featured card (white text) as a
palette violation even though it wasn't navy.

**How to apply:** For feature/highlight cards use a LIGHT surface (e.g. gradient
from-[#f3fbfb] via-white to-[#eaf6f6], ring-[#007d83]/12) with teal text/accents
and a small solid-teal icon chip. Solid teal is fine only for small accents
(icon chips, the "Записаться" button), never as a large card/section fill.
Dark navy stays ONLY in the header and mobile full-screen menu.

## The rule is about BACKGROUNDS/surfaces, NOT text color
`text-[#0f1c2e]` is the site's STANDARD heading text color — used in 30+ files
(LegalPage, HeroWelcome, ServiceLanding, every content page). It is NOT a palette
violation. Only `bg-[#0f1c2e]` (a dark navy *fill*) is restricted, and it legitimately
appears only in exempt contexts: header, mobile menu, the full-screen SearchOverlay
scrim, and the admin panel/login. A `from-[#007d83] to-[#0f1c2e]` gradient on
`bg-clip-text` (colored text, no background) is also fine.
**Why:** code review repeatedly false-flags `text-[#0f1c2e]` as a "dark" violation;
it conflates text color with background. Don't lighten heading text to "fix" this —
that makes the page inconsistent with the rest of the site.
