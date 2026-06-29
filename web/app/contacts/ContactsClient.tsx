"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Phone,
  Clock,
  CreditCard,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  TrainFront,
  Car,
  Navigation,
} from "lucide-react";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteMobileNav } from "../_components/SiteMobileNav";
import { useGo } from "../lib/use-go";

type Contacts = {
  phones: string[];
  address: string;
  schedule: { days: string; hours: string }[];
  entity: string;
  license: string;
};

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/** Точные координаты клиники (широта, долгота) — не зависят от текстового адреса. */
const CLINIC_LAT = 55.606157;
const CLINIC_LON = 37.659218;
/** Карточка организации в Яндекс Картах (точное место, отзывы, инфо). */
const ORG_MAP_URL = "https://yandex.ru/maps/org/medeo/226407459658/";
/** Маршрут по точным координатам (rtext = широта,долгота). Так маршрут строится
 *  корректно и на iOS, где приложение Яндекс.Карт не распознаёт текстовый адрес. */
const ROUTE_URL = `https://yandex.ru/maps/?mode=routes&rtext=~${CLINIC_LAT}%2C${CLINIC_LON}&rtt=auto`;

const directions = [
  {
    icon: TrainFront,
    title: "На метро",
    text: "Станция «Царицыно» (Замоскворецкая линия) — 5 минут пешком от южного выхода.",
  },
  {
    icon: Car,
    title: "На автомобиле",
    text: "Удобный въезд с 6-й Радиальной улицы. Рядом есть бесплатная парковка для пациентов.",
  },
  {
    icon: Navigation,
    title: "Ориентир",
    text: "Корпус 2 во дворе. На входе вас встретит администратор и подскажет дорогу.",
  },
];

type ContactsClientProps = {
  initialSettings?: Record<string, any>;
};

export default function ContactsClient({
  initialSettings,
}: ContactsClientProps): JSX.Element {
  const { data: settings } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    initialData: initialSettings,
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
  const primaryPhone = phones[0] ?? "+7 (991) 300-95-05";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              <span className="text-gray-600">Контакты</span>
            </nav>
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
                  Мы на связи
                </p>
                <h1 className="font-heading text-3xl lg:text-5xl text-[#0f1c2e] leading-[1.1] tracking-tight">
                  Контакты клиники
                </h1>
                <p className="mt-4 max-w-xl text-[#6b7280] text-sm lg:text-base font-light leading-relaxed">
                  Запишитесь на приём по телефону или приходите к нам в клинику.
                  Администратор ответит на вопросы, подберёт удобное время и
                  подскажет, как добраться.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                <a
                  href={telHref(primaryPhone)}
                  data-testid="link-contacts-call"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93] hover:shadow-lg"
                >
                  <Phone className="h-4 w-4" /> {primaryPhone}
                </a>
                <a
                  href={ROUTE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-contacts-route"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#005eb8]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#005eb8] transition-all hover:border-[#005eb8]"
                >
                  Построить маршрут <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Info cards */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {/* Address */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1fc]">
                <MapPin className="h-5 w-5 text-[#005eb8]" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Адрес
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-[#1a2535]" data-testid="text-contacts-address">
                {contacts.address}
              </p>
              <a
                href={ORG_MAP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#005eb8] hover:text-[#004a93] transition-colors"
                data-testid="link-contacts-map"
              >
                Открыть в Яндекс Картах <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            {/* Phones */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1fc]">
                <Phone className="h-5 w-5 text-[#005eb8]" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Телефоны
              </p>
              <div className="mt-2 flex flex-col gap-2">
                {phones.map((phone, i) => (
                  <a
                    key={phone}
                    href={telHref(phone)}
                    data-testid={`link-contacts-phone-${i}`}
                    className="text-[15px] font-medium text-[#1a2535] hover:text-[#005eb8] transition-colors"
                  >
                    {phone}
                  </a>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Звонок бесплатный по всей России
              </p>
            </div>

            {/* Schedule */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1fc]">
                <Clock className="h-5 w-5 text-[#005eb8]" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                Режим работы
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                {schedule.map((item) => (
                  <div key={item.days} className="flex items-center justify-between gap-6">
                    <span className="text-sm text-gray-500">{item.days}</span>
                    <span className="text-sm font-medium text-[#0f1c2e]">{item.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Map + directions */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 overflow-hidden rounded-2xl border border-gray-100 shadow-sm h-80 lg:h-[460px]">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=37.659218%2C55.606157&z=16&l=map&pt=37.659218%2C55.606157%2Cpm2rdm"
                width="100%"
                height="100%"
                className="h-full w-full"
                frameBorder="0"
                allowFullScreen
                title="Карта клиники Медео"
                data-testid="map-contacts"
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="h-5 w-1 rounded-full bg-[#005eb8]" />
                <h2 className="font-heading text-xl text-[#0f1c2e]">Как добраться</h2>
              </div>
              {directions.map((d) => (
                <div
                  key={d.title}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
                  data-testid={`card-direction-${d.title}`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fc]">
                      <d.icon className="h-5 w-5 text-[#005eb8]" />
                    </div>
                    <div>
                      <p className="text-[15px] font-medium text-[#0f1c2e]">{d.title}</p>
                      <p className="mt-1 text-sm font-light leading-relaxed text-[#6b7280]">
                        {d.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payments */}
          <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fc]">
                <CreditCard className="h-5 w-5 text-[#005eb8]" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Принимаем к оплате
                </p>
                <p className="mt-1 text-[15px] text-[#1a2535]">
                  Наличные, банковские карты и оплата по QR
                </p>
              </div>
            </div>
            <img
              className="h-auto max-w-[240px] sm:ml-auto"
              alt="Способы оплаты"
              src="/figmaAssets/ul-contacts--payments-list.svg"
            />
          </div>

          {/* CTA */}
          <div className="mt-10 rounded-3xl bg-[#e8f1fc] px-6 py-10 text-center lg:px-12 lg:py-14">
            <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e]">
              Запишитесь на приём
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm font-light text-[#5a6b78] lg:text-base">
              Позвоните нам — администратор подберёт врача и удобное время. Мы
              перезвоним в течение 15 минут.
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={telHref(primaryPhone)}
                data-testid="button-contacts-call"
                className="inline-flex items-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93] hover:shadow-lg"
              >
                <Phone className="h-4 w-4" /> {primaryPhone}
              </a>
              <button
                type="button"
                onClick={() => go("/patients")}
                data-testid="button-contacts-patients"
                className="inline-flex items-center gap-2 rounded-full border border-[#005eb8]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#005eb8] transition-all hover:border-[#005eb8]"
              >
                Как проходит приём <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
