import HomeClient from "./_components/HomeClient";
import { apiGet } from "./lib/api";
import { JsonLd } from "./_components/JsonLd";
import { organizationLd, websiteLd } from "./lib/seo";

export default async function Page() {
  const [
    initialSettings,
    initialNavLinks,
    initialStats,
    initialReviews,
    initialDoctors,
    initialBenefits,
    initialPromotions,
    initialDirections,
    initialMyths,
  ] = await Promise.all([
    apiGet<Record<string, any>>("/api/settings"),
    apiGet<any[]>("/api/nav-links"),
    apiGet<any[]>("/api/stats"),
    apiGet<any[]>("/api/reviews"),
    apiGet<any[]>("/api/doctors"),
    apiGet<any[]>("/api/benefits"),
    apiGet<any[]>("/api/promotions"),
    apiGet<any[]>("/api/directions"),
    apiGet<any[]>("/api/myths"),
  ]);

  return (
    <>
      <JsonLd data={[organizationLd(initialSettings), websiteLd()]} />
      <HomeClient
      initialSettings={initialSettings}
      initialNavLinks={initialNavLinks}
      initialStats={initialStats}
      initialReviews={initialReviews}
      initialDoctors={initialDoctors}
      initialBenefits={initialBenefits}
      initialPromotions={initialPromotions}
      initialDirections={initialDirections}
      initialMyths={initialMyths}
      />
    </>
  );
}
