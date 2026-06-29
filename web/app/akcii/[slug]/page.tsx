import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PromotionClient from "../../_components/PromotionClient";
import { apiGet } from "../../lib/api";
import { JsonLd } from "../../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph, pageKeywords } from "../../lib/seo";

type Promotion = {
  id: string;
  slug: string;
  title: string;
  description: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  active: boolean;
};

async function getPromotion(slug: string): Promise<Promotion | undefined> {
  return apiGet<Promotion>(`/api/promotions/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const promo = await getPromotion(params.slug);
  if (!promo) return {};
  const path = `/akcii/${promo.slug}`;
  const title = promo.metaTitle || `${promo.title} — ММЦ «Медео»`;
  const description = promo.metaDescription || promo.intro || promo.description;
  return {
    title,
    description,
    keywords: pageKeywords([
      promo.title,
      "акции клиника Москва",
      "скидки на медицинские услуги",
    ]),
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const promo = await getPromotion(params.slug);
  if (!promo) notFound();

  const initialSettings = await apiGet<Record<string, any>>("/api/settings");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: "Акции", path: "/akcii" },
            { name: promo.title, path: `/akcii/${promo.slug}` },
          ]),
        ]}
      />
      <PromotionClient slug={params.slug} initialData={promo as any} initialSettings={initialSettings} />
    </>
  );
}
