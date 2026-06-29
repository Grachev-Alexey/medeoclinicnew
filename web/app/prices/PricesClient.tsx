"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Phone, ChevronRight, Search, X } from "lucide-react";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteMobileNav } from "../_components/SiteMobileNav";
import { scrollTo } from "@/hooks/use-smooth-scroll";
import { useGo } from "../lib/use-go";

export type PriceItem = {
  id: string;
  categoryId: string;
  name: string;
  price: string;
  note: string;
  sortOrder: number;
};
export type PriceCategory = {
  id: string;
  name: string;
  sortOrder: number;
  items: PriceItem[];
};

type PricesClientProps = {
  initialPrices?: PriceCategory[];
  initialSettings?: Record<string, any>;
};

export default function PricesClient({
  initialPrices,
  initialSettings,
}: PricesClientProps): JSX.Element {
  const { data: categories = [], isLoading } = useQuery<PriceCategory[]>({
    queryKey: ["/api/prices"],
    initialData: initialPrices,
  });
  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    initialData: initialSettings,
  });
  const go = useGo();
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const phone: string = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  const q = search.trim().toLowerCase();
  const filtered = useMemo<PriceCategory[]>(() => {
    if (!q) return categories;
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter(
          (it) =>
            it.name.toLowerCase().includes(q) ||
            it.price.toLowerCase().includes(q) ||
            cat.name.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, q]);
  const foundCount = filtered.reduce((sum, cat) => sum + cat.items.length, 0);

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/^#item-(.+)$/);
    if (!match) {
      window.scrollTo(0, 0);
      return;
    }
    const id = match[1];
    setHighlightId(id);
    let frames = 0;
    let raf = 0;
    const tryScroll = () => {
      const el = document.getElementById(`item-${id}`);
      if (el) {
        scrollTo(el as HTMLElement, -110);
        return;
      }
      if (frames++ < 60) raf = requestAnimationFrame(tryScroll);
    };
    raf = requestAnimationFrame(tryScroll);
    const timer = window.setTimeout(() => setHighlightId(null), 2600);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (q) return;
    const els = categories
      .map((c) => document.getElementById(`cat-${c.id}`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) {
          setActiveCat(visible[0].target.id.replace("cat-", ""));
        }
      },
      { rootMargin: "-120px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [categories, q]);

  useEffect(() => {
    if (!activeCat) return;
    const chip = document.querySelector(`[data-testid="chip-category-${activeCat}"]`);
    chip?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeCat]);

  const goCategory = (id: string) => {
    setActiveCat(id);
    const el = document.getElementById(`cat-${id}`);
    if (el) scrollTo(el as HTMLElement, -96);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">

        {/* Hero */}
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400 mb-6">
              <button
                type="button"
                onClick={() => go("/")}
                className="hover:text-[#005eb8] transition-colors"
                data-testid="link-breadcrumb-home"
              >
                Главная
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600">Цены</span>
            </nav>
            <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
              Прайс-лист
            </p>
            <h1 className="font-heading text-3xl lg:text-5xl text-[#0f1c2e] leading-[1.1] tracking-tight">
              Цены на услуги
            </h1>
            <p className="mt-4 max-w-2xl text-[#6b7280] text-sm lg:text-base font-light leading-relaxed">
              Прозрачные цены без скрытых платежей. Вы всегда знаете стоимость приёма и
              процедур заранее. Стоимость указана в рублях и не является публичной офертой —
              точную сумму уточняйте у администратора.
            </p>

            <div className="relative mt-7 max-w-xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найдите услугу — например, «УЗИ» или «приём»"
                data-testid="input-prices-search"
                className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-12 pr-11 text-sm text-[#1a2535] shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-[#005eb8] focus:ring-2 focus:ring-[#005eb8]/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  data-testid="button-clear-search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Очистить поиск"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {q && (
              <p className="mt-3 text-sm text-[#6b7280]" data-testid="text-search-result-count">
                {foundCount > 0 ? `Найдено услуг: ${foundCount}` : "Ничего не найдено"}
              </p>
            )}
          </div>
        </section>

        {/* Category chips */}
        {!isLoading && categories.length > 0 && !q && (
          <div className="sticky top-14 z-30 bg-gray-50/90 backdrop-blur-md border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => goCategory(cat.id)}
                    data-testid={`chip-category-${cat.id}`}
                    className={`shrink-0 rounded-full px-4 py-2 text-[13px] font-medium transition-all whitespace-nowrap ${
                      activeCat === cat.id
                        ? "bg-[#005eb8] text-white shadow-sm"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#005eb8] hover:text-[#005eb8]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

          {isLoading && (
            <div className="space-y-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 animate-pulse">
                  <div className="h-5 w-40 bg-gray-100 rounded mb-5" />
                  <div className="space-y-3">
                    {[0, 1, 2].map((j) => (
                      <div key={j} className="flex justify-between">
                        <div className="h-4 w-60 bg-gray-100 rounded" />
                        <div className="h-4 w-16 bg-gray-100 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && categories.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <p className="text-gray-500" data-testid="text-prices-empty">
                Прайс-лист скоро появится. Позвоните нам, чтобы узнать стоимость услуг.
              </p>
            </div>
          )}

          {!isLoading && categories.length > 0 && q && filtered.length === 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
              <p className="text-gray-500" data-testid="text-search-empty">
                По запросу «{search.trim()}» ничего не найдено. Попробуйте другое слово или
                позвоните нам — поможем подобрать услугу.
              </p>
            </div>
          )}

          <div className={!q && categories.length > 0 ? "lg:grid lg:grid-cols-[252px_minmax(0,1fr)] lg:gap-10 lg:items-start" : ""}>
            {!q && categories.length > 0 && (
              <aside className="hidden lg:block lg:sticky lg:top-28 self-start">
                <p className="px-3 mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Разделы
                </p>
                <nav className="flex flex-col gap-0.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => goCategory(cat.id)}
                      data-testid={`toc-category-${cat.id}`}
                      className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                        activeCat === cat.id
                          ? "bg-[#e8f1fc] font-semibold text-[#005eb8]"
                          : "text-gray-600 hover:bg-gray-100 hover:text-[#0f1c2e]"
                      }`}
                    >
                      <span
                        className={`h-4 w-1 shrink-0 rounded-full transition-colors ${
                          activeCat === cat.id ? "bg-[#005eb8]" : "bg-transparent"
                        }`}
                      />
                      <span className="flex-1 leading-tight">{cat.name}</span>
                      <span className="shrink-0 text-xs text-gray-400">{cat.items.length}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-6 rounded-2xl border border-[#005eb8]/15 bg-[#f2f8fe] p-5">
                  <p className="text-sm font-semibold text-[#0f1c2e]">Нужна помощь с выбором?</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#6b7280]">
                    Администратор подскажет цену и подберёт врача.
                  </p>
                  <a
                    href={telHref}
                    data-testid="link-toc-phone"
                    className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#005eb8] transition-colors hover:text-[#004a93]"
                  >
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </div>
              </aside>
            )}
            <div className="min-w-0">
          <div className="grid gap-6 lg:gap-8">
            {filtered.map((cat) => (
              <section
                key={cat.id}
                id={`cat-${cat.id}`}
                className="scroll-mt-28"
                data-testid={`section-category-${cat.id}`}
              >
                <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center gap-3 px-5 sm:px-7 py-5 border-b border-gray-100">
                    <span className="h-6 w-1 shrink-0 rounded-full bg-[#005eb8]" />
                    <h2 className="font-heading text-xl lg:text-2xl text-[#0f1c2e]">{cat.name}</h2>
                    <span className="ml-auto text-xs text-gray-400">
                      {cat.items.length} {cat.items.length === 1 ? "услуга" : "услуг"}
                    </span>
                  </div>
                  <ul>
                    {cat.items.map((item) => (
                      <li
                        key={item.id}
                        id={`item-${item.id}`}
                        data-testid={`row-price-${item.id}`}
                        className={`flex items-baseline justify-between gap-4 px-5 sm:px-7 py-4 border-b border-gray-50 last:border-0 transition-colors scroll-mt-28 ${
                          highlightId === item.id
                            ? "bg-[#e8f1fc] ring-2 ring-inset ring-[#005eb8]/40"
                            : "hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-[14px] sm:text-[15px] text-[#1a2535]">{item.name}</p>
                          {item.note && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.note}</p>
                          )}
                        </div>
                        <div className="text-[14px] sm:text-[15px] font-semibold text-[#005eb8] whitespace-nowrap">
                          {item.price}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-3xl bg-[#e8f1fc] px-6 py-10 lg:px-12 lg:py-14 text-center">
            <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e]">
              Не нашли нужную услугу?
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-[#5a6b78] text-sm lg:text-base font-light">
              Запишитесь на приём или позвоните нам — администратор подберёт врача и
              подскажет точную стоимость.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go("#contacts")}
                data-testid="button-prices-book"
                className="inline-flex items-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93] hover:shadow-lg"
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={telHref}
                data-testid="link-prices-phone"
                className="inline-flex items-center gap-2 rounded-full border border-[#005eb8]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#005eb8] transition-all hover:border-[#005eb8]"
              >
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
