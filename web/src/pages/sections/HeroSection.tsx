import { ArrowRight, Phone } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { HeroPromoCarousel } from "./HeroPromoCarousel";

const BG = "#f7f9f9";

const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

export const HeroSection = (): JSX.Element => {
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });
  const { data: stats = [] } = useQuery<{ value: string; label: string }[]>({ queryKey: ["/api/stats"] });

  const hero = settings?.hero ?? {};
  const phone = settings?.contacts?.phones?.[0] ?? "+7 (991) 300-95-05";

  return (
    <section className="w-full overflow-hidden" style={{ backgroundColor: BG }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-stretch lg:min-h-[600px]">

          {/* Left: text */}
          <div className="flex flex-col justify-center order-2 lg:order-1 lg:w-[44%] px-4 sm:px-8 lg:pl-12 xl:pl-16 lg:pr-8 pt-6 pb-6 lg:py-16">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#007d83] mb-5" data-testid="text-hero-tagline">
              {hero.tagline ?? "Клиника доказательной медицины"}
            </p>
            <h1 className="text-[1.9rem] sm:text-[2.2rem] lg:text-[2.6rem] xl:text-[3rem] font-bold text-[#0f1c2e] leading-[1.15] tracking-tight mb-5" data-testid="text-hero-headline">
              {hero.headline ?? "Медицина без лишних анализов и пугающих диагнозов"}
            </h1>
            <p className="text-[15px] lg:text-base text-gray-500 leading-relaxed mb-8 max-w-[440px]">
              {hero.subheadline ?? "Назначаем только препараты с доказанной эффективностью. Бережно относимся к вашему времени и бюджету."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Button
                asChild
                className="rounded-lg bg-[#007d83] hover:bg-[#006970] text-white text-sm px-6 h-12 font-medium gap-2 shadow-[0_4px_14px_rgba(0,125,131,0.35)]"
              >
                <a href="#contacts">
                  Записаться на приём
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
              <Button
                asChild
                variant="ghost"
                className="rounded-lg text-[#0f1c2e] hover:bg-white hover:text-[#007d83] text-sm px-6 h-12 font-medium border border-gray-200 bg-white"
              >
                <a href={telHref(phone)} className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {phone}
                </a>
              </Button>
            </div>
            <div className="hidden lg:flex items-center gap-6 pt-6 border-t border-gray-200">
              {stats.map((s, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-lg font-bold text-[#0f1c2e] leading-none">{s.value}</span>
                  <span className="text-xs text-gray-400 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: promotions carousel */}
          <div className="order-1 lg:order-2 lg:flex-1 flex items-center px-4 sm:px-8 lg:pl-6 lg:pr-12 xl:pr-16 pt-6 pb-2 lg:py-12">
            <HeroPromoCarousel fallbackImage={hero.imageUrl || "/image/hero.webp"} />
          </div>

        </div>
      </div>
    </section>
  );
};
