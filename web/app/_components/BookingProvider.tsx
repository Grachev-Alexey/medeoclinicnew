"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

// Виджет онлайн-записи Medflex. Запись обрабатывается на стороне Medflex,
// поэтому собственная форма/БД заявок больше не нужны.
const MEDFLEX_URL =
  "https://booking.medflex.ru?user=86453efd98d0a1b1e7f0d2ad9cbf1ff9&source=3";

const BookingContext = createContext<{ open: () => void } | null>(null);

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Open the booking modal from any "Записаться" CTA across the site. All such
  // CTAs link to `#contacts`, so we intercept those clicks here — capture phase
  // + stopPropagation overrides the legacy scroll-to-contacts behavior, even in
  // reused sections we can't edit.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // Respect browser open-in-new-tab semantics (Cmd/Ctrl/Shift/Alt + click,
      // middle/right click) — don't hijack those.
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const el = e.target as HTMLElement | null;
      const link = el?.closest?.('a[href$="#contacts"]');
      if (link) {
        e.preventDefault();
        e.stopPropagation();
        setOpen(true);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      // Reset the loader so the spinner shows again on the next open (Radix
      // unmounts the iframe on close, so it reloads each time).
      window.setTimeout(() => setLoaded(false), 200);
    }
  };

  return (
    <BookingContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none p-0 sm:h-[88vh] sm:max-h-[780px] sm:w-[480px] sm:max-w-[480px] sm:rounded-2xl">
          <div className="flex h-14 shrink-0 items-center border-b border-gray-100 bg-white px-5">
            <DialogTitle className="text-base font-semibold text-[#0f1c2e]">
              Запись на приём
            </DialogTitle>
            <DialogDescription className="sr-only">
              Онлайн-запись на приём в медицинский центр ММЦ МЕДЕО.
            </DialogDescription>
          </div>
          <div className="relative flex-1 bg-white">
            {!loaded && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-[#005eb8]" />
                <p className="text-sm text-gray-500">Загружаем форму записи…</p>
              </div>
            )}
            <iframe
              src={MEDFLEX_URL}
              title="Онлайн-запись в ММЦ МЕДЕО"
              onLoad={() => setLoaded(true)}
              allow="clipboard-write"
              className="h-full w-full border-0"
              data-testid="iframe-booking"
            />
          </div>
        </DialogContent>
      </Dialog>
    </BookingContext.Provider>
  );
}
