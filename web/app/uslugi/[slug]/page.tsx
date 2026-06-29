import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ServiceClient from "../../_components/ServiceClient";
import { apiGet } from "../../lib/api";
import { JsonLd } from "../../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph, pageKeywords } from "../../lib/seo";
import { directionPath } from "../../lib/site";

type Direction = { id: string; slug: string; label: string };
type Service = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  active: boolean;
  direction: Direction;
};

async function getService(slug: string): Promise<Service | undefined> {
  return apiGet<Service>(`/api/services/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const svc = await getService(params.slug);
  if (!svc) return {};
  const path = `/uslugi/${svc.slug}`;
  const title = svc.metaTitle || `${svc.name} — ММЦ «Медео»`;
  const description = svc.metaDescription || svc.shortDescription;
  return {
    title,
    description,
    keywords: pageKeywords([
      svc.name,
      `${svc.name} Москва`,
      `${svc.name} цена`,
      svc.direction?.label,
    ]),
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { from?: string };
}) {
  const svc = await getService(params.slug);
  if (!svc) notFound();

  const initialSettings = await apiGet<Record<string, any>>("/api/settings");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            ...(svc.direction?.slug
              ? [{ name: svc.direction.label, path: directionPath(svc.direction.slug) }]
              : []),
            { name: svc.name, path: `/uslugi/${svc.slug}` },
          ]),
        ]}
      />
      <ServiceClient slug={params.slug} from={searchParams.from} initialData={svc as any} initialSettings={initialSettings} />
    </>
  );
}
