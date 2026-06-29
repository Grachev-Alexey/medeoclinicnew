"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronRight, Clock, ChevronLeft, Search, X } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { useGo } from "../lib/use-go";
import { normalize } from "@/lib/search";

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type Service = {
  id: string;
  slug: string | null;
  name: string;
  shortDescription: string;
  price: string;
  duration: string;
};

type PriceItem = { id: string; name: string; price: string; note: string };
type PriceGroup = { id: string; name: string; items: PriceItem[] };

type Direction = {
  id: string;
  slug: string;
  label: string;
  accent: string;
  heroTitle: string;
  intro: string;
  description: string;
  heroImageUrl: string;
  imageUrl: string;
  body: string;
  stat: string;
  statLabel: string;
  services: Service[];
  priceGroups: PriceGroup[];
};

type Props = {
  slug: string;
  initialData?: Direction;
};

const DEFAULT_ACCENT = "#005eb8";

export default function DirectionClient({ slug, initialData }: Props): JSX.Element | null {
  const go = useGo();
  const [query, setQuery] = useState("");
  const [procQuery, setProcQuery] = useState("");
  const { data } = useQuery<Direction>({
    queryKey: ["/api/directions", slug],
    initialData,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const accent = data?.accent || DEFAULT_ACCENT;
  const allServices = useMemo(
    () => (data?.services ?? []).filter((s) => s.slug),
    [data],
  );

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return allServices;
    const tokens = q.split(" ").filter(Boolean);
    return allServices.filter((s) => {
      const hay = normalize(`${s.name} ${s.shortDescription}`);
      return tokens.every((t) => hay.includes(t));
    });
  }, [allServices, query]);

  const priceGroups = useMemo(() => data?.priceGroups ?? [], [data]);
  const filteredGroups = useMemo(() => {
    const q = normalize(procQuery);
    if (!q) return priceGroups;
    const tokens = q.split(" ").filter(Boolean);
    return priceGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => {
          const hay = normalize(`${it.name} ${it.price} ${it.note} ${g.name}`);
          return tokens.every((t) => hay.includes(t));
        }),
      }))
      .filter((g) => g.items.length > 0);
  }, [priceGroups, procQuery]);
  const procCount = filteredGroups.reduce((n, g) => n + g.items.length, 0);
  const totalProcs = priceGroups.reduce((n, g) => n + g.items.length, 0);

  if (!data) return null;

  const heroImage = data.heroImageUrl || data.imageUrl;
  const bodyParagraphs = (data.body || "").split(/\n{2,}/).filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">

        {/* Hero — compact */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 100% 0%, ${rgba(accent, 0.1)} 0%, transparent 55%)` }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <nav className="mb-5 flex items-center gap-1.5 text-xs text-gray-400">
              <button
                type="button"
                onClick={() => go("/")}
                className="transition-colors hover:text-[#0f1c2e]"
              >
                Главная
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-[#0f1c2e]">{data.label}</span>
            </nav>

            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <span
                  className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: rgba(accent, 0.1), color: accent }}
                >
                  {data.label}
                </span>
                <h1 className="font-heading mt-4 text-3xl leading-[1.1] tracking-tight text-[#0f1c2e] lg:text-[2.75rem]">
                  {data.heroTitle || data.label}
                </h1>
                <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-[#5a6b78]">
                  {data.intro || data.description}
                </p>
                {data.stat && (
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#0f1c2e]" style={{ fontFamily: "'Jost', sans-serif" }}>
                      {data.stat}
                    </span>
                    <span className="text-sm font-light text-[#6b7280]">{data.statLabel}</span>
                  </div>
                )}
              </div>

              {heroImage && (
                <div className="relative overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src={heroImage}
                    alt={data.label}
                    className="h-56 w-full object-cover object-center lg:h-[340px]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(160deg, transparent 50%, ${rgba(accent, 0.35)} 100%)` }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Services — front and center, with on-page search */}
        {allServices.length > 0 && (
        <section className="px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">
                  Услуги направления
                </h2>
                <p className="mt-2 text-sm font-light text-[#6b7280]">
                  Выберите услугу или найдите нужную через поиск
                </p>
              </div>

              {/* On-page search / filter */}
              <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск услуги…"
                  data-testid="input-direction-search"
                  className="w-full rounded-full border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-[#0f1c2e] shadow-sm outline-none transition-all placeholder:text-gray-400 focus:border-transparent"
                  style={{ boxShadow: `0 0 0 0 ${rgba(accent, 0)}` }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px ${rgba(accent, 0.2)}`)}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)")}
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    data-testid="button-direction-search-clear"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Очистить"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {query && (
              <p className="mt-4 text-xs text-gray-400" data-testid="text-direction-search-count">
                Найдено: {filtered.length}
              </p>
            )}

            {filtered.length > 0 ? (
              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((s) => (
                  <Link
                    key={s.id}
                    href={`/uslugi/${s.slug}?from=${slug}`}
                    data-testid={`card-service-${s.slug}`}
                    className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <h3 className="font-heading text-lg text-[#0f1c2e]">
                      {s.name}
                    </h3>
                    {s.shortDescription && (
                      <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[#6b7280]">
                        {s.shortDescription}
                      </p>
                    )}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                      <div>
                        {s.price && (
                          <p className="text-sm font-semibold text-[#0f1c2e]">{s.price}</p>
                        )}
                        {s.duration && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {s.duration}
                          </p>
                        )}
                      </div>
                      <span
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full transition-all group-hover:translate-x-0.5"
                        style={{ backgroundColor: rgba(accent, 0.1), color: accent }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div
                className="mt-7 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
                data-testid="text-direction-search-empty"
              >
                <p className="text-sm text-[#5a6b78]">
                  По запросу «{query}» ничего не найдено.
                </p>
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-3 text-sm font-semibold transition-colors hover:underline"
                  style={{ color: accent }}
                >
                  Показать все услуги
                </button>
              </div>
            )}
          </div>
        </section>
        )}

        {/* All concrete procedures with prices + on-page search */}
        {totalProcs > 0 && (
          <section className="border-t border-gray-100 bg-white px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-7xl">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">
                    Все процедуры и цены
                  </h2>
                  <p className="mt-2 text-sm font-light text-[#6b7280]">
                    Найдите конкретную процедуру и узнайте её стоимость
                  </p>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={procQuery}
                    onChange={(e) => setProcQuery(e.target.value)}
                    placeholder="Поиск процедуры или цены…"
                    data-testid="input-direction-procedures-search"
                    className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-10 text-sm text-[#1a2535] outline-none transition-colors focus:border-gray-300 focus:ring-2 focus:ring-gray-100"
                  />
                  {procQuery && (
                    <button
                      type="button"
                      onClick={() => setProcQuery("")}
                      aria-label="Очистить поиск"
                      data-testid="button-clear-procedures-search"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {procQuery && (
                <p className="mt-3 text-sm text-[#6b7280]" data-testid="text-procedures-count">
                  Найдено: {procCount}
                </p>
              )}

              {filteredGroups.length > 0 ? (
                <div className="mt-7 grid gap-6">
                  {filteredGroups.map((g) => (
                    <div
                      key={g.id}
                      data-testid={`group-direction-prices-${g.id}`}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white"
                      style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-5 sm:px-7">
                        <span
                          className="h-6 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: accent }}
                        />
                        <h3 className="font-heading text-lg text-[#0f1c2e] lg:text-xl">
                          {g.name}
                        </h3>
                        <span className="ml-auto text-xs text-gray-400">
                          {g.items.length}
                        </span>
                      </div>
                      <ul>
                        {g.items.map((it) => (
                          <li
                            key={it.id}
                            data-testid={`row-direction-price-${it.id}`}
                            className="flex items-baseline justify-between gap-4 border-b border-gray-50 px-5 py-4 transition-colors last:border-0 hover:bg-gray-50/70 sm:px-7"
                          >
                            <div className="min-w-0">
                              <p className="text-[14px] text-[#1a2535] sm:text-[15px]">
                                {it.name}
                              </p>
                              {it.note && (
                                <p className="mt-0.5 text-xs text-gray-400">{it.note}</p>
                              )}
                            </div>
                            <div
                              className="whitespace-nowrap text-[14px] font-semibold sm:text-[15px]"
                              style={{ color: accent }}
                            >
                              {it.price}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className="mt-7 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center"
                  data-testid="text-direction-procedures-empty"
                >
                  <p className="text-sm text-[#5a6b78]">
                    По запросу «{procQuery}» ничего не найдено.
                  </p>
                  <button
                    type="button"
                    onClick={() => setProcQuery("")}
                    className="mt-3 text-sm font-semibold transition-colors hover:underline"
                    style={{ color: accent }}
                  >
                    Показать все процедуры
                  </button>
                </div>
              )}

              <div className="mt-6">
                <Link
                  href="/prices"
                  data-testid="link-direction-all-prices"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: accent }}
                >
                  Весь прайс-лист <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Supporting text */}
        {bodyParagraphs.length > 0 && (
          <section className="border-t border-gray-100 bg-white px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
            <div className="mx-auto max-w-3xl space-y-5">
              <h2 className="font-heading text-xl text-[#0f1c2e] lg:text-2xl">
                О направлении
              </h2>
              {bodyParagraphs.map((p, i) => (
                <p key={i} className="text-base font-light leading-relaxed text-[#5a6b78]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:pb-16">
          <div
            className="mx-auto max-w-7xl rounded-3xl px-6 py-12 text-center lg:px-12 lg:py-16"
            style={{ backgroundColor: rgba(accent, 0.07) }}
          >
            <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">Запишитесь на приём</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-light text-[#5a6b78] lg:text-base">
              Оставьте заявку — администратор перезвонит, подберёт врача и удобное время.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contacts"
                data-testid="button-direction-cta"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: accent }}
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => go("/")}
                className="inline-flex items-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold text-[#0f1c2e] transition-all hover:bg-gray-50"
                style={{ borderColor: rgba(accent, 0.3) }}
              >
                <ChevronLeft className="h-4 w-4" /> На главную
              </button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
