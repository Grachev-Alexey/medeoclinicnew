"use client";

import type { ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./lib/get-query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";
import { BookingProvider } from "./_components/BookingProvider";
import { SearchOverlay } from "./_components/SearchOverlay";

export function Providers({ children }: { children: ReactNode }) {
  useSmoothScroll();
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BookingProvider>{children}</BookingProvider>
        <SearchOverlay />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
