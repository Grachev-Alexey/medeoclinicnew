import { QueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

/**
 * Mirrors the shared query client's default options (see @/lib/queryClient)
 * so reused sections behave identically, but creates a FRESH client per server
 * request. A module-level singleton on a long-lived server (PM2) would be shared
 * across requests/users — with staleTime: Infinity that means initialData gets
 * ignored after the first request and SSR serves stale data. Per-request on the
 * server + a singleton in the browser is the correct App Router pattern.
 */
function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        queryFn: getQueryFn({ on401: "throw" }),
        refetchInterval: false,
        refetchOnWindowFocus: false,
        staleTime: Infinity,
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server: always a brand-new client so requests never share cache.
    return makeQueryClient();
  }
  // Browser: keep a single client for the lifetime of the tab.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
