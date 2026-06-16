import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck } from "lucide-react";

type Doctor = {
  id: string;
  imageUrl: string;
  experience: string;
  name: string;
  specialty: string;
  price: string;
  availableDate: string;
  available: boolean;
  quote: string;
  about: string;
  credentials: string[];
};

export const HeroWelcomeSection = (): JSX.Element | null => {
  const { data: doctors = [] } = useQuery<Doctor[]>({ queryKey: ["/api/doctors"] });

  const doctor = doctors[0];
  if (!doctor) return null;

  const aboutParagraphs = (doctor.about || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const credentials = (doctor.credentials || []).filter(Boolean);

  return (
    <section className="w-full bg-white py-16 lg:py-24" data-testid="section-lead-doctor">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center lg:mb-14">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#007d83] sm:text-xs">
            Знакомьтесь
          </p>
          <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-tight text-[#0f1c2e] sm:text-4xl">
            Вас будет вести врач, которому не всё равно
          </h2>
          <Link
            href="/vrachi"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#007d83] transition-colors hover:text-[#006970]"
            data-testid="link-all-doctors-heading"
          >
            Все врачи клиники
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#f3fbfb] via-white to-[#eaf6f6] ring-1 ring-[#007d83]/10 lg:rounded-[2.5rem]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
            {/* Portrait */}
            <div className="relative aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto lg:min-h-[600px]">
              <img
                src={doctor.imageUrl}
                alt={doctor.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-top"
                data-testid="img-lead-doctor"
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent" />
              <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
                <p className="text-lg font-semibold text-white drop-shadow-sm sm:text-xl" data-testid="text-doctor-name">
                  {doctor.name}
                </p>
                <p className="mt-1 text-[13px] text-white/90 sm:text-sm" data-testid="text-doctor-specialty">
                  {doctor.specialty}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
              {doctor.quote ? (
                <p
                  className="text-xl font-medium leading-snug tracking-tight text-[#0f1c2e] sm:text-[1.7rem] lg:text-[1.9rem]"
                  data-testid="text-doctor-quote"
                >
                  {doctor.quote}
                </p>
              ) : null}

              {aboutParagraphs.length > 0 ? (
                <div
                  className="mt-6 space-y-4 text-[15px] leading-relaxed text-gray-600"
                  data-testid="text-doctor-about"
                >
                  {aboutParagraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : null}

              {credentials.length > 0 ? (
                <ul className="mt-8 space-y-3" data-testid="list-doctor-credentials">
                  {credentials.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-3 text-sm font-medium text-[#0f1c2e]"
                      data-testid={`credential-${i}`}
                    >
                      <ShieldCheck className="h-5 w-5 shrink-0 text-[#007d83]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-9 flex flex-col gap-4 border-t border-[#007d83]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Button
                    asChild
                    className="group h-auto rounded-full bg-[#007d83] px-7 py-3.5 text-base font-medium text-white hover:bg-[#006970]"
                  >
                    <a href="#contacts" data-testid="button-book-doctor">
                      Записаться на приём
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </Button>
                  {doctor.price ? (
                    <p className="mt-2.5 text-sm text-gray-500" data-testid="text-doctor-price">
                      Консультация {doctor.price} · без спешки и лишних назначений
                    </p>
                  ) : null}
                </div>
                {doctor.available ? (
                  <span
                    className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3.5 py-1.5 text-sm font-medium text-emerald-700"
                    data-testid="text-doctor-available"
                  >
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    {doctor.availableDate ? `Принимает ${doctor.availableDate}` : "Принимает сегодня"}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
