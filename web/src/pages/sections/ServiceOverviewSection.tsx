import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronRight,
  Baby,
  Sparkles,
  Flower2,
  Dumbbell,
  Smile,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

type Service = { id: string; name: string; slug?: string | null };
type Direction = {
  id: string;
  slug: string;
  label: string;
  description: string;
  stat: string;
  statLabel: string;
  imageUrl: string;
  kind?: string;
  services: Service[];
};

const accentBySlug: Record<string, string> = {
  dentistry: "#007d83",
  cosmetology: "#9333ea",
  women: "#d6336c",
  men: "#1e3a5f",
  children: "#22c55e",
};
const accentPalette = ["#a03050", "#1e3a5f", "#7c5a0f", "#007d83", "#5b21b6", "#0e7490"];

const iconBySlug: Record<string, LucideIcon> = {
  dentistry: Smile,
  cosmetology: Sparkles,
  women: Flower2,
  men: Dumbbell,
  children: Baby,
};
const iconFor = (slug: string): LucideIcon => iconBySlug[slug] || Stethoscope;

const pageBySlug: Record<string, string> = {
  dentistry: "/stomatologiya",
  cosmetology: "/kosmetologiya",
  women: "/napravleniya/women",
  men: "/napravleniya/men",
  children: "/napravleniya/children",
};

