"use client";

import { ExternalLink } from "lucide-react";
import { pauseLenis, resumeLenis } from "@/hooks/use-smooth-scroll";

const YANDEX_ORG_ID = "226407459658";
const YANDEX_ORG_URL = `https://yandex.ru/maps/org/medeo/${YANDEX_ORG_ID}/`;
const YANDEX_WIDGET_URL = `https://yandex.ru/maps-reviews-widget/${YANDEX_ORG_ID}?comments`;

export const ReviewsSection = (): JSX.Element => {
  return (
    <section className="w-full bg-gray-50 py-10 lg:py-16" id="reviews">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#005eb8] uppercase mb-2">
              Доверие пациентов
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight">
              Отзывы о клинике
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              Настоящие отзывы наших пациентов с Яндекс&nbsp;Карт — без фильтрации и редактирования.
            </p>
          </div>
          <a
            href={YANDEX_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-yandex-reviews"
            className="inline-flex items-center justify-center gap-2 shrink-0 rounded-lg bg-[#005eb8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#004a93]"
          >
            Оставить отзыв на Яндексе
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Yandex reviews widget */}
        <div
          data-lenis-prevent
          onMouseEnter={pauseLenis}
          onMouseLeave={resumeLenis}
          className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
        >
          <iframe
            src={YANDEX_WIDGET_URL}
            title="Отзывы о ММЦ «МЕДЕО» на Яндекс Картах"
            loading="lazy"
            className="block h-[600px] w-full lg:h-[720px]"
          />
        </div>

        <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-gray-400">
          <a
            href={YANDEX_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-[#005eb8]"
          >
            ММЦ «МЕДЕО» на Яндекс Картах
          </a>
        </p>

      </div>
    </section>
  );
};
