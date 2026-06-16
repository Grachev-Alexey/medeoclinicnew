const API_BASE = `http://127.0.0.1:${process.env.API_PORT || "3001"}`;

/**
 * Server-side fetch from the internal Express API.
 * Used inside server components (page.tsx) so the data is rendered into the
 * initial HTML for SEO. `no-store` keeps each request fresh (admin-editable data)
 * and forces dynamic rendering. Returns undefined on failure so the client
 * component can fall back to its own useQuery fetch.
 */
export async function apiGet<T>(path: string): Promise<T | undefined> {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return undefined;
    return (await res.json()) as T;
  } catch {
    return undefined;
  }
}
