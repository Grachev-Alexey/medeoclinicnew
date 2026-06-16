"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Stethoscope } from "lucide-react";
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

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  experience: string;
  price: string;
  imageUrl: string;
  available: boolean;
  availableDate: string;
};

type Props = {
  initialData?: Doctor[];
};

export default function DoctorsListClient({ initialData }: Props): JSX.Element {
  const { data: doctors = [] } = useQuery<Doctor[]>({
    queryKey: ["/api/doctors"],
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
              <Stethoscope className="h-3 w-3" /> Наша команда
            </span>
            <h1 className="font-heading mt-5 text-3xl leading-[1.1] tracking-tight text-[#0f1c2e] lg:text-5xl">
              Врачи клиники «Медео»
            </h1>
            <p className="mt-5 max-w-2xl text-base font-light leading-relaxed text-[#5a6b78] lg:text-lg">
              Опытные специалисты с бережным, доказательным подходом. Мы внимательно слушаем,
              подробно объясняем и назначаем только то, что действительно нужно. Выберите врача
              и запишитесь на приём.
            </p>
          </div>
        </section>

        {/* Grid */}
        <section className="px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="mx-auto max-w-7xl">
            {doctors.length === 0 ? (
              <p className="text-center text-[#5a6b78]" data-testid="text-doctors-empty">
                Информация о врачах скоро появится.
              </p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {doctors.map((d) => (
                  <Link
                    key={d.id}
                    href={`/vrachi/${d.slug}`}
                    data-testid={`card-doctor-${d.slug}`}
                    className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white transition-all hover:-translate-y-0.5 hover:shadow-xl"
                    style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                      {d.imageUrl ? (
                        <img
                          src={d.imageUrl}
                          alt={d.name}
                          className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <Stethoscope className="h-12 w-12" />
                        </div>
                      )}
                      {d.available && (
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm backdrop-blur-sm">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {d.availableDate ? `Принимает ${d.availableDate}` : "Принимает сегодня"}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-heading text-xl text-[#0f1c2e]">{d.name}</h2>
                      {d.specialty && (
                        <p className="mt-1.5 text-sm font-medium" style={{ color: ACCENT }}>
                          {d.specialty}
                        </p>
                      )}
                      {d.experience && (
                        <p className="mt-2 flex-1 text-sm font-light leading-relaxed text-[#6b7280]">
                          {d.experience}
                        </p>
                      )}
                      <span
                        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                        style={{ color: ACCENT }}
                      >
                        Подробнее о враче <ArrowRight className="h-4 w-4" />
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
