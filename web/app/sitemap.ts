import type { MetadataRoute } from "next";
import { SITE_URL, DIRECTION_LANDINGS } from "./lib/site";
import { apiGet } from "./lib/api";

// Stable per-deployment timestamp (evaluated once at module load) so <lastmod>
// doesn't change on every request and trigger needless recrawls.
const lastModified = new Date();

type Service = { slug: string | null; active?: boolean };
type Direction = { slug: string; active?: boolean; services?: Service[] };
type Promotion = { slug: string | null; active?: boolean };
type Doctor = { slug: string | null; active?: boolean };

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: Array<{ path: string; priority: number }> = [
    { path: "/", priority: 1 },
    { path: "/stomatologiya", priority: 0.9 },
    { path: "/kosmetologiya", priority: 0.9 },
    { path: "/akcii", priority: 0.8 },
    { path: "/vrachi", priority: 0.8 },
    { path: "/prices", priority: 0.8 },
    { path: "/contacts", priority: 0.8 },
    { path: "/patients", priority: 0.7 },
    { path: "/politika-personalnyh-dannyh", priority: 0.3 },
    { path: "/soglasie-na-obrabotku", priority: 0.3 },
    { path: "/cookie", priority: 0.3 },
    { path: "/licenziya", priority: 0.4 },
    { path: "/polzovatelskoe-soglashenie", priority: 0.3 },
  ];

  const [directions, promotions, doctors] = await Promise.all([
    apiGet<Direction[]>("/api/directions").then((d) => d ?? []),
    apiGet<Promotion[]>("/api/promotions").then((p) => p ?? []),
    apiGet<Doctor[]>("/api/doctors").then((d) => d ?? []),
  ]);

  for (const d of directions) {
    if (!DIRECTION_LANDINGS[d.slug]) {
      routes.push({ path: `/napravleniya/${d.slug}`, priority: 0.7 });
    }
    for (const s of d.services ?? []) {
      if (s.active === false || !s.slug) continue;
      routes.push({ path: `/uslugi/${s.slug}`, priority: 0.6 });
    }
  }

  for (const p of promotions) {
    if (p.active === false || !p.slug) continue;
    routes.push({ path: `/akcii/${p.slug}`, priority: 0.6 });
  }

  for (const d of doctors) {
    if (d.active === false || !d.slug) continue;
    routes.push({ path: `/vrachi/${d.slug}`, priority: 0.6 });
  }

  return routes.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  }));
}
