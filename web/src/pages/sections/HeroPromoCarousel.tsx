import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Sparkles } from "lucide-react";

type Promotion = {
  id: string;
  title: string;
  slug: string;
  badge: string;
  date: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
};

/** Длительность показа одного слайда (мс). Синхронизирована с полосками-таймером. */
const SLIDE_MS = 9500;

/** Единая спокойная фирменная палитра — без пёстрой смены цветов между слайдами. */
const ACCENT = "#007d83";
const ACCENT_SOFT = "#e8f4f3";

export const HeroPromoCarousel = ({ fallbackImage }: { fallbackImage: string }): JSX.Element => {
  const { data: all = [] } = useQuery<Promotion[]>({ queryKey: ["/api/promotions"] });
  const featured = all.filter((p) => p.featured);
  const promotions = featured.length ? featured : all;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = promotions.length;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % count), SLIDE_MS);
    return () => clearTimeout(t);
  }, [index, paused, count]);

  // Нет акций — показываем исходное изображение, чтобы герой не «ломался».
  if (count === 0) {
    return (
      <div className="relative w-full overflow-hidden rounded-[28px] aspect-[4/3] lg:aspect-auto lg:h-[460px] shadow-[0_24px_60px_-30px_rgba(15,28,46,0.4)]">
        <img
          src={fallbackImage}
          alt="Врач клиники Медео"
          className="h-full w-full object-cover object-right-top"
          decoding="async"
        />
      </div>
    );
  }

  const safeIndex = Math.min(index, count - 1);
  const promo = promotions[safeIndex];

  const go = (dir: number) => setIndex((i) => (i + dir + count) % count);

  return (
    <div
      className="relative w-full select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      data-testid="hero-promo-carousel"
    >
      <style>{`@keyframes medeoBarFill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>

      {/* Колода: лёгкая глубина в один спокойный тон */}
      {count > 1 && (
        <>
          <div
            aria-hidden
            className="absolute left-1/2 top-5 h-full w-[88%] -translate-x-1/2 rounded-[28px]"
            style={{ backgroundColor: ACCENT_SOFT, opacity: 0.5 }}
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-2.5 h-full w-[94%] -translate-x-1/2 rounded-[28px]"
            style={{ backgroundColor: ACCENT_SOFT }}
          />
        </>
      )}

      {/* Активная карточка */}
      <div className="relative z-10 flex min-h-[400px] flex-col overflow-hidden rounded-[28px] border border-[#0f1c2e]/[0.06] bg-white p-5 shadow-[0_30px_70px_-40px_rgba(15,28,46,0.5)] sm:min-h-[420px] sm:p-6 lg:min-h-[460px]">
        {/* Очень мягкое фирменное пятно */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full"
          style={{ background: `radial-gradient(circle, ${ACCENT}14, transparent 70%)` }}
        />

        {/* Полоски-таймер (как в сторис) */}
        {count > 1 && (
          <div className="relative z-10 mb-5 flex gap-1.5">
            {promotions.map((_, i) => (
              <span
                key={i}
                className="h-1 flex-1 overflow-hidden rounded-full"
                style={{ backgroundColor: "rgba(15,28,46,0.1)" }}
              >
                <span
                  key={`${safeIndex}-${i}`}
                  className="block h-full rounded-full"
                  style={{
                    backgroundColor: ACCENT,
                    transformOrigin: "left",
                    transform: i < safeIndex ? "scaleX(1)" : i > safeIndex ? "scaleX(0)" : undefined,
                    animation: i === safeIndex ? `medeoBarFill ${SLIDE_MS}ms linear forwards` : undefined,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              </span>
            ))}
          </div>
        )}

        {/* Контент слайда — мягко проявляется при смене */}
        <div
          key={promo.id}
          className="relative z-10 flex flex-1 flex-col animate-in fade-in-0 slide-in-from-bottom-2 duration-500"
        >
          {promo.imageUrl ? (
            <div className="group/img relative mb-5 h-44 overflow-hidden rounded-2xl ring-1 ring-[#0f1c2e]/[0.05] sm:h-48 lg:h-52">
              <img
                src={promo.imageUrl}
                alt={promo.title}
                className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover/img:scale-[1.04]"
                decoding="async"
                data-testid="img-promo"
              />
              {/* Лёгкое затемнение сверху — чтобы бейдж/счётчик читались */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/25 to-transparent"
              />
              {promo.badge && (
                <span
                  className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3.5 py-1.5 text-base font-bold shadow-sm backdrop-blur-sm sm:text-lg"
                  style={{ color: ACCENT }}
                  data-testid="text-promo-badge"
                >
                  {promo.badge}
                </span>
              )}
              <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold tabular-nums text-white shadow-sm backdrop-blur-sm">
                {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between gap-3">
              {promo.badge ? (
                <span
                  className="inline-flex items-center rounded-full px-4 py-1.5 text-lg font-bold text-white shadow-sm sm:text-xl"
                  style={{ backgroundColor: ACCENT }}
                  data-testid="text-promo-badge"
                >
                  {promo.badge}
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ backgroundColor: `${ACCENT}18`, color: ACCENT }}
                >
                  <Sparkles className="h-3 w-3" />
                  Акция
                </span>
              )}
              <span className="text-xs font-medium tabular-nums text-[#0f1c2e]/40">
                {String(safeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
          )}

          {promo.date && (
            <span
              className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
              style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
              data-testid="text-promo-date"
            >
              <Clock className="h-3 w-3" />
              {promo.date}
            </span>
          )}

          <h3
            className="max-w-md text-2xl font-bold leading-tight tracking-tight text-[#0f1c2e] sm:text-[1.75rem]"
            data-testid="text-promo-title"
          >
            {promo.title}
          </h3>
          {promo.description && (
            <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#5b6573] sm:text-[15px]">
              {promo.description}
            </p>
          )}

          {/* Низ: CTA + навигация */}
          <div className="mt-auto flex items-center justify-between gap-3 pt-6">
            {promo.slug ? (
              <a
                href={`/akcii/${promo.slug}`}
                className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-medium text-white shadow-[0_12px_26px_-12px_rgba(0,125,131,0.8)] transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-95"
                style={{ backgroundColor: ACCENT }}
                data-testid="button-promo-details"
              >
                Подробнее об акции
                <ArrowRight className="h-4 w-4" />
              </a>
            ) : (
              <a
                href="#contacts"
                className="inline-flex h-12 items-center gap-2 rounded-xl px-6 text-sm font-medium text-white shadow-[0_12px_26px_-12px_rgba(0,125,131,0.8)] transition-[filter,transform] duration-200 hover:-translate-y-0.5 hover:brightness-95"
                style={{ backgroundColor: ACCENT }}
                data-testid="button-promo-book"
              >
                Записаться
                <ArrowRight className="h-4 w-4" />
              </a>
            )}

            {count > 1 && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Предыдущая акция"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0f1c2e]/10 bg-white text-[#0f1c2e]/70 transition-colors hover:border-[#007d83]/40 hover:text-[#007d83]"
                  data-testid="button-promo-prev"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Следующая акция"
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#0f1c2e]/10 bg-white text-[#0f1c2e]/70 transition-colors hover:border-[#007d83]/40 hover:text-[#007d83]"
                  data-testid="button-promo-next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
