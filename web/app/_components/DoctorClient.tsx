"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, ShieldCheck, Stethoscope, Search } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { DoctorRatings } from "@/reused-pages/sections/DoctorRatings";

const ACCENT = "#005eb8";

type ServiceItem = {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string;
};

type Doctor = {
  id: string;
  slug: string;
  name: string;
  specialty: string;
  experience: string;
  price: string;
  imageUrl: string;
  quote: string;
  credentials: string[];
  prodoctorovUrl: string;
  prodoctorovRating: string;
  prodoctorovReviews: string;
  yandexUrl: string;
  yandexRating: string;
  yandexReviews: string;
  available: boolean;
  availableDate: string;
  services?: ServiceItem[];
};

type Props = {
  slug: string;
  initialData?: Doctor;
};

export default function DoctorClient({ slug, initialData }: Props): JSX.Element {
  const { data: doctor } = useQuery<Doctor>({
    queryKey: ["/api/doctors", slug],
    initialData,
  });

  const [search, setSearch] = useState("");

  if (!doctor) return <></>;

  const credentials = (doctor.credentials || []).filter(Boolean);
  const allServices = doctor.services ?? [];
  const filtered = search.trim()
    ? allServices.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.shortDescription ?? "").toLowerCase().includes(search.toLowerCase()),
      )
    : allServices;

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
          <Link
            href="/vrachi"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5a6b78] transition-colors hover:text-[#005eb8]"
            data-testid="link-back-doctors"
          >
            <ArrowLeft className="h-4 w-4" /> Все врачи
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-[#f2f8fe] via-white to-[#eaf3fc] ring-1 ring-[#005eb8]/10 lg:rounded-[2.5rem]">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
              {/* Portrait */}
              <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[520px]">
                {doctor.imageUrl ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="absolute inset-0 h-full w-full object-cover object-top"
                    data-testid="img-doctor"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <Stethoscope className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                  <h1 className="text-xl font-semibold text-white drop-shadow-sm sm:text-2xl" data-testid="text-doctor-name">
                    {doctor.name}
                  </h1>
                  <p className="mt-1 text-[13px] text-white/90 sm:text-sm" data-testid="text-doctor-specialty">
                    {doctor.specialty}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
                {doctor.experience ? (
                  <p className="text-sm font-medium" style={{ color: ACCENT }} data-testid="text-doctor-experience">
                    {doctor.experience}
                  </p>
                ) : null}

                {doctor.quote ? (
                  <p
                    className="mt-3 text-xl font-medium leading-snug tracking-tight text-[#0f1c2e] sm:text-2xl"
                    data-testid="text-doctor-quote"
                  >
                    {doctor.quote}
                  </p>
                ) : null}

                <DoctorRatings doctor={doctor} />

                {credentials.length > 0 ? (
                  <ul className="mt-7 space-y-3" data-testid="list-doctor-credentials">
                    {credentials.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-[#0f1c2e]"
                        data-testid={`credential-${i}`}
                      >
                        <ShieldCheck className="h-5 w-5 shrink-0 text-[#005eb8]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-8 flex flex-col gap-4 border-t border-[#005eb8]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <a
                      href="#contacts"
                      className="group inline-flex items-center rounded-full bg-[#005eb8] px-7 py-3.5 text-base font-medium text-white transition-colors hover:bg-[#004a93]"
                      data-testid="button-book-doctor"
                    >
                      Записаться на приём
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                    {doctor.price ? (
                      <p className="mt-2.5 text-sm text-gray-500" data-testid="text-doctor-price">
                        Консультация {doctor.price} · без спешки и лишних назначений
                      </p>
                    ) : null}
                  </div>
                  {doctor.available ? (
                    <span
                      className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700"
                      data-testid="text-doctor-available"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      {doctor.availableDate ? `Принимает ${doctor.availableDate}` : "Принимает сегодня"}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Services section */}
          {allServices.length > 0 && (
            <section className="mt-12" data-testid="section-doctor-services">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-[#0f1c2e] sm:text-2xl">Услуги врача</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {allServices.length === 1
                      ? "1 услуга"
                      : allServices.length < 5
                      ? `${allServices.length} услуги`
                      : `${allServices.length} услуг`}
                  </p>
                </div>
                {allServices.length > 4 && (
                  <div className="relative w-full sm:w-64">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Поиск услуги…"
                      className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none ring-[#005eb8]/30 transition focus:border-[#005eb8] focus:ring-2"
                      data-testid="input-service-search"
                    />
                  </div>
                )}
              </div>

              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400" data-testid="text-services-empty">
                  Ничего не найдено
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="grid-doctor-services">
                  {filtered.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/uslugi/${svc.slug}`}
                      className="group flex items-start gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:border-[#005eb8]/20 hover:ring-[#005eb8]/10 hover:shadow-md"
                      data-testid={`card-service-${svc.id}`}
                    >
                      <span
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: "#eaf3fc" }}
                      >
                        <Stethoscope className="h-4 w-4" style={{ color: ACCENT }} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#0f1c2e] group-hover:text-[#005eb8] transition-colors line-clamp-2">
                          {svc.name}
                        </p>
                        {svc.shortDescription ? (
                          <p className="mt-1 text-xs text-gray-500 line-clamp-2">{svc.shortDescription}</p>
                        ) : null}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
