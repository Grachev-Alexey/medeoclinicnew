"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Stethoscope,
  Layers,
  Receipt,
  Image,
  MessageSquareQuote,
  BadgePercent,
  ShieldCheck,
  BarChart3,
  Menu as MenuIcon,
  Settings,
  LogOut,
  ExternalLink,
  Inbox,
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const navItems = [
  { href: "/admin", label: "Обзор", icon: LayoutDashboard, exact: true },
  { href: "/admin/bookings", label: "Заявки", icon: Inbox },
  { href: "/admin/doctors", label: "Врачи", icon: Stethoscope },
  { href: "/admin/directions", label: "Направления", icon: Layers },
  { href: "/admin/catalog", label: "Услуги и цены", icon: Receipt },
  { href: "/admin/media", label: "Медиа", icon: Image },
  { href: "/admin/myths", label: "Мифы", icon: ShieldCheck },
  { href: "/admin/reviews", label: "Отзывы", icon: MessageSquareQuote },
  { href: "/admin/promotions", label: "Акции", icon: BadgePercent },
  { href: "/admin/benefits", label: "Преимущества", icon: ShieldCheck },
  { href: "/admin/stats", label: "Статистика", icon: BarChart3 },
  { href: "/admin/nav-links", label: "Меню", icon: MenuIcon },
  { href: "/admin/settings", label: "Настройки", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    router.replace("/admin/login");
  };

  const isActive = (item: (typeof navItems)[number]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 flex w-60 flex-col bg-[#0f1c2e] text-white">
        <div className="px-5 py-5">
          <p className="text-lg font-semibold">МЕДЕО</p>
          <p className="text-xs text-white/50">Панель управления</p>
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
      <main className="ml-60 flex-1 p-8">{children}</main>
    </div>
  );
}
