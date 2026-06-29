import { HeroPromoCarousel } from "./HeroPromoCarousel";

const BG = "#f7f9f9";

export const PromotionsSection = (): JSX.Element => (
  <section className="w-full overflow-hidden" style={{ backgroundColor: BG }}>
    <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-12">
      <HeroPromoCarousel fallbackImage="/image/hero.webp" />
    </div>
  </section>
);
