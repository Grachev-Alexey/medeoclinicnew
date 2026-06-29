"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Microscope,
  Users,
  BadgeCheck,
} from "lucide-react";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteMobileNav } from "../_components/SiteMobileNav";
import { useGo } from "../lib/use-go";

type Doctor = { id: string; name: string; imageUrl: string };
type Direction = { id: string; kind?: string };
type Contacts = {
  phones?: string[];
  address?: string;
  schedule?: { days: string; hours: string }[];
};

const values = [
  {
    icon: Microscope,
    title: "Доказательная медицина",
    text: "Назначаем только те исследования и препараты, эффективность которых подтверждена. Без лишних анализов и пугающих диагнозов.",
  },
  {
    icon: HeartPulse,
    title: "Лечим причину, а не симптом",
    text: "Разбираемся в первопричине, чтобы результат был долгим. Бережно относимся к вашему времени и здоровью.",
  },
  {
    icon: ShieldCheck,
    title: "Честные рекомендации",
    text: "Говорим прямо, что действительно нужно, а что — нет. Вы всегда понимаете, за что платите.",
  },
  {
    icon: Users,
    title: "Забота о всей семье",
    text: "Принимаем и взрослых, и детей. Ведём пациента по нескольким направлениям в одной клинике.",
  },
];

