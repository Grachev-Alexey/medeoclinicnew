import { apiGet } from "./api";
import { SITE_URL } from "./site";
import type { LegalVars } from "../_components/LegalPage";

const FALLBACK: LegalVars = {
  operator: "ООО Медицинский центр «МЕДЕО»",
  license: "№ ЛО-77-01-020186 от 3 августа 2020 года",
  address: "г. Москва, ул. 6-я Радиальная, 5, корп. 2",
  phone: "+7 (991) 300-95-05",
  site: SITE_URL.replace(/^https?:\/\//, ""),
};

/**
 * Build the operator requisites used inside legal documents from the
 * admin-editable site settings, falling back to the seeded defaults when the
 * API is unreachable. Called server-side so values are baked into the HTML.
 */
export async function getLegalVars(): Promise<LegalVars> {
  const settings = await apiGet<Record<string, any>>("/api/settings");
  const contacts = settings?.contacts ?? {};
  const phones: string[] = Array.isArray(contacts.phones) ? contacts.phones : [];
  return {
    operator: contacts.entity || FALLBACK.operator,
    license: contacts.license || FALLBACK.license,
    address: contacts.address || FALLBACK.address,
    phone: phones[0] || FALLBACK.phone,
    site: FALLBACK.site,
  };
}
