"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Phone,
  ChevronRight,
  ChevronDown,
  CalendarCheck,
  UserCheck,
  Stethoscope,
  ClipboardList,
  FileText,
  CreditCard,
  FlaskConical,
  Clock,
} from "lucide-react";
import { SiteHeader } from "../_components/SiteHeader";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteMobileNav } from "../_components/SiteMobileNav";
import { useGo } from "../lib/use-go";

const steps = [
  {
    icon: CalendarCheck,
    title: "Оставьте заявку",
    text: "Позвоните по телефону или заполните форму на сайте — мы перезвоним в течение 15 минут.",
  },
  {
    icon: UserCheck,
    title: "Выберите врача и время",
    text: "Администратор подберёт подходящего специалиста и удобное для вас время приёма.",
  },
  {
    icon: Stethoscope,
    title: "Приходите на приём",
    text: "Возьмите паспорт и результаты предыдущих обследований, если они есть.",
  },
];

const infoCards = [
  {
    icon: ClipboardList,
    title: "Подготовка к приёму",
    text: "Для большинства консультаций специальная подготовка не нужна. Для УЗИ и анализов уточните рекомендации у администратора при записи.",
  },
  {
    icon: FileText,
    title: "Какие документы взять",
    text: "Паспорт, полис ДМС (при наличии) и результаты предыдущих обследований — это поможет врачу составить полную картину.",
  },
  {
    icon: CreditCard,
    title: "Оплата и ДМС",
    text: "Принимаем наличные и банковские карты. Работаем с программами добровольного медицинского страхования.",
  },
  {
    icon: FlaskConical,
    title: "Анализы и результаты",
    text: "Забор анализов проводится в клинике. Результаты можно получить по электронной почте или в личном кабинете.",
  },
];

const faq = [
  {
    q: "Нужно ли записываться заранее?",
    a: "Да, мы работаем по предварительной записи, чтобы вам не пришлось ждать в очереди. Записаться можно по телефону или через форму на сайте.",
  },
  {
    q: "Можно ли вызвать врача на дом?",
    a: "Да, мы оказываем услугу вызова врача на дом. Уточните доступные направления и стоимость у администратора.",
  },
  {
    q: "Работаете ли вы по ДМС?",
    a: "Да, мы сотрудничаем со многими страховыми компаниями по программам добровольного медицинского страхования. Уточните, входит ли наша клиника в вашу программу.",
  },
  {
    q: "Как отменить или перенести приём?",
    a: "Позвоните нам не позднее чем за 2 часа до приёма — мы перенесём запись на удобное для вас время без каких-либо ограничений.",
  },
  {
    q: "Назначаете ли вы лишние обследования?",
    a: "Нет. Мы придерживаемся принципов доказательной медицины и назначаем только те исследования и препараты, эффективность которых подтверждена.",
  },
];

export default function PatientsClient(): JSX.Element {
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });
  const go = useGo();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const phone: string = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";
  const telHref = `tel:${phone.replace(/[^\d+]/g, "")}`;

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
                className="hover:text-[#007d83] transition-colors"
                data-testid="link-breadcrumb-home"
              >
                Главная
              </button>
              <ChevronRight className="h-3 w-3" />
              <span className="text-gray-600">Пациентам</span>
            </nav>
            <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#007d83] mb-3">
              Пациентам
            </p>
            <h1 className="font-heading text-3xl lg:text-5xl text-[#0f1c2e] leading-[1.1] tracking-tight">
              Всё, что нужно знать<br className="hidden sm:block" /> перед визитом
            </h1>
            <p className="mt-4 max-w-2xl text-[#6b7280] text-sm lg:text-base font-light leading-relaxed">
              Мы сделали посещение клиники простым и понятным. Здесь — порядок записи,
              подготовка к приёму и ответы на частые вопросы.
            </p>
          </div>
        </section>

        {/* Steps */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] mb-8">
            Как записаться на приём
          </h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                  data-testid={`card-step-${i}`}
                >
                  <span className="absolute right-5 top-5 font-heading text-4xl font-bold text-gray-100 select-none">
                    {i + 1}
                  </span>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f6f6] text-[#007d83]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-heading text-lg text-[#0f1c2e]">{step.title}</h3>
                  <p className="mt-2 text-sm text-[#6b7280] font-light leading-relaxed">{step.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Info cards */}
        <section className="bg-[#f8f9fb] border-y border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] mb-8">
              Полезная информация
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {infoCards.map((card) => {
                const Icon = card.icon;
                return (
                  <div
                    key={card.title}
                    className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
                    data-testid={`card-info-${card.title}`}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#e8f6f6] text-[#007d83]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-heading text-lg text-[#0f1c2e]">{card.title}</h3>
                      <p className="mt-1.5 text-sm text-[#6b7280] font-light leading-relaxed">{card.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e] mb-8 text-center">
            Частые вопросы
          </h2>
          <div className="space-y-3">
            {faq.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    data-testid={`faq-toggle-${i}`}
                    id={`faq-button-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="text-[15px] font-medium text-[#0f1c2e]">{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#007d83] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    className="overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? "240px" : "0px", opacity: isOpen ? 1 : 0 }}
                  >
                    <p className="px-6 pb-5 text-sm text-[#6b7280] font-light leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-14">
          <div className="rounded-3xl bg-[#e8f6f6] px-6 py-10 lg:px-12 lg:py-14 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-medium text-[#007d83] mb-5">
              <Clock className="h-3.5 w-3.5" /> Перезвоним в течение 15 минут
            </div>
            <h2 className="font-heading text-2xl lg:text-3xl text-[#0f1c2e]">
              Остались вопросы?
            </h2>
            <p className="mt-3 mx-auto max-w-xl text-[#5a6b78] text-sm lg:text-base font-light">
              Запишитесь на приём или позвоните — мы поможем выбрать врача и ответим на
              любые вопросы.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => go("#contacts")}
                data-testid="button-patients-book"
                className="inline-flex items-center gap-2 rounded-full bg-[#007d83] px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-[#006970] hover:shadow-lg"
              >
                Записаться на приём <ArrowRight className="h-4 w-4" />
              </button>
              <a
                href={telHref}
                data-testid="link-patients-phone"
                className="inline-flex items-center gap-2 rounded-full border border-[#007d83]/30 bg-white px-7 py-3.5 text-sm font-semibold text-[#007d83] transition-all hover:border-[#007d83]"
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
