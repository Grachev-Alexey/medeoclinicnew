"use client";

import { useQueries } from "@tanstack/react-query";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { PromotionsSection } from "@/reused-pages/sections/PromotionsSection";
import { BenefitHighlightsSection } from "@/reused-pages/sections/BenefitHighlightsSection";
import { ClinicContactsSection } from "@/reused-pages/sections/ClinicContactsSection";
import { ReviewsSection } from "@/reused-pages/sections/ReviewsSection";
import { HeroWelcomeSection } from "@/reused-pages/sections/HeroWelcomeSection";
import { MythBusterSection } from "@/reused-pages/sections/MythBusterSection";
import { ServiceOverviewSection } from "@/reused-pages/sections/ServiceOverviewSection";

type HomeClientProps = {
  initialSettings?: Record<string, any>;
  initialNavLinks?: any[];
  initialDoctors?: any[];
  initialBenefits?: any[];
  initialStories?: any[];
  initialPromotions?: any[];
  initialDirections?: any[];
  initialMyths?: any[];
};

export default function HomeClient({
  initialSettings,
  initialNavLinks,
  initialDoctors,
  initialBenefits,
  initialStories,
  initialPromotions,
  initialDirections,
  initialMyths,
}: HomeClientProps): JSX.Element {
  // Seed the shared React Query cache from server-fetched data BEFORE the child
  // sections render. Because this parent runs first, every nested section reading
  // the same query key gets the data during SSR — so it lands in the initial HTML.
  useQueries({
    queries: [
      { queryKey: ["/api/settings"], initialData: initialSettings },
      { queryKey: ["/api/nav-links"], initialData: initialNavLinks },
      { queryKey: ["/api/doctors"], initialData: initialDoctors },
      { queryKey: ["/api/benefits"], initialData: initialBenefits },
      { queryKey: ["/api/stories"], initialData: initialStories },
      { queryKey: ["/api/promotions"], initialData: initialPromotions },
      { queryKey: ["/api/directions"], initialData: initialDirections },
      { queryKey: ["/api/myths"], initialData: initialMyths },
    ],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <SiteHeader />
      <main className="pt-16 pb-20 lg:pb-0">
        <div id="promotions">
          <PromotionsSection />
        </div>
        <div id="services">
          <ServiceOverviewSection />
        </div>
        <div id="doctors">
          <HeroWelcomeSection />
        </div>
        <div id="about">
          <BenefitHighlightsSection />
        </div>
        <div id="myths">
          <MythBusterSection />
        </div>
        <ReviewsSection />
        <div id="contacts">
          <ClinicContactsSection />
        </div>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
