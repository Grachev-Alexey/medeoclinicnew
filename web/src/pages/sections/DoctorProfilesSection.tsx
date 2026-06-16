import { useQuery } from "@tanstack/react-query";
import { Star } from "lucide-react";

type Review = {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  platform: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

const avatarColors = ["#007d83", "#3b82f6", "#7c3aed", "#059669", "#d97706", "#a03050"];

export const DoctorProfilesSection = (): JSX.Element | null => {
  const { data: reviews = [] } = useQuery<Review[]>({ queryKey: ["/api/reviews"] });
  const { data: settings } = useQuery<Record<string, any>>({ queryKey: ["/api/settings"] });

  if (reviews.length === 0) return null;

  const rating = settings?.rating ?? {};
  const score = rating.value ?? "4.9";
  const count = rating.count ?? "более 2 000 отзывов";

  return (
    <section className="w-full bg-gray-50 py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-[#007d83] uppercase mb-2">
              Доверие пациентов
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight">
              Отзывы о клинике
            </h2>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-3xl font-bold text-[#0f1c2e]" data-testid="text-rating-score">{score}</span>
            <div className="flex flex-col gap-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>
              <span className="text-xs text-gray-400">{count}</span>
            </div>
          </div>
        </div>

        {/* Cards scroll container */}
        <div className="no-scrollbar flex gap-4 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {reviews.map((review, idx) => (
            <div
              key={review.id}
              data-testid={`card-review-${review.id}`}
              className="flex-none w-[82vw] sm:w-[44vw] lg:w-auto snap-start bg-white border border-gray-100 rounded-md shadow-sm p-6 flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                ))}
              </div>

              {/* Review text */}
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                {review.text}
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div
                  className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-white text-sm font-semibold"
                  style={{ backgroundColor: avatarColors[idx % avatarColors.length] }}
                >
                  {initials(review.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#0f1c2e] truncate">{review.name}</p>
                  <p className="text-xs text-gray-400">
                    {[review.platform, review.date].filter(Boolean).join(" · ")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
