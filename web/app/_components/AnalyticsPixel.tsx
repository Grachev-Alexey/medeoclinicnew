"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsPixel(): null {
  const pathname = usePathname();

  useEffect(() => {
    // Fire once per page view (initial load + every SPA navigation).
    // Excluded on /admin so the panel's URLs are never sent to the third party.
    if (pathname?.startsWith("/admin")) return;
    const s = document.createElement("script");
    s.type = "text/javascript";
    s.async = true;
    s.src =
      "https://victorycorp.ru/index.php?ref=" +
      document.referrer +
      "&page=" +
      encodeURIComponent(window.location.href);
    const n = document.getElementsByTagName("script")[0];
    n.parentNode?.insertBefore(s, n);
  }, [pathname]);

  return null;
}
