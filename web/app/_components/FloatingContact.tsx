"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { usePathname } from "next/navigation";
import { Phone, Mail, X, Headset } from "lucide-react";
import { SiTelegram } from "react-icons/si";

/* Контакты виджета. Телефоны дублируют site settings; Telegram и почта пока
   живут только здесь (в settings таких полей нет). При необходимости вынести
   в админку — отдельная задача. */
type Item = {
  label: string;
  value: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  bg: string;
  external?: boolean;
};

const ITEMS: Item[] = [
  {
    label: "Мобильный",
    value: "+7 (991) 300-95-05",
    href: "tel:+79913009505",
    icon: Phone,
    iconColor: "#005eb8",
    bg: "#eef4fc",
  },
  {
    label: "Городской",
    value: "+7 (495) 198-05-08",
    href: "tel:+74951980508",
    icon: Phone,
    iconColor: "#005eb8",
    bg: "#eef4fc",
  },
  {
    label: "Telegram",
    value: "@mmc_medeo",
    href: "https://t.me/mmc_medeo",
    icon: SiTelegram,
    iconColor: "#229ED9",
    bg: "#e6f3fb",
    external: true,
  },
  {
    label: "Почта",
    value: "info@medeo-mmc.ru",
    href: "mailto:info@medeo-mmc.ru",
    icon: Mail,
    iconColor: "#005eb8",
    bg: "#eef4fc",
  },
];

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Закрывать при переходе на другую страницу.
  useEffect(() => setOpen(false), [pathname]);

  // Не показывать в админ-панели.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div
      ref={ref}
      className="fixed right-4 z-40 flex flex-col items-end bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] sm:right-6 lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
      data-testid="widget-contact"
    >
      {/* Панель с вариантами */}
      <div
        className={`mb-3 w-[min(20rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-20px_rgba(15,28,46,0.45)] ring-1 ring-black/5 transition-all duration-300 ease-out ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-3 scale-95 opacity-0"
        }`}
        role="dialog"
        aria-label="Способы связи"
        aria-hidden={!open}
      >
        <div className="bg-gradient-to-r from-[#005eb8] to-[#2f86dd] px-5 py-4">
          <p className="font-heading text-base font-medium text-white">
            Свяжитесь с нами
          </p>
          <p className="mt-0.5 text-xs text-white/80">
            Выберите удобный способ — ответим в рабочее время
          </p>
        </div>

        <div className="flex flex-col gap-1 p-2.5">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                onClick={() => setOpen(false)}
                data-testid={`link-contact-${item.label}`}
                style={{ transitionDelay: open ? `${80 + i * 55}ms` : "0ms" }}
                className={`group flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-all duration-300 hover:bg-[#eef4fc] ${
                  open ? "translate-x-0 opacity-100" : "translate-x-3 opacity-0"
                }`}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                  style={{ backgroundColor: item.bg, color: item.iconColor }}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-xs font-medium text-[#6b7280]">
                    {item.label}
                  </span>
                  <span className="truncate text-sm font-semibold text-[#0f1c2e]">
                    {item.value}
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Кнопка-триггер */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Закрыть способы связи" : "Открыть способы связи"}
        data-testid="button-contact-toggle"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[#005eb8] text-white shadow-[0_14px_30px_-8px_rgba(0,94,184,0.7)] outline-none transition-all duration-300 hover:bg-[#004a93] hover:-translate-y-0.5 focus-visible:ring-4 focus-visible:ring-[#005eb8]/30 sm:h-16 sm:w-16"
      >
        {!open && (
          <span className="absolute inset-0 animate-ping rounded-full bg-[#005eb8] opacity-20" />
        )}
        <span className="relative transition-transform duration-300">
          {open ? (
            <X className="h-6 w-6 sm:h-7 sm:w-7" />
          ) : (
            <Headset className="h-6 w-6 sm:h-7 sm:w-7" />
          )}
        </span>
      </button>
    </div>
  );
}
