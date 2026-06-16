"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Phone,
  Search,
  X,
  Menu,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  Tag,
  Smile,
  Sparkles,
  Flower2,
  Dumbbell,
  Baby,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useGo } from "../lib/use-go";
import { directionPath } from "../lib/site";
import { openSearch } from "./SearchOverlay";

type NavLink = { id: string; label: string; href: string; group: string; sortOrder: number };
type Service = { id: string; name: string; slug?: string | null };
type Direction = {
  id: string;
  slug: string;
  label: string;
  description?: string;
  services: Service[];
};

const defaultMainLinks = [
  { label: "О клинике", href: "#about" },
  { label: "Услуги", href: "#services" },
  { label: "Врачи", href: "/vrachi" },
  { label: "Пациентам", href: "/patients" },
  { label: "Цены", href: "/prices" },
  { label: "Акции", href: "/akcii" },
  { label: "Контакты", href: "/contacts" },
];

const defaultSecondaryLinks = [
  { label: "Вызов на дом", href: "#" },
  { label: "ДМС", href: "#" },
  { label: "Результаты анализов", href: "#" },
  { label: "О лицензии", href: "/licenziya" },
  { label: "Вакансии", href: "#" },
];

const accentBySlug: Record<string, string> = {
  dentistry: "#007d83",
  cosmetology: "#9333ea",
  women: "#d6336c",
  men: "#1e3a5f",
  children: "#22c55e",
};
const accentPalette = ["#007d83", "#1e3a5f", "#a03050", "#5b21b6", "#0e7490", "#7c5a0f"];

const iconBySlug: Record<string, LucideIcon> = {
  dentistry: Smile,
  cosmetology: Sparkles,
  women: Flower2,
  men: Dumbbell,
  children: Baby,
};
const iconFor = (slug: string): LucideIcon => iconBySlug[slug] || Stethoscope;

function hex2rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

const isServicesLink = (l: { label: string; href: string }) =>
  l.href === "#services" || l.label.toLowerCase().includes("услуг");

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.18, ease: "easeIn" } },
};

const panelVariants = {
  hidden: { y: "-100%" },
  visible: { y: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } },
  exit: { y: "-100%", transition: { duration: 0.28, ease: [0.32, 0.72, 0, 1] } },
};

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.16 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const bottomVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut", delay: 0.5 } },
};

const megaVariants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: "easeIn" } },
};

