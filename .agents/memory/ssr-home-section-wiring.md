---
name: SSR home-section wiring
description: The cross-file chain to add a new DB-backed section to the home page so its content is in SSR HTML.
---

Adding a new DB-backed block to the home page (`web/app/page.tsx`) means keeping FOUR places in sync, or the content renders client-only (empty in SSR HTML, bad for SEO):

1. `web/app/page.tsx` — add `apiGet<any[]>("/api/<path>")` to the `Promise.all` and pass `initial<X>` prop to `<HomeClient>`.
2. `web/app/_components/HomeClient.tsx` — add the prop to the type + destructure + a `{ queryKey: ["/api/<path>"], initialData: initial<X> }` entry in the `useQueries` seeding array.
3. The section component — read it with `useQuery({ queryKey: ["/api/<path>"] })` using the SAME key string. Default fetcher is already configured; don't supply queryFn.

**Why:** HomeClient runs first and seeds the shared React Query cache during SSR, so nested sections reading the same key get data into the initial HTML. A mismatched/missing key = client-only fetch.

**How to apply:** whenever you wire a new `registerCrud` entity into the landing page. Server side is the usual chain: `shared/schema.ts` table+insertSchema → `server/storage.ts` IStorage+DbStorage methods → `server/routes.ts` `registerCrud({path,...})` → `script/seed.ts`. Admin editing: add a config block in `web/src/reused-pages/admin/entityConfigs.tsx`, a thin `web/app/admin/(panel)/<path>/page.tsx` using `CrudManager`, and a nav item in `AdminShell.tsx`. New tables: create via raw `CREATE TABLE` SQL (drizzle-kit push hangs here) and replay on the prod VPS.
