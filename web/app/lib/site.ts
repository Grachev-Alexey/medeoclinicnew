/**
 * Central site identity for SEO (canonical URLs, Open Graph, sitemap, JSON-LD).
 * The production domain is configurable via NEXT_PUBLIC_SITE_URL (set it on the
 * VPS); it defaults to the live domain so builds are correct out of the box.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://medeo-mmc.ru"
).replace(/\/+$/, "");

export const SITE_NAME = "ММЦ «МЕДЕО»";

export const SITE_DESCRIPTION =
  "Многопрофильный медицинский центр «Медео» в Москве. Доказательная медицина: гинекология, репродуктология, педиатрия, врачи-эксперты, прозрачные цены. Запись на приём.";

export const OG_IMAGE = "/image/og-cover.png";

/**
 * Site-wide default meta keywords. The keywords tag carries little SEO weight
 * (Google ignores it, Yandex effectively too), but is kept for audit/legacy
 * completeness. Applied via the root layout, so every page inherits it; detail
 * pages prepend content-specific terms via `pageKeywords()`.
 */
export const BASE_KEYWORDS = [
  "медицинский центр Москва",
  "ММЦ Медео",
  "клиника доказательной медицины",
  "запись к врачу",
  "приём врача",
  "платная клиника Москва",
  "гинекология",
  "репродуктология",
  "педиатрия",
  "стоматология",
  "косметология",
  "УЗИ",
  "анализы",
  "консультация врача",
];

export const absoluteUrl = (path = "/"): string =>
  `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

/**
 * Directions that have a dedicated landing page instead of the generic
 * /napravleniya/[slug] template. Keep this map in sync with the server-side
 * one in routes.ts (search-index) and the redirects in the [slug] route.
 */
export const DIRECTION_LANDINGS: Record<string, string> = {
  dentistry: "/stomatologiya",
  cosmetology: "/kosmetologiya",
};

/** Canonical path to a direction page, accounting for dedicated landings. */
export const directionPath = (slug: string): string =>
  DIRECTION_LANDINGS[slug] ?? `/napravleniya/${slug}`;