export default function AboutClient(): JSX.Element {
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });
  const { data: doctors = [] } = useQuery<Doctor[]>({ queryKey: ["/api/doctors"] });
  const { data: directions = [] } = useQuery<Direction[]>({ queryKey: ["/api/directions"] });
  const go = useGo();

  const contacts: Contacts = settings?.contacts ?? {};
  const phone = contacts.phones?.[0] ?? "+7 (991) 300-95-05";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;
  const address = contacts.address ?? "";
  const schedule = contacts.schedule ?? [];

  const avatars = doctors.slice(0, 6);
  const doctorsCount = doctors.length;
  const directionsCount = directions.length;

  const stats = [
    doctorsCount > 0
      ? { value: `${doctorsCount}`, label: "Врачей-специалистов" }
      : { value: "Команда", label: "Врачей, которым не всё равно" },
    directionsCount > 0
      ? { value: `${directionsCount}`, label: "Направлений медицины" }
      : { value: "Многопрофиль", label: "Направлений медицины" },
    { value: "15 мин", label: "Перезвоним после заявки" },
    { value: "ДМС", label: "Работаем со страховыми" },
  ];

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
              <span className="text-gray-600">О клинике</span>
            </nav>
            <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
              О клинике
            </p>
            <h1 className="font-heading text-3xl lg:text-5xl text-[#0f1c2e] leading-[1.1] tracking-tight">
              Медицинский центр «Медео» —<br className="hidden sm:block" /> медицина без лишнего
            </h1>
            <p className="mt-4 max-w-2xl text-[#6b7280] text-sm lg:text-base font-light leading-relaxed">
              Многопрофильная клиника доказательной медицины. Мы помогаем разобраться
              в причине, а не лечим симптомы, и относимся к каждому пациенту так, как
              хотели бы, чтобы относились к нашим близким.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => go("#contacts")}
                data-testid="button-about-book"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93] hover:shadow-lg"
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={telHref}
                data-testid="link-about-phone"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#005eb8]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#005eb8] transition-all hover:border-[#005eb8]"
              >
                <Phone className="h-4 w-4" /> {phone}
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm"
                data-testid={`stat-${s.label}`}
              >
                <p className="font-heading text-2xl lg:text-3xl text-[#005eb8]">{s.value}</p>
                <p className="mt-1.5 text-xs lg:text-sm text-[#6b7280] font-light leading-snug">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="bg-[#f8f9fb] border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div className="relative min-h-[280px] overflow-hidden rounded-[1.75rem] ring-1 ring-[#005eb8]/10 lg:min-h-[420px]">
                <img
                  src="/image/hero.webp"
                  alt="Медицинский центр «Медео»"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0f1c2e]/55 to-transparent" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
                  О нас
                </p>
                <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] leading-tight">
                  Клиника, которой доверяют семьями
                </h2>
                <div className="mt-5 space-y-4 text-sm lg:text-[15px] text-[#5a6b78] font-light leading-relaxed">
                  <p>
                    «Медео» — это команда врачей высшей категории и кандидатов
                    медицинских наук, которые работают по принципам доказательной
                    медицины. Мы собрали под одной крышей основные направления, чтобы
                    вам не пришлось бегать по разным клиникам.
                  </p>
                  <p>
                    Здесь нет места лишним назначениям и запугиванию. Мы объясняем
                    каждое решение понятным языком, назначаем только необходимое и
                    ведём пациента до результата — будь то консультация, диагностика
                    или комплексное лечение.
                  </p>
                </div>
                <Link
                  href="/vrachi"
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005eb8] transition-colors hover:text-[#004a93]"
                  data-testid="link-about-doctors"
                >
                  Познакомиться с врачами
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] mb-8">
            Наши принципы
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="relative flex flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  data-testid={`value-${i}`}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f1fc] text-[#005eb8]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-[#0f1c2e] leading-snug">{v.title}</h3>
                  <p className="mt-2 text-sm text-[#6b7280] font-light leading-relaxed">{v.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Team teaser */}
        {avatars.length > 0 && (
          <section className="bg-[#f8f9fb] border-y border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-xl">
                  <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
                    Команда
                  </p>
                  <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] leading-tight">
                    Вас будут вести врачи, которым не всё равно
                  </h2>
                  <p className="mt-4 text-sm lg:text-[15px] text-[#5a6b78] font-light leading-relaxed">
                    Опытные специалисты, которые выслушают, объяснят и помогут —
                    без спешки и лишних назначений.
                  </p>
                  <Link
                    href="/vrachi"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93]"
                    data-testid="link-about-all-doctors"
                  >
                    Все врачи клиники <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="flex -space-x-3">
                  {avatars.map((d) => (
                    <img
                      key={d.id}
                      src={d.imageUrl}
                      alt={d.name}
                      loading="lazy"
                      className="h-16 w-16 rounded-2xl object-cover object-top ring-2 ring-white shadow-sm lg:h-20 lg:w-20"
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Visit / contacts strip */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {address && (
              <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-testid="card-address">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fc] text-[#005eb8]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[#0f1c2e]">Адрес</h3>
                  <p className="mt-1.5 text-sm text-[#6b7280] font-light leading-relaxed">{address}</p>
                </div>
              </div>
            )}
            {schedule.length > 0 && (
              <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-testid="card-schedule">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fc] text-[#005eb8]">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-heading text-lg text-[#0f1c2e]">Режим работы</h3>
                  <ul className="mt-1.5 space-y-1">
                    {schedule.map((item, i) => (
                      <li key={i} className="text-sm text-[#6b7280] font-light leading-relaxed">
                        <span className="text-[#0f1c2e]">{item.days}:</span> {item.hours}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm" data-testid="card-license">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f1fc] text-[#005eb8]">
                <BadgeCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg text-[#0f1c2e]">Лицензия</h3>
                <p className="mt-1.5 text-sm text-[#6b7280] font-light leading-relaxed">
                  Работаем на основании лицензии на медицинскую деятельность.{" "}
                  <Link href="/licenziya" className="font-medium text-[#005eb8] hover:text-[#004a93]" data-testid="link-about-license">
                    Сведения о лицензии
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
          <div className="rounded-3xl bg-[#e8f1fc] px-6 py-10 lg:px-12 lg:py-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#005eb8] mb-5">
              <Stethoscope className="h-3.5 w-3.5" /> Запись по телефону и онлайн
            </div>
            <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e]">
              Запишитесь на приём в «Медео»
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-[#5a6b78] text-sm lg:text-base font-light">
              Подберём врача и удобное время. Перезвоним в течение 15 минут и ответим
              на любые вопросы.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go("#contacts")}
                data-testid="button-about-cta"
                className="inline-flex items-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#004a93] hover:shadow-lg"
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={telHref}
                data-testid="link-about-cta-phone"
                className="inline-flex items-center gap-2 rounded-full border border-[#005eb8]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#005eb8] transition-all hover:border-[#005eb8]"
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
