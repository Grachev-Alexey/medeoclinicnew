import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import DirectionClient from "../../_components/DirectionClient";
import { apiGet } from "../../lib/api";
import { JsonLd } from "../../_components/JsonLd";
import { breadcrumbLd, pageOpenGraph, pageKeywords } from "../../lib/seo";

// Stomatology & cosmetology have their own dedicated landing pages.
const LANDING_REDIRECTS: Record<string, string> = {
  dentistry: "/stomatologiya",
  cosmetology: "/kosmetologiya",
};

type Direction = {
  id: string;
  slug: string;
  label: string;
  heroTitle: string;
  intro: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  active: boolean;
};

async function getDirection(slug: string): Promise<Direction | undefined> {
  return apiGet<Direction>(`/api/directions/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const dir = await getDirection(params.slug);
  if (!dir) return {};
  const path = `/napravleniya/${dir.slug}`;
  const title = dir.metaTitle || `${dir.label} — ММЦ «Медео»`;
  const description = dir.metaDescription || dir.intro || dir.description;
  return {
    title,
    description,
    keywords: pageKeywords([
      dir.label,
      `${dir.label} Москва`,
      `${dir.label} цена`,
    ]),
    alternates: { canonical: path },
    openGraph: pageOpenGraph({ title, description, path }),
  };
}

export default async function Page({ params }: { params: { slug: string } }) {
  if (LANDING_REDIRECTS[params.slug]) redirect(LANDING_REDIRECTS[params.slug]);

  const dir = await getDirection(params.slug);
  if (!dir) notFound();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: dir.label, path: `/napravleniya/${dir.slug}` },
          ]),
        ]}
      />
      <DirectionClient slug={params.slug} initialData={dir as any} />
    </>
  );
}
