import { Star, ExternalLink } from "lucide-react";

type RatingDoctor = {
  prodoctorovUrl?: string;
  prodoctorovRating?: string;
  prodoctorovReviews?: string;
  yandexUrl?: string;
  yandexRating?: string;
  yandexReviews?: string;
};

const STAR = "#ffb400";
const PD_RED = "#e30b41";
const PD_BLUE = "#1f5fb0";
const YA_RED = "#fc3f1d";

const safeUrl = (raw?: string): string | undefined => {
  if (!raw) return undefined;
  const trimmed = raw.trim();
  try {
    const u = new URL(trimmed);
    return u.protocol === "http:" || u.protocol === "https:" ? trimmed : undefined;
  } catch {
    return undefined;
  }
};

const plural = (n: number, forms: [string, string, string]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return forms[0];
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return forms[1];
  return forms[2];
};

const Stars = ({ value }: { value: number }) => {
  const pct = Math.min(100, Math.max(0, (value / 5) * 100));
  return (
    <div className="relative inline-flex" aria-hidden>
      <div className="flex">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-[18px] w-[18px]" strokeWidth={1.5} style={{ color: "#d2d8e2", fill: "#d2d8e2" }} />
        ))}
      </div>
      <div className="absolute inset-0 flex overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="h-[18px] w-[18px] shrink-0" strokeWidth={1.5} style={{ color: STAR, fill: STAR }} />
        ))}
      </div>
    </div>
  );
};

const ProDoctorovBadge = (
  <span className="inline-flex items-center rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/[0.03]">
    <span className="text-sm font-extrabold lowercase tracking-tight">
      <span style={{ color: PD_RED }}>про</span>
      <span style={{ color: PD_BLUE }}>докторов</span>
    </span>
  </span>
);

const YandexBadge = (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 shadow-sm ring-1 ring-black/[0.03]">
    <span
      className="flex h-4 w-4 items-center justify-center rounded text-[11px] font-bold leading-none text-white"
      style={{ backgroundColor: YA_RED }}
    >
      Я
    </span>
    <span className="text-sm font-extrabold tracking-tight text-[#1f2d4d]">Яндекс</span>
  </span>
);

const MegaphoneArt = (
  <svg viewBox="0 0 120 120" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <defs>
      <linearGradient id="pdHorn" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ff7d6e" />
        <stop offset="1" stopColor="#e01d12" />
      </linearGradient>
    </defs>
    {/* облачка диалога */}
    <circle cx="42" cy="30" r="15" fill="#ffffff" opacity="0.85" />
    <circle cx="66" cy="22" r="9" fill="#ffffff" opacity="0.7" />
    <circle cx="26" cy="40" r="8" fill="#ffffff" opacity="0.6" />
    {/* звуковые волны */}
    <path d="M100 60c7 9 7 21 0 30" stroke={STAR} strokeWidth="5" strokeLinecap="round" />
    <path d="M110 50c12 15 12 39 0 54" stroke="#ffd36b" strokeWidth="5" strokeLinecap="round" opacity="0.8" />
    {/* рупор */}
    <path d="M34 72 L86 54 L86 102 L40 92 Z" fill="url(#pdHorn)" />
    <ellipse cx="86" cy="78" rx="6" ry="24" fill="#ff9f92" />
    {/* мундштук */}
    <rect x="26" y="71" width="9" height="18" rx="3" fill="#c2160d" />
    {/* ручка */}
    <rect x="52" y="90" width="10" height="22" rx="5" fill="#c2160d" />
  </svg>
);

const StarsArt = (
  <svg viewBox="0 0 120 120" className="h-full w-auto" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <circle cx="44" cy="32" r="14" fill="#ffffff" opacity="0.85" />
    <circle cx="68" cy="24" r="8" fill="#ffffff" opacity="0.65" />
    <path
      d="M70 44l9.5 19.3 21.3 3.1-15.4 15 3.6 21.2L70 103.6 50.9 102.6 54.5 81.4 39.1 66.4 60.4 63.3 70 44z"
      fill={STAR}
      opacity="0.9"
    />
    <path
      d="M38 30l5 10.1 11.2 1.6-8.1 7.9 1.9 11.1L38 65.5 27.9 60.7 29.8 49.6 21.7 41.7 32.9 40.1 38 30z"
      fill="#ffd36b"
      opacity="0.7"
    />
  </svg>
);

type WidgetProps = {
  badge: JSX.Element;
  art: JSX.Element;
  ratingText: string;
  reviewsText: string;
  url?: string;
  linkColor: string;
  testId: string;
};

const RatingWidget = ({ badge, art, ratingText, reviewsText, url, linkColor, testId }: WidgetProps) => {
  const parsed = parseFloat(ratingText.replace(",", "."));
  const hasRating = !Number.isNaN(parsed) && parsed > 0;
  const value = Math.min(5, Math.max(0, hasRating ? parsed : 0));
  const reviewsNum = parseInt(reviewsText.replace(/\D/g, ""), 10);
  const hasReviews = !Number.isNaN(reviewsNum) && reviewsNum > 0;
  const link = safeUrl(url);
  if (!hasRating && !link) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#eaf4ff] via-[#e6f1fd] to-[#d8e9fb] p-5 ring-1 ring-[#005eb8]/10"
      data-testid={testId}
    >
      <div className="pointer-events-none absolute -right-2 bottom-0 top-0 z-0 flex w-28 items-center justify-end opacity-95">
        {art}
      </div>

      <div className="relative z-10 max-w-[68%]">
        {badge}

        {hasRating ? (
          <>
            <div className="mt-3.5">
              <span className="sr-only">{`Рейтинг ${value.toString().replace(".", ",")} из 5`}</span>
              <Stars value={value} />
            </div>
            {hasReviews ? (
              <p className="mt-2 text-sm text-gray-500" data-testid={`${testId}-reviews`}>
                {reviewsNum} {plural(reviewsNum, ["отзыв", "отзыва", "отзывов"])}
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-3.5 text-sm text-gray-500">Отзывы пациентов</p>
        )}

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ color: linkColor }}
            data-testid={`${testId}-link`}
          >
            Смотреть отзывы <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
};

export const DoctorRatings = ({ doctor }: { doctor: RatingDoctor }): JSX.Element | null => {
  const pdRating = doctor.prodoctorovRating ?? "";
  const pdUrl = doctor.prodoctorovUrl ?? "";
  const yaRating = doctor.yandexRating ?? "";
  const yaUrl = doctor.yandexUrl ?? "";

  const pdValue = parseFloat(pdRating.replace(",", "."));
  const yaValue = parseFloat(yaRating.replace(",", "."));
  const showPd = (!Number.isNaN(pdValue) && pdValue > 0) || !!safeUrl(pdUrl);
  const showYa = (!Number.isNaN(yaValue) && yaValue > 0) || !!safeUrl(yaUrl);

  if (!showPd && !showYa) return null;

  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2" data-testid="doctor-ratings">
      {showPd ? (
        <RatingWidget
          badge={ProDoctorovBadge}
          art={MegaphoneArt}
          ratingText={pdRating}
          reviewsText={doctor.prodoctorovReviews ?? ""}
          url={pdUrl || undefined}
          linkColor={PD_RED}
          testId="rating-prodoctorov"
        />
      ) : null}
      {showYa ? (
        <RatingWidget
          badge={YandexBadge}
          art={StarsArt}
          ratingText={yaRating}
          reviewsText={doctor.yandexReviews ?? ""}
          url={yaUrl || undefined}
          linkColor={YA_RED}
          testId="rating-yandex"
        />
      ) : null}
    </div>
  );
};
