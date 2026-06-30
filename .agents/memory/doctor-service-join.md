---
name: Doctor-service join table
description: How doctor↔service many-to-many works — schema, routes, admin, seed, and prod migration.
---

## Rule
`doctor_services` table (PK: doctor_id + service_id) holds the M2M relation. `serviceIds` is NOT a column on the `doctors` table — it is synthesised from the join table.

**Why:** consistent with existing `service_directions` / `service_price_items` patterns; avoids array-in-column denormalisation.

## How to apply
- **Schema** (`shared/schema.ts`): `doctorServices` table with `.references(() => doctors.id, { onDelete: "cascade" })` and `primaryKey`.
- **Storage** (`server/storage.ts`): `getDoctorServices(doctorId)`, `setDoctorServices(doctorId, ids[])`, `listAllDoctorServiceLinks()` (used for bulk enrichment of doctor lists).
- **Routes** (`server/routes.ts`): doctor CRUD is NOT registered via `registerCrud()` — it is custom. PATCH/POST extract `serviceIds` from body, call `setDoctorServices` after `updateDoctor`/`createDoctor`. `GET /api/admin/doctors` enriches all doctors with `serviceIds` in one pass (avoids N+1). `GET /api/doctors/:slug` returns `services: Service[]` (full objects, not just IDs).
- **Admin** (`entityConfigs.tsx`): `serviceIds` multiselect field pointing to `/api/admin/services`; CrudManager sends it as part of the PATCH body — server strips it before Zod validation of the doctor schema.
- **Seed** (`script/seed.ts`): doctor-service links seeded by doctor slug → service slugs map; idempotent (skips if any links exist).
- **Prod migration**: `deploy/sql/2026-06-doctor-services.sql` — idempotent `CREATE TABLE IF NOT EXISTS`.
