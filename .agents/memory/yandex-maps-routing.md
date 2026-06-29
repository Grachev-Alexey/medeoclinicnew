---
name: Yandex Maps routing & coordinate order
description: How to build correct Yandex routes/links for the clinic; coordinate-order gotcha and iOS text-address failure.
---

## Build routes with exact coordinates, never the text address
**Why:** the clinic's "Построить маршрут" links previously used `rtext=~{textAddress}`. Yandex geocodes text imprecisely, and on **iOS the Yandex Maps app cannot parse a text address** — the route silently fails to build. Coordinates always work.
**How to apply:** route URL = `https://yandex.ru/maps/?mode=routes&rtext=~{LAT}%2C{LON}&rtt=auto`. "Открыть в картах" → org card `https://yandex.ru/maps/org/medeo/226407459658/`. Clinic coords: 55.606157, 37.659218.

## Yandex coordinate order is inconsistent between params
**Why:** a constant source of silent map bugs.
**How to apply:**
- `rtext` (route points): **latitude,longitude** → `55.606157,37.659218`
- `ll` and `pt` (map-widget center / pin): **longitude,latitude** → `37.659218,55.606157`
Map/route UI lives in `ClinicContactsSection.tsx` (homepage) and `contacts/ContactsClient.tsx` — keep both in sync (coords duplicated as local consts in each).
