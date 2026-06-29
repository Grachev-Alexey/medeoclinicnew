import { SITE_NAME, SITE_URL, OG_IMAGE, absoluteUrl, BASE_KEYWORDS } from "./site";

/** Merge page-specific keyword terms with the site-wide base set (deduped). */
export function pageKeywords(
  extra: Array<string | undefined | null> = [],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const kw of [...extra, ...BASE_KEYWORDS]) {
    const value = (kw ?? "").trim();
    if (!value) continue;
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(value);
  }
  return out;
}

const DAY_MAP: Record<string, string> = {
  Пн: "Monday",
  Вт: "Tuesday",
  Ср: "Wednesday",
  Чт: "Thursday",
  Пт: "Friday",
  Сб: "Saturday",
  Вс: "Sunday",
  Понедельник: "Monday",
  Вторник: "Tuesday",
  Среда: "Wednesday",
  Четверг: "Thursday",
  Пятница: "Friday",
  Суббота: "Saturday",
  Воскресенье: "Sunday",
};
const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function mapDay(label: string): string | undefined {
  return DAY_MAP[label.trim()];
}

/** Convert ["Пн–Пт", "Суббота"] day labels into schema.org dayOfWeek arrays. */
function parseDays(daysLabel: string): string[] {
  const parts = daysLabel.split(/[–—-]/).map((s) => s.trim());
  if (parts.length === 2) {
    const start = mapDay(parts[0]);
    const end = mapDay(parts[1]);
    if (start && end) {
      const i = WEEK_ORDER.indexOf(start);
      const j = WEEK_ORDER.indexOf(end);
      if (i !== -1 && j !== -1 && i <= j) return WEEK_ORDER.slice(i, j + 1);
    }
  }
  const single = mapDay(daysLabel);
  return single ? [single] : [];
}

function buildOpeningHours(schedule: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(schedule)) return [];
  const out: Array<Record<string, unknown>> = [];
  for (const entry of schedule) {
    const days = parseDays(String(entry?.days ?? ""));
    const hours = String(entry?.hours ?? "");
    const [opens, closes] = hours.split(/[–—-]/).map((s) => s.trim());
    if (days.length && opens && closes) {
      out.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: days,
        opens,
        closes,
      });
    }
  }
  return out;
}

/** MedicalClinic structured data built from the editable site settings. */
export function organizationLd(settings?: any) {
  const contacts = settings?.contacts ?? {};
  const rating = settings?.rating ?? {};
  const phones: string[] = Array.isArray(contacts.phones) ? contacts.phones : [];
  const reviewCount = String(rating.count ?? "").replace(/\D/g, "");

  const ld: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    "@id": `${SITE_URL}/#clinic`,
    name: SITE_NAME,
    url: SITE_URL,
    image: absoluteUrl(OG_IMAGE),
    logo: absoluteUrl("/favicon-192.png"),
    priceRange: "₽₽",
    areaServed: "Москва",
    medicalSpecialty: ["Gynecologic", "Pediatric", "Urologic"],
  };

  if (contacts.entity) ld.legalName = contacts.entity;
  if (phones[0]) ld.telephone = phones[0];
  if (phones.length) {
    ld.contactPoint = phones.map((p) => ({
      "@type": "ContactPoint",
      telephone: p,
      contactType: "reception",
      areaServed: "RU",
      availableLanguage: "Russian",
    }));
  }
  if (contacts.address) {
    ld.address = {
      "@type": "PostalAddress",
      streetAddress: contacts.address,
      addressLocality: "Москва",
      addressCountry: "RU",
    };
  }

  const opening = buildOpeningHours(contacts.schedule);
  if (opening.length) ld.openingHoursSpecification = opening;

  if (rating.value && reviewCount) {
    ld.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: String(rating.value),
      reviewCount,
    };
  }
  return ld;
}

/**
 * Per-page Open Graph block. Next.js does NOT inherit the parent's
 * openGraph.images when a page defines its own openGraph, so the image must be
 * repeated here (absolute URL to resolve correctly for crawlers).
 */
export function pageOpenGraph(opts: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    title: opts.title,
    description: opts.description,
    url: opts.path,
    images: [
      { url: absoluteUrl(OG_IMAGE), width: 1200, height: 630, alt: SITE_NAME },
    ],
  };
}

export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ru-RU",
    publisher: { "@id": `${SITE_URL}/#clinic` },
  };
}

export function faqLd(items: Array<{ q: string; a: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}

export function breadcrumbLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
