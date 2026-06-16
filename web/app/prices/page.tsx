import type { Metadata } from "next";
import PricesClient, { type PriceCategory } from "./PricesClient";
import { apiGet } from "../lib/api";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

const title = "Цены на услуги";
const description =
  "Прозрачный прайс-лист медицинского центра «Медео»: стоимость приёмов, УЗИ, анализов и процедур. Без скрытых платежей.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/prices" },
  openGraph: pageOpenGraph({ title, description, path: "/prices" }),
};

export default async function Page() {
  const [initialPrices, initialSettings] = await Promise.all([
    apiGet<PriceCategory[]>("/api/prices"),
    apiGet<Record<string, any>>("/api/settings"),
  ]);

  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Главная", path: "/" },
          { name: "Цены", path: "/prices" },
        ])}
      />
      <PricesClient initialPrices={initialPrices} initialSettings={initialSettings} />
    </>
  );
}