const Logo = ({ size = 34 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
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
);

export const SiteHeader = (): JSX.Element => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [mobileDirId, setMobileDirId] = useState<string | null>(null);
  const go = useGo();

  const { data: navData = [] } = useQuery<NavLink[]>({ queryKey: ["/api/nav-links"] });
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });
  const { data: directions = [] } = useQuery<Direction[]>({ queryKey: ["/api/directions"] });

  const handleNav = (e: React.MouseEvent, href: string, alsoClose = false) => {
    e.preventDefault();
    if (alsoClose) {
      setMenuOpen(false);
      setMobileServicesOpen(false);
      setMobileDirId(null);
    }
    setMegaOpen(false);
    go(href);
  };

  const linkKey = (l: { label: string; href: string }) => `${l.label}-${l.href}`;
  const accentFor = (slug: string, i: number) => accentBySlug[slug] || accentPalette[i % accentPalette.length];

  const byOrder = (a: NavLink, b: NavLink) => a.sortOrder - b.sortOrder;
  const apiMain = navData.filter((n) => n.group === "main").sort(byOrder);
  const apiSecondary = navData.filter((n) => n.group === "secondary").sort(byOrder);
  const navLinks = apiMain.length ? apiMain : defaultMainLinks;
  const secondaryLinks = apiSecondary.length ? apiSecondary : defaultSecondaryLinks;

  const phone = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";
  const brandName = settings?.branding?.name ?? "МЕДЕО";
  const brandTagline = settings?.branding?.tagline ?? "МЕДИЦИНСКИЙ ЦЕНТР";

  const hasMega = directions.length > 0;

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMegaOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [megaOpen]);

  const close = () => {
    setMenuOpen(false);
    setMobileServicesOpen(false);
    setMobileDirId(null);
  };

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm"
        onMouseLeave={() => setMegaOpen(false)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-6">
            {/* Logo */}
            <a
              href="/"
              onClick={(e) => handleNav(e, "/")}
              className="flex items-center gap-2.5 shrink-0 select-none"
            >
              <Logo />
              <div className="flex flex-col leading-none gap-[3px]">
                <span
                  className="font-semibold text-[#0f1c2e] text-[15px] uppercase"
                  style={{ letterSpacing: "0.18em" }}
                >
                  {brandName}
                </span>
                <span
                  className="text-[#007d83] text-[8px] uppercase font-medium hidden sm:block"
                  style={{ letterSpacing: "0.2em" }}
                >
                  {brandTagline}
                </span>
              </div>
            </a>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
              {navLinks.map((link) => {
                const services = isServicesLink(link) && hasMega;
                return (
                  <div
                    key={linkKey(link)}
                    onMouseEnter={() => setMegaOpen(services ? true : false)}
                  >
                    <a
                      href={link.href}
                      onClick={(e) => handleNav(e, link.href)}
                      onFocus={() => setMegaOpen(services ? true : false)}
                      data-testid={`link-nav-${link.label}`}
                      aria-haspopup={services ? "true" : undefined}
                      aria-expanded={services ? megaOpen : undefined}
                      aria-controls={services ? "mega-menu" : undefined}
                      className={`relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                        services && megaOpen
                          ? "text-[#007d83]"
                          : "text-gray-600 hover:text-[#007d83]"
                      }`}
                    >
                      {link.label}
                      {services && (
                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform duration-200 ${
                            megaOpen ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </a>
                  </div>
                );
              })}
            </nav>

            {/* Desktop right */}
            <div className="hidden lg:flex items-center gap-3 shrink-0">
              <a
                href={telHref(phone)}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-[#007d83] transition-colors whitespace-nowrap"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
              <Button
                asChild
                className="rounded-lg bg-[#007d83] hover:bg-[#006970] text-white text-sm px-5 h-9"
              >
                <a href="#contacts" onClick={(e) => handleNav(e, "#contacts")}>
                  Записаться
                </a>
              </Button>
              <button
                type="button"
                onClick={() => openSearch()}
                data-testid="button-search-desktop"
                className="flex items-center justify-center h-9 w-9 rounded-lg text-gray-500 hover:text-[#007d83] hover:bg-gray-50 transition-colors"
                aria-label="Поиск"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Mobile controls */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                type="button"
                onClick={() => openSearch()}
                data-testid="button-search-mobile"
                className="flex items-center justify-center h-9 w-9 text-gray-600 hover:text-[#007d83] transition-colors"
                aria-label="Поиск"
              >
                <Search className="h-5 w-5" />
              </button>
              <a
                href={telHref(phone)}
                className="flex items-center justify-center h-9 w-9 text-[#007d83]"
                aria-label="Позвонить"
              >
                <Phone className="h-5 w-5" />
              </a>
              <button
                type="button"
                data-testid="button-mobile-menu"
                className="flex items-center justify-center h-9 w-9 text-gray-600 hover:text-[#007d83] transition-colors"
                onClick={() => setMenuOpen(true)}
                aria-label="Открыть меню"
              >
                <Menu className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop mega menu */}
        <AnimatePresence>
          {megaOpen && hasMega && (
            <motion.div
              key="mega"
              variants={megaVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              id="mega-menu"
              className="hidden lg:block absolute left-0 right-0 top-full border-t border-gray-100 bg-white"
              style={{ boxShadow: "0 28px 50px -18px rgba(15,28,46,0.18)" }}
              data-testid="mega-menu"
            >
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-8">
                  {/* Directions grid */}
                  <div className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-7">
                    {directions.map((dir, i) => {
                      const accent = accentFor(dir.slug, i);
                      const Icon = iconFor(dir.slug);
                      return (
                        <div key={dir.id}>
                          <Link
                            href={directionPath(dir.slug)}
                            onClick={() => setMegaOpen(false)}
                            className="group/cat mb-3 flex items-center gap-2.5"
                            data-testid={`mega-direction-${dir.slug}`}
                          >
                            <span
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors"
                              style={{ background: hex2rgba(accent, 0.1), color: accent }}
                            >
                              <Icon className="h-4 w-4" strokeWidth={2} />
                            </span>
                            <span
                              className="font-semibold text-[15px] text-[#0f1c2e] transition-colors group-hover/cat:text-[color:var(--c)]"
                              style={{ ["--c" as any]: accent }}
                            >
                              {dir.label}
                            </span>
                          </Link>
                          <ul className="space-y-0.5 pl-0.5">
                            {dir.services.slice(0, 6).map((s) => (
                              <li key={s.id}>
                                {s.slug ? (
                                  <Link
                                    href={`/uslugi/${s.slug}`}
                                    onClick={() => setMegaOpen(false)}
                                    className="group/svc flex items-center gap-1.5 rounded-md py-1.5 text-[13px] text-gray-500 transition-colors hover:text-[#007d83]"
                                    data-testid={`mega-service-${s.slug}`}
                                  >
                                    <span className="transition-transform duration-200 group-hover/svc:translate-x-0.5">
                                      {s.name}
                                    </span>
                                  </Link>
                                ) : (
                                  <span className="block py-1.5 text-[13px] text-gray-400">
                                    {s.name}
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {dir.services.length > 6 && (
                            <Link
                              href={directionPath(dir.slug)}
                              onClick={() => setMegaOpen(false)}
                              className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold transition-all hover:gap-1.5"
                              style={{ color: accent }}
                            >
                              Все услуги <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                          {dir.services.length === 0 && (
                            <Link
                              href={directionPath(dir.slug)}
                              onClick={() => setMegaOpen(false)}
                              className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold transition-all hover:gap-1.5"
                              style={{ color: accent }}
                              data-testid={`mega-prices-${dir.slug}`}
                            >
                              Услуги и цены <ArrowRight className="h-3 w-3" />
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Side column */}
                  <div className="col-span-3 flex flex-col gap-5 border-l border-gray-100 pl-8">
                    <Link
                      href="/akcii"
                      onClick={() => setMegaOpen(false)}
                      data-testid="mega-promo"
                      className="group/promo relative overflow-hidden rounded-2xl p-5 text-white transition-transform hover:scale-[1.01]"
                      style={{ background: "linear-gradient(135deg,#007d83 0%,#00b4bd 100%)" }}
                    >
                      <Tag
                        className="pointer-events-none absolute -right-3 -bottom-3 h-24 w-24 text-white/15"
                        strokeWidth={1.5}
                      />
                      <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                        Выгодно
                      </span>
                      <p className="relative z-10 mt-2 text-lg font-semibold leading-snug">
                        Акции и спецпредложения
                      </p>
                      <span className="relative z-10 mt-3 inline-flex items-center gap-1 text-[13px] font-medium transition-all group-hover/promo:gap-2">
                        Смотреть все <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </Link>

                    <div className="flex flex-col gap-1">
                      {secondaryLinks.map((link) => (
                        <a
                          key={linkKey(link)}
                          href={link.href}
                          onClick={(e) => handleNav(e, link.href)}
                          className="flex items-center gap-1.5 py-1.5 text-[13px] text-gray-500 transition-colors hover:text-[#007d83]"
                          data-testid={`mega-secondary-${link.label}`}
                        >
                          <ChevronRight className="h-3 w-3 text-gray-300" />
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Full-screen mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 z-[59] lg:hidden bg-black/20 backdrop-blur-sm"
              onClick={close}
            />

            <motion.div
              key="panel"
              variants={panelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-x-0 top-0 z-[60] lg:hidden flex flex-col bg-white"
              style={{ maxHeight: "100dvh" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
                <a
                  href="/"
                  onClick={(e) => handleNav(e, "/", true)}
                  className="flex items-center gap-2.5 select-none"
                >
                  <Logo size={32} />
                  <div className="flex flex-col leading-none gap-[3px]">
                    <span
                      className="font-semibold text-[#0f1c2e] text-[15px] uppercase"
                      style={{ letterSpacing: "0.18em" }}
                    >
                      {brandName}
                    </span>
                    <span
                      className="text-[#007d83] text-[8px] uppercase font-medium"
                      style={{ letterSpacing: "0.2em" }}
                    >
                      {brandTagline}
                    </span>
                  </div>
                </a>
                <motion.button
                  type="button"
                  data-testid="button-mobile-menu-close"
                  onClick={close}
                  whileTap={{ scale: 0.9 }}
                  className="flex items-center justify-center h-9 w-9 text-gray-500 hover:text-[#007d83] transition-colors"
                  aria-label="Закрыть меню"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Scrollable body */}
              <div className="flex-1 overflow-y-auto flex flex-col justify-between px-4 py-2">
                <motion.nav variants={listVariants} initial="hidden" animate="visible">
                  {navLinks.map((link) => {
                    const services = isServicesLink(link) && hasMega;

                    if (services) {
                      return (
                        <motion.div key={linkKey(link)} variants={itemVariants}>
                          <button
                            type="button"
                            onClick={() => setMobileServicesOpen((v) => !v)}
                            data-testid="link-mobile-nav-services"
                            className="flex w-full items-center justify-between py-4 text-xl font-medium text-[#0f1c2e] border-b border-gray-100 transition-colors hover:text-[#007d83]"
                          >
                            {link.label}
                            <ChevronDown
                              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                                mobileServicesOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {mobileServicesOpen && (
                              <motion.div
                                key="m-services"
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="py-1">
                                  {directions.map((dir, i) => {
                                    const accent = accentFor(dir.slug, i);
                                    const Icon = iconFor(dir.slug);
                                    const open = mobileDirId === dir.id;
                                    return (
                                      <div key={dir.id} className="border-b border-gray-50">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setMobileDirId((cur) => (cur === dir.id ? null : dir.id))
                                          }
                                          data-testid={`mobile-direction-${dir.slug}`}
                                          className="flex w-full items-center gap-3 py-3"
                                        >
                                          <span
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                            style={{ background: hex2rgba(accent, 0.1), color: accent }}
                                          >
                                            <Icon className="h-4 w-4" strokeWidth={2} />
                                          </span>
                                          <span className="flex-1 text-left text-base font-medium text-[#0f1c2e]">
                                            {dir.label}
                                          </span>
                                          <ChevronDown
                                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                              open ? "rotate-180" : ""
                                            }`}
                                          />
                                        </button>

                                        <AnimatePresence initial={false}>
                                          {open && (
                                            <motion.div
                                              key={`d-${dir.id}`}
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: "auto", opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
                                              className="overflow-hidden"
                                            >
                                              <ul className="pb-3 pl-11">
                                                <li>
                                                  <Link
                                                    href={directionPath(dir.slug)}
                                                    onClick={close}
                                                    className="flex items-center gap-1.5 py-2 text-sm font-semibold"
                                                    style={{ color: accent }}
                                                  >
                                                    Все услуги направления
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                  </Link>
                                                </li>
                                                {dir.services.map((s) =>
                                                  s.slug ? (
                                                    <li key={s.id}>
                                                      <Link
                                                        href={`/uslugi/${s.slug}`}
                                                        onClick={close}
                                                        className="block py-2 text-sm text-gray-500 transition-colors hover:text-[#007d83]"
                                                        data-testid={`mobile-service-${s.slug}`}
                                                      >
                                                        {s.name}
                                                      </Link>
                                                    </li>
                                                  ) : (
                                                    <li key={s.id} className="py-2 text-sm text-gray-400">
                                                      {s.name}
                                                    </li>
                                                  )
                                                )}
                                              </ul>
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    );
                                  })}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.a
                        key={linkKey(link)}
                        href={link.href}
                        onClick={(e) => handleNav(e, link.href, true)}
                        variants={itemVariants}
                        data-testid={`link-mobile-nav-${link.label}`}
                        className="flex items-center py-4 text-xl font-medium text-[#0f1c2e] border-b border-gray-100 hover:text-[#007d83] transition-colors"
                      >
                        {link.label}
                      </motion.a>
                    );
                  })}
                </motion.nav>

                {/* Secondary + bottom */}
                <motion.div variants={bottomVariants} initial="hidden" animate="visible" className="mt-6">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-8">
                    {secondaryLinks.map((link) => (
                      <a
                        key={linkKey(link)}
                        href={link.href}
                        onClick={(e) => handleNav(e, link.href, true)}
                        className="text-sm text-gray-500 hover:text-[#007d83] transition-colors"
                      >
                        {link.label}
                      </a>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3 border-t border-gray-100 pt-5 pb-6">
                    <a href={telHref(phone)} className="text-lg font-semibold text-[#007d83]">
                      {phone}
                    </a>
                    <Button
                      asChild
                      className="w-full rounded-lg bg-[#007d83] hover:bg-[#006970] text-white h-12 text-base"
                    >
                      <a href="#contacts" onClick={(e) => handleNav(e, "#contacts", true)}>
                        Записаться на приём
                      </a>
                    </Button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
