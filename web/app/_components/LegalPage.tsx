"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  CalendarClock,
  Phone,
  MapPin,
  BadgeCheck,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalVars = {
  operator: string;
  license: string;
  address: string;
  phone: string;
  site: string;
};

export type LegalPageProps = {
  title: string;
  lead: string;
  updated: string;
  sections: LegalSection[];
  vars: LegalVars;
  /** Show the operator-requisites card (true for most legal documents). */
  requisites?: boolean;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Substitute {{token}} placeholders with admin-managed requisite values. */
function fill(text: string, vars: LegalVars): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: keyof LegalVars) =>
    vars[key] != null ? String(vars[key]) : `{{${key}}}`,
  );
}

function Block({ block, vars }: { block: LegalBlock; vars: LegalVars }) {
  if (block.type === "h") {
    return (
      <h3 className="mt-7 mb-2 text-base font-semibold text-[#0f1c2e]">
        {fill(block.text, vars)}
      </h3>
    );
  }
  if (block.type === "list") {
    return (
      <ul className="my-4 flex flex-col gap-2.5">
        {block.items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#005eb8]" />
            <span className="text-[15px] leading-relaxed text-[#374151]">
              {fill(item, vars)}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mb-4 text-[15px] leading-relaxed text-[#374151]">
      {fill(block.text, vars)}
    </p>
  );
}

export function LegalPage({
  title,
  lead,
  updated,
  sections,
  vars,
  requisites = true,
}: LegalPageProps): JSX.Element {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sections]);

  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top, behavior: "smooth" });
    setActive(id);
  };

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <SiteMobileNav />

      <main className="pt-16">
        {/* Hero band */}
        <section className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-b from-[#eef4fc] to-white">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, rgba(0,94,184,0.16), transparent 70%)" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <nav className="flex items-center gap-1.5 text-sm text-gray-400" aria-label="Хлебные крошки">
              <Link
                href="/"
                data-testid="link-breadcrumb-home"
                className="transition-colors hover:text-[#005eb8]"
              >
                Главная
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-[#374151]">{title}</span>
            </nav>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#005eb8] shadow-sm ring-1 ring-[#005eb8]/10">
              <ShieldCheck className="h-3.5 w-3.5" />
              Соответствует требованиям 152-ФЗ
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-[#0f1c2e] sm:text-4xl lg:text-[2.75rem]">
              {fill(title, vars)}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#6b7280] sm:text-lg">
              {fill(lead, vars)}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-gray-400">
              <CalendarClock className="h-4 w-4 text-[#005eb8]" />
              Редакция от {updated}
            </p>
          </div>
        </section>

        {/* Body */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:gap-14">
            {/* Sidebar: TOC + requisites */}
            <aside className="lg:sticky lg:top-24 lg:h-fit">
              <nav aria-label="Содержание" className="hidden lg:block">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Содержание
                </p>
                <ul className="flex flex-col gap-1 border-l border-gray-200">
                  {sections.map((s, i) => {
                    const isActive = active === s.id;
                    return (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => scrollToId(s.id)}
                          aria-current={isActive ? "true" : undefined}
                          data-testid={`link-toc-${s.id}`}
                          className={`-ml-px flex w-full items-start gap-2 border-l-2 py-1.5 pl-4 pr-2 text-left text-sm transition-colors ${
                            isActive
                              ? "border-[#005eb8] font-medium text-[#005eb8]"
                              : "border-transparent text-[#6b7280] hover:text-[#0f1c2e]"
                          }`}
                        >
                          <span className="tabular-nums opacity-50">{i + 1}.</span>
                          <span>{s.title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {requisites && (
                <div className="mt-8 rounded-2xl border border-gray-100 bg-[#f8fafa] p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-[#0f1c2e]">
                    <BadgeCheck className="h-5 w-5 text-[#005eb8]" />
                    <span className="text-sm font-semibold">Оператор / реквизиты</span>
                  </div>
                  <dl className="mt-4 flex flex-col gap-3.5 text-sm">
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-gray-400">Организация</dt>
                      <dd className="mt-0.5 text-[#374151]" data-testid="text-requisite-operator">
                        {vars.operator}
                      </dd>
                    </div>
                    {vars.license && (
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-gray-400">Лицензия</dt>
                        <dd className="mt-0.5 text-[#374151]" data-testid="text-requisite-license">
                          {vars.license}
                        </dd>
                      </div>
                    )}
                    {vars.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#005eb8]" />
                        <dd className="text-[#374151]">{vars.address}</dd>
                      </div>
                    )}
                    {vars.phone && (
                      <div className="flex items-start gap-2">
                        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#005eb8]" />
                        <dd>
                          <a
                            href={telHref(vars.phone)}
                            className="text-[#374151] transition-colors hover:text-[#005eb8]"
                          >
                            {vars.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </aside>

            {/* Content */}
            <article className="max-w-3xl">
              {sections.map((section, i) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-24 border-b border-gray-100 pb-8 pt-2 first:pt-0 last:border-0"
                >
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-semibold text-[#005eb8]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-[#0f1c2e] sm:text-2xl">
                      {section.title}
                    </h2>
                  </div>
                  <div className="mt-4">
                    {section.blocks.map((block, bi) => (
                      <Block key={bi} block={block} vars={vars} />
                    ))}
                  </div>
                </section>
              ))}

              {/* Contact CTA */}
              <div className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#005eb8]/15 bg-[#eef4fc] p-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-lg font-semibold text-[#0f1c2e]">Остались вопросы?</p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    Напишите или позвоните — поможем разобраться с документами и обработкой данных.
                  </p>
                </div>
                {vars.phone && (
                  <a
                    href={telHref(vars.phone)}
                    data-testid="link-legal-phone"
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#005eb8] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e72c8]"
                  >
                    <Phone className="h-4 w-4" /> {vars.phone}
                  </a>
                )}
              </div>

              <Link
                href="/contacts"
                data-testid="link-legal-contacts"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#005eb8] transition-colors hover:text-[#1e72c8]"
              >
                Перейти к контактам клиники
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
