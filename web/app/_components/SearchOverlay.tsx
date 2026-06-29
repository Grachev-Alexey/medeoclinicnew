"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  X,
  CornerDownLeft,
  Stethoscope,
  HeartPulse,
  Wallet,
  UserRound,
  Lightbulb,
  Tag,
  Star,
  type LucideIcon,
} from "lucide-react";
import {
  searchEntries,
  groupResults,
  type SearchEntry,
  type SearchResult,
} from "@/lib/search";
import { scrollToWhenReady } from "@/hooks/use-smooth-scroll";

const OPEN_EVENT = "medeo:open-search";

const iconByType: Record<string, LucideIcon> = {
  direction: Stethoscope,
  service: HeartPulse,
  price: Wallet,
  doctor: UserRound,
  myth: Lightbulb,
  promotion: Tag,
  review: Star,
};

export function openSearch() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function SearchOverlay(): JSX.Element | null {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: entries = [] } = useQuery<SearchEntry[]>({
    queryKey: ["/api/search-index"],
    staleTime: Infinity,
    enabled: open,
  });

  const results = useMemo(
    () => searchEntries(query, entries, 24),
    [query, entries],
  );
  const grouped = useMemo(() => groupResults(results), [results]);
  const flat = useMemo(() => grouped.flatMap((g) => g.items), [grouped]);

  // Open via custom event + Cmd/Ctrl+K.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = window.setTimeout(() => inputRef.current?.focus(), 30);
      return () => {
        window.clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const navigate = (url: string) => {
    close();
    const hashIdx = url.indexOf("#");
    if (url.startsWith("/#") || url.startsWith("#")) {
      const hash = url.slice(hashIdx);
      router.push("/");
      scrollToWhenReady(hash, -80);
      return;
    }
    if (hashIdx > 0) {
      const path = url.slice(0, hashIdx);
      const hash = url.slice(hashIdx);
      router.push(path);
      scrollToWhenReady(hash, -80);
      return;
    }
    router.push(url);
    window.scrollTo(0, 0);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(flat.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[active];
      if (hit) navigate(hit.url);
    }
  };

  if (!open) return null;

  let runningIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Поиск по сайту"
      data-lenis-prevent
    >
      <div
        className="absolute inset-0 bg-[#0f1c2e]/40 backdrop-blur-sm"
        onClick={close}
        data-testid="search-backdrop"
      />
      <div
        className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onKeyDown={onKeyDown}
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-5">
          <Search className="h-5 w-5 shrink-0 text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск услуг, врачей, цен…"
            data-testid="input-search"
            className="h-14 flex-1 bg-transparent text-base text-[#0f1c2e] outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть поиск"
            data-testid="button-search-close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#0f1c2e]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto py-2">
          {query.trim() === "" ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400">
              Начните вводить запрос — найдём направления, услуги, цены и врачей.
            </p>
          ) : flat.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-gray-400" data-testid="text-search-empty">
              Ничего не найдено по запросу «{query}».
            </p>
          ) : (
            grouped.map((g) => (
              <div key={g.group} className="mb-1">
                <p className="px-5 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  {g.group}
                </p>
                {g.items.map((item) => {
                  runningIndex += 1;
                  const idx = runningIndex;
                  const isActive = idx === active;
                  const Icon = iconByType[item.type] ?? Search;
                  return (
                    <button
                      key={`${item.url}-${item.title}-${idx}`}
                      type="button"
                      onClick={() => navigate(item.url)}
                      onMouseEnter={() => setActive(idx)}
                      data-testid={`search-result-${idx}`}
                      className={`flex w-full items-center gap-3 px-5 py-2.5 text-left transition-colors ${
                        isActive ? "bg-[#005eb8]/8" : "hover:bg-gray-50"
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isActive ? "bg-[#005eb8] text-white" : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-[#0f1c2e]">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-gray-400">
                            {item.subtitle}
                          </span>
                        )}
                      </span>
                      {isActive && (
                        <CornerDownLeft className="h-4 w-4 shrink-0 text-[#005eb8]" />
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-2.5 text-[11px] text-gray-400">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-gray-200 px-1.5 py-0.5">↑</kbd>
            <kbd className="rounded border border-gray-200 px-1.5 py-0.5">↓</kbd>
            навигация
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded border border-gray-200 px-1.5 py-0.5">Enter</kbd>
            открыть
            <kbd className="ml-2 rounded border border-gray-200 px-1.5 py-0.5">Esc</kbd>
            закрыть
          </span>
        </div>
      </div>
    </div>
  );
}
