"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Phone, Check, Plus, Minus, ChevronRight } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { useGo } from "../lib/use-go";
import { landingBySlug } from "./service-landing-data";

const rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

type Props = {
  slug: string;
  initialSettings?: Record<string, any>;
};

export default function ServiceLandingClient({ slug, initialSettings }: Props): JSX.Element | null {
  const data = landingBySlug[slug];
  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    initialData: initialSettings,
  });
  const go = useGo();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const phone = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!data) return null;

  const { accent, accentDark, accentSoft } = data;

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
            <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-400">
              <button
                type="button"
                onClick={() => go("/")}
                className="transition-colors hover:text-[#0f1c2e]"
                data-testid="link-breadcrumb-home"
              >
                Главная
              </button>
              <ChevronRight className="h-3 w-3" />
              <button
                type="button"
                onClick={() => go("#services")}
                className="transition-colors hover:text-[#0f1c2e]"
                data-testid="link-breadcrumb-services"
              >
                Услуги
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600">{data.breadcrumb}</span>
            </nav>

            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.22em]" style={{ color: accent }}>
                  {data.eyebrow}
                </p>
                <h1 className="font-heading text-3xl leading-[1.08] tracking-tight text-[#0f1c2e] lg:text-5xl">
                  {data.title}
                </h1>
                <p className="mt-5 max-w-xl text-sm font-light leading-relaxed text-[#5a6b78] lg:text-base">
                  {data.subtitle}
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="#contacts"
                    data-testid="button-landing-book"
                    className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                    style={{ backgroundColor: accent }}
                  >
                    Записаться на приём <ArrowRight className="h-4 w-4" />
                  </a>
                  <a
                    href={telHref}
                    data-testid="link-landing-call"
                    className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-all"
                    style={{ borderColor: rgba(accent, 0.3), color: accentDark }}
                  >
                    <Phone className="h-4 w-4" /> {phone}
                  </a>
                </div>
                <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
                  {data.heroHighlights.map((h) => (
                    <li key={h} className="inline-flex items-center gap-2 text-sm text-[#374151]">
                      <Check className="h-4 w-4" style={{ color: accent }} /> {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
                  <img
                    src={data.heroImage}
                    alt={`${data.breadcrumb} в клинике Медео`}
                    className="h-full w-full object-cover"
                    data-testid="img-landing-hero"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {data.stats.map((s) => (
                <div key={s.label} className="text-center lg:text-left" data-testid={`stat-${s.label}`}>
                  <p className="font-heading text-3xl lg:text-4xl" style={{ color: accent }}>
                    {s.value}
                  </p>
                  <p className="mt-1 text-xs font-light text-[#6b7280] lg:text-sm">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">{data.benefitsTitle}</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {data.benefits.map((b) => (
                <div
                  key={b.title}
                  className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                  data-testid={`card-benefit-${b.title}`}
                >
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{ backgroundColor: accentSoft }}
                  >
                    <b.icon className="h-5 w-5" style={{ color: accent }} />
                  </div>
                  <p className="mt-4 text-[15px] font-semibold text-[#0f1c2e]">{b.title}</p>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-[#6b7280]">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services + prices */}
        <section className="py-14 lg:py-20" style={{ backgroundColor: accentSoft }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">{data.servicesTitle}</h2>
            </div>
            <p className="mb-10 max-w-2xl text-sm font-light leading-relaxed text-[#5a6b78] lg:text-base">
              {data.servicesIntro}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.services.map((s) => (
                <div
                  key={s.name}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white bg-white p-5 shadow-sm"
                  data-testid={`card-service-${s.name}`}
                >
                  <div>
                    <p className="text-[15px] font-semibold text-[#0f1c2e]">{s.name}</p>
                    <p className="mt-1 text-sm font-light leading-relaxed text-[#6b7280]">{s.description}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold"
                    style={{ backgroundColor: accentSoft, color: accentDark }}
                  >
                    {s.price}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <a
                href="#contacts"
                data-testid="button-services-book"
                className="inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: accent }}
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={() => go("/prices")}
                data-testid="button-services-prices"
                className="inline-flex items-center justify-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-all"
                style={{ borderColor: rgba(accent, 0.3), color: accentDark }}
              >
                Все цены <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Process steps */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">{data.stepsTitle}</h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {data.steps.map((step, i) => (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  data-testid={`card-step-${i + 1}`}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full font-heading text-lg font-semibold text-white"
                    style={{ backgroundColor: accent }}
                  >
                    {i + 1}
                  </span>
                  <p className="mt-4 text-[15px] font-semibold text-[#0f1c2e]">{step.title}</p>
                  <p className="mt-1.5 text-sm font-light leading-relaxed text-[#6b7280]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About */}
        <section className="py-14 lg:py-20" style={{ backgroundColor: accentSoft }}>
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/5">
                <img
                  src={data.aboutImage}
                  alt={`О направлении ${data.breadcrumb}`}
                  className="h-full w-full object-cover"
                  data-testid="img-landing-about"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-5 flex items-center gap-3">
                <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
                <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">{data.aboutTitle}</h2>
              </div>
              <div className="flex flex-col gap-4">
                {data.aboutText.map((p, i) => (
                  <p key={i} className="text-sm font-light leading-relaxed text-[#5a6b78] lg:text-base">
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 flex items-center gap-3">
              <span className="h-6 w-1 rounded-full" style={{ backgroundColor: accent }} />
              <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">{data.faqTitle}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {data.faq.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={item.q}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
                    data-testid={`faq-item-${i}`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      data-testid={`faq-toggle-${i}`}
                    >
                      <span className="text-[15px] font-medium text-[#0f1c2e]">{item.q}</span>
                      {isOpen ? (
                        <Minus className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      ) : (
                        <Plus className="h-4 w-4 shrink-0" style={{ color: accent }} />
                      )}
                    </button>
                    {isOpen && (
                      <p className="px-5 pb-5 text-sm font-light leading-relaxed text-[#6b7280]">{item.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div
            className="mx-auto max-w-7xl rounded-3xl px-6 py-12 text-center lg:px-12 lg:py-16"
            style={{ backgroundColor: accentSoft }}
          >
            <h2 className="font-heading text-2xl text-[#0f1c2e] lg:text-3xl">Запишитесь на приём</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-light text-[#5a6b78] lg:text-base">
              Оставьте заявку — администратор перезвонит, подберёт врача и удобное время. Мы ответим на все ваши вопросы.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="#contacts"
                data-testid="button-cta-book"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-lg"
                style={{ backgroundColor: accent }}
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={telHref}
                data-testid="link-cta-call"
                className="inline-flex items-center gap-2 rounded-full border bg-white px-7 py-3.5 text-sm font-semibold transition-all"
                style={{ borderColor: rgba(accent, 0.3), color: accentDark }}
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
