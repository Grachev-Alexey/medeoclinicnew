"use client";

import { useQueries } from "@tanstack/react-query";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { SiteMobileNav } from "./SiteMobileNav";
import { HeroSection } from "@/pages/sections/HeroSection";
import { BenefitHighlightsSection } from "@/pages/sections/BenefitHighlightsSection";
import { ClinicContactsSection } from "@/pages/sections/ClinicContactsSection";
import { DoctorProfilesSection } from "@/pages/sections/DoctorProfilesSection";
import { HeroWelcomeSection } from "@/pages/sections/HeroWelcomeSection";
import { MythBusterSection } from "@/pages/sections/MythBusterSection";
import { ServiceOverviewSection } from "@/pages/sections/ServiceOverviewSection";

type HomeClientProps = {
  initialSettings?: Record<string, any>;
  initialNavLinks?: any[];
  initialStats?: any[];
  initialReviews?: any[];
  initialDoctors?: any[];
  initialBenefits?: any[];
  initialPromotions?: any[];
  initialDirections?: any[];
  initialMyths?: any[];
};

export default function HomeClient({
  initialSettings,
  initialNavLinks,
  initialStats,
  initialReviews,
  initialDoctors,
  initialBenefits,
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
      { queryKey: ["/api/stats"], initialData: initialStats },
      { queryKey: ["/api/reviews"], initialData: initialReviews },
      { queryKey: ["/api/doctors"], initialData: initialDoctors },
      { queryKey: ["/api/benefits"], initialData: initialBenefits },
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
          <HeroSection />
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
        <DoctorProfilesSection />
        <div id="contacts">
          <ClinicContactsSection />
        </div>
      </main>
      <SiteFooter />
      <SiteMobileNav />
    </div>
  );
}
