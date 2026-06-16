"use client";

import { useState } from "react";
import { useGo } from "../lib/use-go";
import { openSearch } from "./SearchOverlay";
import { useBooking } from "./BookingProvider";

const navItems = [
  {
    label: "Акции",
    target: "/akcii",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: "Врачи",
    target: "/vrachi",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a5 5 0 1 0 0 10A5 5 0 0 0 12 2z" />
        <path d="M12 14c-5.33 0-8 2.67-8 4v1h16v-1c0-1.33-2.67-4-8-4z" />
        <path d="M15 18v3M13.5 19.5h3" />
      </svg>
    ),
  },
  {
    label: "Запись",
    target: "",
    booking: true,
    icon: (_active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
    primary: true,
  },
  {
    label: "Услуги",
    target: "/prices",
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    label: "Поиск",
    target: "",
    action: openSearch,
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
    ),
  },
];

export const SiteMobileNav = (): JSX.Element => {
  const [active, setActive] = useState("");
  const go = useGo();
  const booking = useBooking();

  function handleClick(item: typeof navItems[number]) {
    if ("booking" in item && item.booking) {
      booking.open();
      return;
    }
    if ("action" in item && typeof item.action === "function") {
      item.action();
      return;
    }
    setActive(item.label);
    go(item.target);
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around border-t border-gray-100 bg-white/95 backdrop-blur-lg px-2 pb-safe"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      {navItems.map((item) => {
        const isActive = active === item.label;

        if (item.primary) {
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleClick(item)}
              className="flex flex-col items-center gap-1 py-3 px-4"
              data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#007d83] shadow-lg shadow-[#007d83]/30 -mt-5">
                {item.icon(isActive)}
              </div>
              <span className="text-[10px] font-medium text-[#007d83] mt-0.5">{item.label}</span>
            </button>
          );
        }

        return (
          <button
            key={item.label}
            type="button"
            onClick={() => handleClick(item)}
            className="flex flex-col items-center gap-1 py-3 px-4 transition-colors"
            data-testid={`mobile-nav-${item.label.toLowerCase()}`}
            style={{ color: isActive ? "#007d83" : "#9ca3af" }}
          >
            <div className="relative">
              {item.icon(isActive)}
              {isActive && (
                <span
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-[#007d83]"
                />
              )}
            </div>
            <span
              className="text-[10px] font-medium transition-colors"
              style={{ color: isActive ? "#007d83" : "#9ca3af" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
