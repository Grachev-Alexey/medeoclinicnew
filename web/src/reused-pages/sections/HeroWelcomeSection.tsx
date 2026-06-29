import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, ShieldCheck } from "lucide-react";
import { DoctorRatings } from "./DoctorRatings";

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
  credentials: string[];
  prodoctorovUrl: string;
  prodoctorovRating: string;
  prodoctorovReviews: string;
  yandexUrl: string;
  yandexRating: string;
  yandexReviews: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

export const HeroWelcomeSection = (): JSX.Element | null => {
  const { data: doctors = [] } = useQuery<Doctor[]>({ queryKey: ["/api/doctors"] });
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);

  if (doctors.length === 0) return null;

  const total = doctors.length;
  const safeIndex = ((index % total) + total) % total;
  const doctor = doctors[safeIndex];

  const go = (step: number) => {
    setDir(step);
    setIndex((i) => i + step);
  };
  const jumpTo = (target: number) => {
    if (target === safeIndex) return;
    setDir(target > safeIndex ? 1 : -1);
    setIndex(target);
  };

  const activeThumbRef = useRef<HTMLButtonElement | null>(null);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);
  const didMount = useRef(false);
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }
    const strip = thumbStripRef.current;
    const thumb = activeThumbRef.current;
    if (!strip || !thumb) return;
    // Прокручиваем ТОЛЬКО горизонтальную ленту миниатюр, а не всю страницу
    // (scrollIntoView тянул за собой окно и «перематывал» к блоку врачей).
    const target = thumb.offsetLeft - strip.clientWidth / 2 + thumb.clientWidth / 2;
    strip.scrollTo({ left: Math.max(0, target), behavior: "smooth" });
  }, [safeIndex]);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = touchStartY.current === null ? 0 : e.changedTouches[0].clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
    go(dx < 0 ? 1 : -1);
  };

  const credentials = (doctor.credentials || []).filter(Boolean).slice(0, 5);

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? 60 : -60 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -60 : 60 }),
  };

  return (
    <section className="w-full bg-white py-16 lg:py-24" data-testid="section-lead-doctor">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading + controls */}
        <div className="mb-8 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#005eb8] sm:text-xs">
              Наша команда
            </p>
            <h2 className="mt-3 text-[1.6rem] font-semibold leading-tight tracking-tight text-[#0f1c2e] sm:text-4xl">
              Вас будут вести врачи, которым не всё равно
            </h2>
            <Link
              href="/vrachi"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[#005eb8] transition-colors hover:text-[#004a93]"
              data-testid="link-all-doctors-heading"
            >
              Все врачи клиники
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Counter + arrows */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium tabular-nums text-gray-400" data-testid="text-doctor-counter">
              <span className="text-[#0f1c2e]">{String(safeIndex + 1).padStart(2, "0")}</span>
              {" / "}
              {String(total).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Предыдущий врач"
                data-testid="button-doctor-prev"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#0f1c2e] transition-all hover:border-[#005eb8] hover:bg-[#005eb8] hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Следующий врач"
                data-testid="button-doctor-next"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 text-[#0f1c2e] transition-all hover:border-[#005eb8] hover:bg-[#005eb8] hover:text-white"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel card */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: "pan-y" }}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#f2f8fe] via-white to-[#eaf3fc] ring-1 ring-[#005eb8]/10 lg:rounded-[2.5rem]">
          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={doctor.id}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease }}
              className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]"
            >
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

                <DoctorRatings doctor={doctor} />

                {credentials.length > 0 ? (
                  <ul className="mt-8 space-y-3" data-testid="list-doctor-credentials">
                    {credentials.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-sm font-medium text-[#0f1c2e]"
                        data-testid={`credential-${i}`}
                      >
                        <ShieldCheck className="h-5 w-5 shrink-0 text-[#005eb8]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-9 flex flex-col gap-4 border-t border-[#005eb8]/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Button
                      asChild
                      className="group h-auto rounded-full bg-[#005eb8] px-7 py-3.5 text-base font-medium text-white hover:bg-[#004a93]"
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
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Thumbnail navigation */}
        <div ref={thumbStripRef} className="no-scrollbar mt-6 flex scroll-px-4 gap-2.5 overflow-x-auto scroll-smooth pb-1 lg:mt-8" data-testid="doctor-thumbnails">
          {doctors.map((d, i) => {
            const isActive = i === safeIndex;
            return (
              <button
                key={d.id}
                ref={isActive ? activeThumbRef : undefined}
                type="button"
                onClick={() => jumpTo(i)}
                aria-label={`Показать врача: ${d.name}`}
                aria-pressed={isActive}
                data-testid={`thumb-doctor-${i}`}
                className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition-all sm:w-[4.5rem] ${
                  isActive
                    ? "ring-[#005eb8]"
                    : "opacity-60 ring-transparent hover:opacity-100"
                }`}
              >
                <img
                  src={d.imageUrl}
                  alt={d.name}
                  loading="lazy"
                  className="h-full w-full object-cover object-[center_15%]"
                />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
