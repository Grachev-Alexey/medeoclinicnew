"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Phone, ChevronRight, Clock, Wallet } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { useGo } from "../lib/use-go";
import { directionPath } from "../lib/site";

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type Direction = {
  id: string;
  slug: string;
  label: string;
  accent: string;
  heroImageUrl: string;
  imageUrl: string;
};

type PriceItem = {
  id: string;
  name: string;
  price: string;
};

type Service = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  price: string;
  duration: string;
  imageUrl: string;
  direction: Direction;
  directions?: Direction[];
  priceItems?: PriceItem[];
};

const PRICE_PREVIEW_LIMIT = 24;

type Settings = Record<string, any>;

type Props = {
  slug: string;
  from?: string;
  initialData?: Service;
  initialSettings?: Settings;
};

const DEFAULT_ACCENT = "#005eb8";

export default function ServiceClient({ slug, from, initialData, initialSettings }: Props): JSX.Element | null {
  const go = useGo();
  const { data } = useQuery<Service>({
    queryKey: ["/api/services", slug],
    initialData,
  });
  const { data: settings } = useQuery<Settings>({
    queryKey: ["/api/settings"],
    initialData: initialSettings,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!data) return null;

  const dirs = data.directions ?? (data.direction ? [data.direction] : []);
  const currentDir =
    (from ? dirs.find((d) => d.slug === from) : undefined) || data.direction;
  const accent = currentDir?.accent || DEFAULT_ACCENT;
  const heroImage =
    data.imageUrl || currentDir?.heroImageUrl || currentDir?.imageUrl;
  const phone = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const paragraphs = (data.description || "").split(/\n{2,}/).filter(Boolean);
  const priceItems = data.priceItems || [];
  const priceItemsShown = priceItems.slice(0, PRICE_PREVIEW_LIMIT);
  const priceItemsHidden = priceItems.length - priceItemsShown.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">

        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 100% 0%, ${rgba(accent, 0.1)} 0%, transparent 55%)` }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
            <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
              <button type="button" onClick={() => go("/")} className="transition-colors hover:text-[#0f1c2e]">
                Главная
              </button>
              <ChevronRight className="h-3 w-3" />
              {currentDir?.slug && (
                <>
                  <Link
                    href={directionPath(currentDir.slug)}
                    className="transition-colors hover:text-[#0f1c2e]"
                  >
                    {currentDir.label}
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
              <span className="text-[#0f1c2e]">{data.name}</span>
            </nav>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                {data.direction?.label && (
                  <span
                    className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ backgroundColor: rgba(accent, 0.1), color: accent }}
                  >
                    {currentDir.label}
                  </span>
                )}
                <h1 className="font-heading mt-5 text-3xl leading-[1.1] tracking-tight text-[#0f1c2e] lg:text-5xl">
                  {data.name}
                </h1>
                {data.shortDescription && (
                  <p className="mt-5 max-w-xl text-base font-light leading-relaxed text-[#5a6b78] lg:text-lg">
                    {data.shortDescription}
                  </p>
                )}

                {/* Price / duration */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {data.price && (
                    <div
                      className="flex items-center gap-2 rounded-2xl px-5 py-3"
                      style={{ backgroundColor: rgba(accent, 0.08) }}
                    >
                      <Wallet className="h-4 w-4" style={{ color: accent }} />
                      <span className="text-base font-semibold text-[#0f1c2e]">{data.price}</span>
                    </div>
                  )}
                  {data.duration && (
                    <div className="flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-5 py-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-[#5a6b78]">{data.duration}</span>
                    </div>
                  )}
                </div>

                <div className="mt-7 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#contacts"
                    data-testid="button-service-book"
                    className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                    style={{ backgroundColor: accent }}
                  >
                    Записаться на приём <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={telHref}
                    data-testid="link-service-call"
                    className="inline-flex items-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-all"
                    style={{ borderColor: rgba(accent, 0.3), color: accent }}
                  >
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </div>
              </div>

              {heroImage && (
                <div className="relative overflow-hidden rounded-3xl shadow-lg">
                  <img
                    src={heroImage}
                    alt={data.name}
                    className="h-64 w-full object-cover object-center lg:h-[420px]"
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

        {/* Description */}
        {paragraphs.length > 0 && (
          <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-heading mb-6 text-2xl text-[#0f1c2e] lg:text-3xl">Об услуге</h2>
              <div className="space-y-5">
                {paragraphs.map((p, i) => (
                  <p key={i} className="text-base font-light leading-relaxed text-[#5a6b78] lg:text-lg">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Услуги и цены (из каталога) */}
        {priceItems.length > 0 && (
          <section className="px-4 pb-12 sm:px-6 lg:px-8 lg:pb-16">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">Услуги и цены</h2>
                <Link
                  href="/prices"
                  data-testid="link-service-full-catalog"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all hover:gap-2.5"
                  style={{ color: accent }}
                >
                  Весь прайс-лист <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                {priceItemsShown.map((item, i) => (
                  <div
                    key={item.id}
                    data-testid={`row-price-${item.id}`}
                    className={`flex items-center justify-between gap-3 px-5 py-3.5 ${
                      i % 2 === 1 ? "bg-gray-50/60" : ""
                    }`}
                  >
                    <span className="flex-1 min-w-0 text-sm leading-snug text-[#3f4d59]">{item.name}</span>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-sm font-semibold text-[#0f1c2e]">{item.price}</span>
                      <a
                        href="#contacts"
                        data-testid={`button-book-price-${item.id}`}
                        className="hidden sm:inline-flex shrink-0 items-center rounded-full border px-3 py-1 text-[12px] font-semibold transition-all hover:text-white"
                        style={{ borderColor: `${accent}4d`, color: accent }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = accent;
                          (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.backgroundColor = "";
                          (e.currentTarget as HTMLElement).style.color = accent;
                        }}
                      >
                        Записаться
                      </a>
                    </div>
                  </div>
                ))}
              </div>
              {priceItemsHidden > 0 && (
                <Link
                  href="/prices"
                  data-testid="link-service-more-prices"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#5a6b78] transition-colors hover:text-[#0f1c2e]"
                >
                  И ещё {priceItemsHidden} — смотреть весь прайс-лист
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div
            className="mx-auto max-w-7xl rounded-3xl px-6 py-12 text-center lg:px-12 lg:py-16"
            style={{ backgroundColor: rgba(accent, 0.07) }}
          >
            <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">
              Запишитесь на «{data.name}»
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-light text-[#5a6b78] lg:text-base">
              Оставьте заявку — администратор перезвонит, подберёт врача и удобное время.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contacts"
                data-testid="button-service-cta"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: accent }}
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={telHref}
                className="inline-flex items-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-all"
                style={{ borderColor: rgba(accent, 0.3), color: accent }}
              >
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
