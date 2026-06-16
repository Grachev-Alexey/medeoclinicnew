"use client";

import { useQuery } from "@tanstack/react-query";
import { MapPin, Phone, Clock } from "lucide-react";
import Link from "next/link";
import { useGo } from "../lib/use-go";

type Contacts = {
  phones: string[];
  address: string;
  schedule: { days: string; hours: string }[];
  entity: string;
  license: string;
};

const navLinks = [
  { label: "О клинике", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Стоматология", href: "/stomatologiya" },
  { label: "Косметология", href: "/kosmetologiya" },
  { label: "Для женщин", href: "/napravleniya/women" },
  { label: "Для мужчин", href: "/napravleniya/men" },
  { label: "Детям", href: "/napravleniya/children" },
  { label: "Врачи", href: "/vrachi" },
  { label: "Пациентам", href: "/patients" },
  { label: "Цены", href: "/prices" },
  { label: "Акции", href: "/akcii" },
  { label: "Контакты", href: "/contacts" },
];

const policyLinks = [
  { label: "Политика обработки персональных данных", href: "/politika-personalnyh-dannyh" },
  { label: "Согласие на обработку данных", href: "/soglasie-na-obrabotku" },
  { label: "Правила использования куки", href: "/cookie" },
  { label: "Сведения о лицензии", href: "/licenziya" },
  { label: "Пользовательское соглашение", href: "/polzovatelskoe-soglashenie" },
];

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const SiteFooter = (): JSX.Element => {
  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
  });
  const go = useGo();

  const contacts: Contacts = settings?.contacts ?? {
    phones: [],
    address: "",
    schedule: [],
    entity: "",
    license: "",
  };
  const phones = contacts.phones ?? [];
  const schedule = contacts.schedule ?? [];
  const brandName = settings?.branding?.name ?? "МЕДЕО";
  const brandTagline = settings?.branding?.tagline ?? "МЕДИЦИНСКИЙ ЦЕНТР";

  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div className="lg:pr-6">
            <div className="flex items-center gap-2.5">
              <svg
                width="34"
                height="34"
                viewBox="0 0 60 60"
                fill="none"
                stroke="#007d83"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <ellipse cx="30" cy="17" rx="8" ry="14" />
                <ellipse cx="30" cy="43" rx="8" ry="14" />
                <ellipse cx="17" cy="30" rx="14" ry="8" />
                <ellipse cx="43" cy="30" rx="14" ry="8" />
              </svg>
              <div className="flex flex-col leading-none gap-[3px]">
                <span className="font-semibold uppercase tracking-[0.18em] text-[15px] text-[#0f1c2e]">
                  {brandName}
                </span>
                <span className="uppercase tracking-[0.2em] text-[8px] font-medium text-[#007d83]">
                  {brandTagline}
                </span>
              </div>
            </div>
            <p className="mt-4 text-sm font-light leading-relaxed text-[#6b7280]">
              Клиника доказательной медицины. Назначаем только препараты с
              доказанной эффективностью.
            </p>
            {phones[0] && (
              <a
                href={telHref(phones[0])}
                data-testid="link-footer-phone"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#007d83] px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#006970]"
              >
                <Phone className="h-4 w-4" /> {phones[0]}
              </a>
            )}
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Навигация
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => go(link.href)}
                    data-testid={`link-footer-nav-${link.label}`}
                    className="text-sm text-[#374151] transition-colors hover:text-[#007d83]"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Контакты
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {contacts.address && (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#007d83]" />
                  <span className="text-sm leading-relaxed text-[#374151]">
                    {contacts.address}
                  </span>
                </li>
              )}
              {phones.length > 0 && (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#007d83]" />
                  <span className="flex flex-col gap-1">
                    {phones.map((phone) => (
                      <a
                        key={phone}
                        href={telHref(phone)}
                        className="text-sm text-[#374151] transition-colors hover:text-[#007d83]"
                      >
                        {phone}
                      </a>
                    ))}
                  </span>
                </li>
              )}
              {schedule.length > 0 && (
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#007d83]" />
                  <span className="flex flex-col gap-1">
                    {schedule.map((item) => (
                      <span key={item.days} className="text-sm text-[#374151]">
                        {item.days}: {item.hours}
                      </span>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </div>

          {/* Documents */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Документы
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {policyLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    data-testid={`link-footer-policy-${item.href}`}
                    className="text-left text-sm leading-relaxed text-[#374151] transition-colors hover:text-[#007d83]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">© 2026 ММЦ «Медео»</span>
              <span className="inline-flex h-5 w-8 items-center justify-center rounded border border-gray-300 text-[10px] font-medium text-gray-400">
                18+
              </span>
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-gray-400">
              {contacts.entity}
              {contacts.license && <> · Лицензия {contacts.license}</>}
              {" · "}Есть противопоказания, посоветуйтесь с врачом.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
