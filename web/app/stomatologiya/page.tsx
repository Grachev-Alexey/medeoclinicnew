import type { Metadata } from "next";
import ServiceLandingClient from "../_components/ServiceLandingClient";
import { stomatologyLanding } from "../_components/service-landing-data";
import { apiGet } from "../lib/api";
import { JsonLd } from "../_components/JsonLd";
import { breadcrumbLd, faqLd, pageOpenGraph } from "../lib/seo";

const data = stomatologyLanding;

export const metadata: Metadata = {
  title: data.metaTitle,
  description: data.metaDescription,
  alternates: { canonical: data.path },
  openGraph: pageOpenGraph({
    title: data.metaTitle,
    description: data.metaDescription,
    path: data.path,
  }),
};

export default async function Page() {
  const initialSettings = await apiGet<Record<string, any>>("/api/settings");

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: data.breadcrumb, path: data.path },
          ]),
          faqLd(data.faq),
        ]}
      />
      <ServiceLandingClient slug={data.slug} initialSettings={initialSettings} />
    </>
  );
}