function hex2rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const ServiceOverviewSection = (): JSX.Element | null => {
  const { data: allDirections = [] } = useQuery<Direction[]>({ queryKey: ["/api/directions"] });
  const [activeId, setActiveId] = useState<string | null>(null);

  const categories = allDirections.filter((d) => d.kind !== "specialty");
  if (categories.length === 0) return null;

  const accentFor = (cat: Direction, i: number) => accentBySlug[cat.slug] || accentPalette[i % accentPalette.length];
  const active = categories.find((c) => c.id === activeId) ?? categories[0];
  const activeAccent = accentFor(active, categories.indexOf(active));

  return (
    <section className="w-full bg-[#f8f9fb] py-14 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold tracking-[0.22em] uppercase text-[#007d83] mb-3">
              Медицинские услуги
            </p>
            <h2 className="font-heading text-3xl lg:text-5xl text-[#0f1c2e] leading-[1.1] tracking-tight">
              Услуги Медео<br className="hidden sm:block" /> в Москве
            </h2>
            <p className="mt-3 text-[#6b7280] text-sm lg:text-base font-light">
              Комплексная медицинская помощь для всей семьи
            </p>
          </div>
          <a
            href="#"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-[#007d83] hover:gap-3 transition-all"
          >
            Все услуги <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">

          {/* Left: accordion */}
          <div className="w-full lg:w-[44%] flex flex-col gap-2.5">
            {categories.map((cat, i) => {
              const accent = accentFor(cat, i);
              const isOpen = active.id === cat.id;
              const Icon = iconFor(cat.slug);
              return (
                <div
                  key={cat.id}
                  onClick={() => setActiveId(cat.id)}
                  className="relative cursor-pointer rounded-2xl overflow-hidden border transition-all duration-300"
                  style={{
                    borderColor: isOpen ? hex2rgba(accent, 0.2) : "rgba(0,0,0,0.06)",
                    boxShadow: isOpen
                      ? `0 8px 32px -8px ${hex2rgba(accent, 0.28)}, 0 2px 8px -2px ${hex2rgba(accent, 0.12)}`
                      : "0 1px 4px rgba(0,0,0,0.04)",
                    background: isOpen
                      ? `radial-gradient(ellipse at 0% 0%, ${hex2rgba(accent, 0.12)} 0%, transparent 60%),
                         radial-gradient(ellipse at 100% 100%, ${hex2rgba(accent, 0.07)} 0%, transparent 55%),
                         #ffffff`
                      : "#ffffff",
                  }}
                >
                  {/* Thematic watermark (mobile/tablet — desktop has the image panel) */}
                  <Icon
                    aria-hidden
                    strokeWidth={1.25}
                    className="pointer-events-none absolute -right-3 -bottom-4 h-28 w-28 sm:h-32 sm:w-32 lg:hidden transition-opacity duration-300"
                    style={{ color: accent, opacity: isOpen ? 0.14 : 0.05 }}
                  />
                  {/* Header row */}
                  <div className="relative z-10 flex items-center gap-4 px-6 py-4">
                    <div
                      className="h-6 w-1 shrink-0 rounded-full transition-colors duration-300"
                      style={{ backgroundColor: isOpen ? accent : "#e5e7eb" }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-heading text-[17px] transition-colors duration-300 leading-tight"
                        style={{ color: isOpen ? accent : "#0f1c2e" }}
                      >
                        {cat.label}
                      </p>
                      {isOpen && (
                        <p className="text-[12px] font-light mt-0.5 text-[#9ca3af]">
                          {cat.description}
                        </p>
                      )}
                    </div>
                    <div
                      className="h-2 w-2 shrink-0 rounded-full transition-all duration-300"
                      style={{ backgroundColor: isOpen ? accent : "#e0e2e8" }}
                    />
                  </div>

                  {/* Expanded */}
                  <div
                    className="relative z-10 overflow-hidden transition-all duration-300"
                    style={{ maxHeight: isOpen ? "420px" : "0px", opacity: isOpen ? 1 : 0 }}
                  >
                    <div className="px-6 pb-5">
                      <div
                        className="mb-3 h-px"
                        style={{ background: `linear-gradient(to right, ${hex2rgba(accent, 0.2)}, transparent)` }}
                      />

                      <ul className="flex flex-col">
                        {cat.services.map((service, i) => {
                          const rowStyle = {
                            borderBottom: i < cat.services.length - 1
                              ? `1px solid ${hex2rgba(accent, 0.1)}`
                              : "none",
                          };
                          const rowInner = (
                            <>
                              <span
                                className="text-[14px] text-[#1a2535] group-hover:translate-x-1 transition-transform duration-200"
                                style={{ fontFamily: "'Jost', sans-serif" }}
                              >
                                {service.name}
                              </span>
                              <ChevronRight
                                className="h-3.5 w-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                style={{ color: accent }}
                              />
                            </>
                          );
                          return (
                            <li key={service.id}>
                              {service.slug ? (
                                <Link
                                  href={`/uslugi/${service.slug}`}
                                  className="group flex items-center justify-between py-2.5 transition-all"
                                  onClick={(e) => e.stopPropagation()}
                                  style={rowStyle}
                                  data-testid={`link-service-${service.slug}`}
                                >
                                  {rowInner}
                                </Link>
                              ) : (
                                <span
                                  className="group flex items-center justify-between py-2.5 transition-all"
                                  style={rowStyle}
                                >
                                  {rowInner}
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>

                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <a
                          href="#contacts"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold text-white transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                          style={{ backgroundColor: accent }}
                        >
                          Записаться на приём <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                        {pageBySlug[cat.slug] && (
                          <Link
                            href={pageBySlug[cat.slug]}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-full border px-5 py-3 text-[13px] font-semibold transition-all duration-200 hover:shadow-sm"
                            style={{ color: accent, borderColor: hex2rgba(accent, 0.4), backgroundColor: hex2rgba(accent, 0.06) }}
                            data-testid={`link-direction-page-${cat.slug}`}
                          >
                            Все услуги направления <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: visual panel (desktop) */}
          <div className="hidden lg:flex lg:flex-1 flex-col rounded-3xl overflow-hidden relative min-h-[500px] sticky top-24">
            <div className="absolute inset-0">
              <img
                src={active.imageUrl}
                alt={active.label}
                key={active.id}
                className="h-full w-full object-cover object-center"
              />
              <div
                className="absolute inset-0 transition-all duration-500"
                style={{
                  background: `linear-gradient(160deg,
                    ${hex2rgba(activeAccent, 0.85)} 0%,
                    ${hex2rgba(activeAccent, 0.55)} 35%,
                    ${hex2rgba(activeAccent, 0.18)} 65%,
                    transparent 100%)`,
                }}
              />
            </div>

            <div className="relative z-10 flex h-full flex-col justify-between p-8">
              <div>
                <span className="inline-block rounded-full border border-white/30 px-3 py-1 text-[11px] font-semibold tracking-wider uppercase text-white/80 backdrop-blur-sm">
                  {active.label}
                </span>
                <h3 className="font-heading mt-5 text-2xl lg:text-[1.9rem] font-light text-white leading-snug max-w-xs">
                  {active.description}
                </h3>
              </div>

              <div
                className="rounded-2xl p-6 border border-white/15"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(16px)" }}
              >
                <p
                  className="text-5xl font-black text-white leading-none"
                  style={{ fontFamily: "'Jost', sans-serif", letterSpacing: "-0.03em" }}
                >
                  {active.stat}
                </p>
                <p className="mt-1.5 text-sm text-white/70 font-light">{active.statLabel}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <a
                    href="#contacts"
                    className="inline-flex items-center gap-2 rounded-full border border-white/40 px-5 py-2.5 text-[13px] font-medium text-white hover:bg-white hover:text-[#0f1c2e] transition-all duration-300"
                  >
                    Записаться на приём <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                  {pageBySlug[active.slug] && (
                    <Link
                      href={pageBySlug[active.slug]}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-5 py-2.5 text-[13px] font-medium text-white transition-all duration-300 hover:bg-white/20"
                      data-testid={`link-direction-panel-${active.slug}`}
                    >
                      Все услуги направления <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
