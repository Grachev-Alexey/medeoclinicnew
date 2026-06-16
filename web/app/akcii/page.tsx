import type { Metadata } from "next";
import PromotionsListClient from "../_components/PromotionsListClient";
import { apiGet } from "../lib/api";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph } from "../lib/seo";

type Promotion = {
  id: string;
  slug: string;
  title: string;
  badge: string;
  date: string;
  description: string;
  imageUrl: string;
};

const TITLE = "Акции и спецпредложения — ММЦ «Медео»";
const DESCRIPTION =
  "Действующие акции и скидки медицинского центра «Медео»: обследования, косметология, комплексные программы. Запишитесь онлайн.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/akcii" },
  openGraph: pageOpenGraph({ title: TITLE, description: DESCRIPTION, path: "/akcii" }),
};

export default async function Page() {
  const promotions = (await apiGet<Promotion[]>("/api/promotions")) ?? [];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: "Акции", path: "/akcii" },
          ]),
        ]}
      />
      <PromotionsListClient initialData={promotions} />
    </>
  );
}
