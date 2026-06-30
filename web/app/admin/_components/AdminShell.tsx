"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Stethoscope,
  Layers,
  Activity,
  Receipt,
  Image,
  BadgePercent,
  ShieldCheck,
  BookHeart,
  Menu as MenuIcon,
  Settings,
  LogOut,
  ExternalLink,
  X,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const navItems = [
  { href: "/admin/doctors", label: "Врачи", icon: Stethoscope },
  { href: "/admin/directions", label: "Направления", icon: Layers },
  { href: "/admin/services", label: "Услуги", icon: Activity },
  { href: "/admin/catalog", label: "Прайс-лист", icon: Receipt },
  { href: "/admin/media", label: "Медиа", icon: Image },
  { href: "/admin/myths", label: "Мифы", icon: ShieldCheck },
  { href: "/admin/promotions", label: "Акции", icon: BadgePercent },
  { href: "/admin/stories", label: "Истории клиники", icon: BookHeart },
  { href: "/admin/benefits", label: "Преимущества", icon: ShieldCheck },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();
  const [navOpen, setNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const asideRef = useRef<HTMLElement>(null);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  // Track the desktop breakpoint; collapse the drawer state when we cross into desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setIsDesktop(mq.matches);
      if (mq.matches) setNavOpen(false);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Lock body scroll only while the mobile drawer is open (never on desktop).
  useEffect(() => {
    if (navOpen && !isDesktop) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [navOpen, isDesktop]);

  // Close the drawer with the Escape key.
  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  // Keep the off-canvas drawer out of the a11y tree / focus order when hidden on mobile.
  useEffect(() => {
    const el = asideRef.current;
    if (!el) return;
    const hidden = !isDesktop && !navOpen;
    if (hidden) {
      el.setAttribute("inert", "");
      el.setAttribute("aria-hidden", "true");
    } else {
      el.removeAttribute("inert");
      el.removeAttribute("aria-hidden");
    }
  }, [navOpen, isDesktop]);

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    router.replace("/admin/login");
  };

  const isActive = (item: (typeof navItems)[number]) =>
    pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#0f1c2e] px-4 py-3 text-white lg:hidden">
        <button
          onClick={() => setNavOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={navOpen}
          aria-controls="admin-sidebar"
          data-testid="button-admin-menu-open"
          className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-white/10"
        >
          <MenuIcon className="h-5 w-5" />
          Меню
        </button>
        <p className="text-base font-semibold">МЕДЕО</p>
        <a href="/" target="_blank" rel="noreferrer" aria-label="Открыть сайт" className="rounded-lg p-1.5 hover:bg-white/10">
          <ExternalLink className="h-5 w-5" />
        </a>
      </header>

      {/* Backdrop (mobile only) */}
      {navOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setNavOpen(false)}
          aria-hidden
        />
      )}

      <aside
        ref={asideRef}
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[82%] flex-col bg-[#0f1c2e] text-white transition-transform duration-300 ease-out lg:w-60 lg:translate-x-0 ${
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div>
            <p className="text-lg font-semibold">МЕДЕО</p>
            <p className="text-xs text-white/50">Панель управления</p>
          </div>
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Закрыть меню"
            data-testid="button-admin-menu-close"
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  active ? "bg-white/15 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
                data-testid={`nav-${item.href.replace(/\//g, "-")}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="space-y-1 border-t border-white/10 px-3 py-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" /> Открыть сайт
          </a>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" /> Выйти
          </button>
        </div>
      </aside>

      <main className="p-4 sm:p-6 lg:ml-60 lg:p-8">{children}</main>
    </div>
  );
}
