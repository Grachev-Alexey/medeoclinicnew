"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock, Tag } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";

const ACCENT = "#007d83";

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type Promotion = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  date: string;
  description: string;
  imageUrl: string;
};

type Props = {
  initialData?: Promotion[];
};

export default function PromotionsListClient({ initialData }: Props): JSX.Element {
  const { data: promotions = [] } = useQuery<Promotion[]>({
    queryKey: ["/api/promotions"],
    initialData,
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-white">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at 100% 0%, ${rgba(ACCENT, 0.1)} 0%, transparent 55%)` }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider"
              style={{ backgroundColor: rgba(ACCENT, 0.1), color: ACCENT }}
            >
              <Tag className="h-3 w-3" /> Выгодные предложения
            </span>
            <h1 className="font-heading mt-5 text-3xl leading-[1.1] tracking-tight text-[#0f1c2e] lg:text-5xl">
              Акции и спецпредложения
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-[#5a6b78] lg:text-lg">
              Скидки на обследования, косметологию и комплексные программы клиники «Медео».
              Выберите акцию и запишитесь — администратор расскажет условия и подберёт время.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {promotions.length === 0 ? (
              <p className="text-center text-[#5a6b78]" data-testid="text-promo-empty">
                Сейчас активных акций нет. Загляните позже.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {promotions.map((p) => (
                  <Link
                    key={p.id}
                    href={`/akcii/${p.slug}`}
                    data-testid={`card-promo-${p.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    {p.imageUrl ? (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {p.badge && (
                          <span
                            className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3.5 py-1.5 text-base font-bold shadow-sm backdrop-blur-sm"
                            style={{ color: ACCENT }}
                          >
                            {p.badge}
                          </span>
                        )}
                      </div>
                    ) : (
                      p.badge && (
                        <div className="px-6 pt-6">
                          <span
                            className="inline-flex items-center rounded-full px-4 py-1.5 text-lg font-bold text-white"
                            style={{ backgroundColor: ACCENT }}
                          >
                            {p.badge}
                          </span>
                        </div>
                      )
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {p.date && (
                        <span
                          className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                          style={{ backgroundColor: rgba(ACCENT, 0.08), color: ACCENT }}
                        >
                          <Clock className="h-3 w-3" /> {p.date}
                        </span>
                      )}
                      <h2 className="font-heading text-xl text-[#0f1c2e]">{p.title}</h2>
                      {p.description && (
                        <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[#6b7280]">
                          {p.description}
                        </p>
                      )}
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                        style={{ color: ACCENT }}
                      >
                        Подробнее об акции <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
