"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

/**
 * The admin panel is client-only (auth-gated, never SSRs data) and reuses the
 * legacy Vite managers verbatim. Those managers call
 * `queryClient.invalidateQueries(...)` on the singleton exported from
 * `@/lib/queryClient`. To keep reads (`useQuery`) and invalidations on the SAME
 * cache, admin overrides the QueryClient context with that very singleton —
 * nested inside the root Providers, so only /admin/* is affected while public
 * SSR pages keep their per-request client from getQueryClient().
 */
export function AdminProviders({ children }: { children: ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
