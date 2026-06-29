import type { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  Stethoscope,
  CalendarDays,
  Wallet,
  Tag,
  Phone,
  ArrowRight,
  Compass,
} from "lucide-react";
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteMobileNav } from "./_components/SiteMobileNav";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description:
    "К сожалению, такой страницы не существует. Вернитесь на главную или выберите нужный раздел сайта медицинского центра «МЕДЕО».",
  robots: { index: false, follow: true },
};

const popularLinks = [
  { href: "/vrachi", label: "Врачи", desc: "Наши специалисты", icon: Stethoscope },
  { href: "/uslugi", label: "Услуги", desc: "Направления и приёмы", icon: Compass },
  { href: "/prices", label: "Цены", desc: "Стоимость услуг", icon: Wallet },
  { href: "/akcii", label: "Акции", desc: "Выгодные предложения", icon: Tag },
  { href: "/contacts", label: "Контакты", desc: "Как нас найти", icon: Phone },
  { href: "/patients", label: "Пациентам", desc: "Полезная информация", icon: CalendarDays },
];

export default function NotFound(): JSX.Element {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <SiteMobileNav />

      <main className="pt-16">
        <section className="relative overflow-hidden bg-gradient-to-b from-[#eef4fc] to-white">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-50 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,94,184,0.16), transparent 70%)",
            }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(circle, rgba(0,94,184,0.12), transparent 70%)",
            }}
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-col items-center text-center">
              <span
                className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-[#005eb8] shadow-sm ring-1 ring-[#005eb8]/10"
                data-testid="badge-404"
              >
                Ошибка 404
              </span>

              <p className="mt-6 bg-gradient-to-br from-[#005eb8] to-[#0f1c2e] bg-clip-text text-7xl font-extrabold leading-none tracking-tight text-transparent sm:text-8xl lg:text-9xl">
                404
              </p>

              <h1
                className="mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-[#0f1c2e] sm:text-4xl"
                data-testid="text-notfound-title"
              >
                Такой страницы не существует
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#6b7280] sm:text-lg">
                Возможно, ссылка устарела или была введена с ошибкой. Вернитесь
                на главную или перейдите в нужный раздел — мы поможем найти то,
                что вы искали.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  data-testid="link-notfound-home"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#005eb8] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1e72c8]"
                >
                  <Home className="h-4 w-4" />
                  На главную
                </Link>
                <Link
                  href="/contacts"
                  data-testid="link-notfound-contacts"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-[#005eb8]/20 bg-white px-6 py-3 text-sm font-semibold text-[#005eb8] transition-all hover:bg-[#eef4fc]"
                >
                  <Phone className="h-4 w-4" />
                  Связаться с нами
                </Link>
              </div>
            </div>

            {/* Popular sections */}
            <div className="mx-auto mt-16 max-w-4xl">
              <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
                Популярные разделы
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {popularLinks.map(({ href, label, desc, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    data-testid={`link-popular-${href.replace(/\//g, "")}`}
                    className="group flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-[#005eb8]/30 hover:shadow-md"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eef4fc] text-[#005eb8] transition-colors group-hover:bg-[#005eb8] group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-[#0f1c2e]">
                        {label}
                      </span>
                      <span className="block truncate text-xs text-[#6b7280]">
                        {desc}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition-all group-hover:translate-x-0.5 group-hover:text-[#005eb8]" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
