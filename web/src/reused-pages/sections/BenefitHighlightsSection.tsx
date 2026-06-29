import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  ShieldCheck,
  Users,
  Cpu,
  Heart,
  Sparkles,
  Stethoscope,
  Award,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Quote,
  Activity,
  type LucideIcon,
} from "lucide-react";

type Benefit = { id: string; title: string; text: string; icon: string };
type Doctor = { id: string; name: string; imageUrl: string };

type Story = {
  id: string;
  tag: string;
  title: string;
  imageUrl: string;
  body: string;
  noteKind: string;
  noteLabel: string;
  noteText: string;
  author: string;
};

const iconMap: Record<string, LucideIcon> = {
  "shield-check": ShieldCheck,
  users: Users,
  cpu: Cpu,
  heart: Heart,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  award: Award,
  clock: Clock,
};

function Icon({ name, className }: { name: string; className?: string }) {
  const Cmp = iconMap[name] || ShieldCheck;
  return <Cmp className={className} />;
}

const ease = [0.22, 1, 0.36, 1] as const;
const FALLBACK_IMG = "/image/hero.webp";

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 28 : -28 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -28 : 28 }),
};

function StoriesCarousel({ stories, avatars }: { stories: Story[]; avatars: Doctor[] }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(0);
  const total = stories.length;

  useEffect(() => {
    if (index > total - 1) setIndex(0);
  }, [index, total]);

  const safeIndex = Math.min(index, total - 1);
  const story = stories[safeIndex];

  const paginate = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + total) % total);
  };
  const goTo = (i: number) => {
    if (i === safeIndex) return;
    setDir(i > safeIndex ? 1 : -1);
    setIndex(i);
  };

  const paragraphs = story.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const hasNote = story.noteText.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease }}
      tabIndex={0}
      role="group"
      aria-roledescription="карусель"
      aria-label="Истории нашей клиники"
      onKeyDown={(e) => {
        if (total <= 1) return;
        if (e.key === "ArrowRight") paginate(1);
        if (e.key === "ArrowLeft") paginate(-1);
      }}
      className="grid grid-cols-1 overflow-hidden rounded-[2rem] bg-white ring-1 ring-[#005eb8]/12 shadow-[0_34px_80px_-50px_rgba(0,94,184,0.5)] outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] lg:grid-cols-[1.02fr_1fr]"
      data-testid="stories-block"
    >
      {/* Image side — changes per story */}
      <div className="group relative min-h-[280px] overflow-hidden bg-[#0f1c2e] lg:min-h-[580px]">
        <AnimatePresence mode="popLayout" custom={dir}>
          <motion.img
            key={story.id}
            src={story.imageUrl || FALLBACK_IMG}
            alt={story.title}
            loading="lazy"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#0f1c2e]/85 via-[#0f1c2e]/25 to-transparent" />

        {avatars.length > 0 && (
          <div className="absolute right-5 top-5 flex items-center gap-3 rounded-full bg-white/90 py-1.5 pl-2 pr-4 shadow-lg backdrop-blur-sm">
            <div className="flex -space-x-2.5">
              {avatars.map((d) => (
                <img
                  key={d.id}
                  src={d.imageUrl}
                  alt={d.name}
                  loading="lazy"
                  className="h-8 w-8 rounded-full object-cover object-top ring-2 ring-white"
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#0f1c2e]">Команда, которой доверяют</span>
          </div>
        )}

        {story.author && (
          <div className="absolute inset-x-5 bottom-5 sm:inset-x-7 sm:bottom-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                className="flex items-center gap-2.5"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm">
                  <Stethoscope className="h-4 w-4" />
                </span>
                <span className="max-w-[16rem] text-sm font-semibold leading-snug text-white">
                  {story.author}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Content side */}
      <div className="relative flex flex-col bg-gradient-to-br from-[#f2f8fe] via-white to-[#eaf3fc] p-7 sm:p-9 lg:p-10">
        <div className="pointer-events-none absolute -right-10 -top-12 h-52 w-52 rounded-full bg-[#2f86dd]/10 blur-2xl" />

        <div className="relative flex items-center justify-between">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#005eb8]/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#005eb8]" />
            Реальная история
          </span>
          <span className="text-sm font-semibold tabular-nums text-[#005eb8]/70" data-testid="story-counter">
            {String(safeIndex + 1).padStart(2, "0")}
            <span className="text-[#0f1c2e]/30"> / {String(total).padStart(2, "0")}</span>
          </span>
        </div>

        <motion.div
          className="relative mt-6 flex-1"
          drag={total > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) paginate(1);
            else if (info.offset.x > 60) paginate(-1);
          }}
        >
          <AnimatePresence mode="wait" custom={dir}>
            <motion.article
              key={story.id}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease }}
              className={total > 1 ? "cursor-grab select-none active:cursor-grabbing" : ""}
              data-testid={`story-${story.id}`}
            >
              {story.tag && (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#005eb8]/80">
                  {story.tag}
                </p>
              )}
              <h3 className="mt-2 text-2xl font-semibold leading-snug text-[#0f1c2e] sm:text-[1.7rem]">
                {story.title}
              </h3>

              {paragraphs.length > 0 && (
                <div className="mt-4 space-y-3">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="text-[15px] leading-relaxed text-gray-600">
                      {p}
                    </p>
                  ))}
                </div>
              )}

              {hasNote && (
                <div className="mt-5 flex gap-3 rounded-2xl border border-[#005eb8]/15 bg-white/70 p-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#005eb8]/10 text-[#005eb8]">
                    {story.noteKind === "info" ? (
                      <Activity className="h-4 w-4" />
                    ) : (
                      <Quote className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    {story.noteLabel && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#005eb8]/70">
                        {story.noteLabel}
                      </p>
                    )}
                    <p className="mt-1 text-sm leading-relaxed text-[#0f1c2e]">{story.noteText}</p>
                  </div>
                </div>
              )}
            </motion.article>
          </AnimatePresence>
        </motion.div>

        {/* Navigation */}
        {total > 1 && (
          <div className="relative mt-7 flex flex-col gap-3 border-t border-[#005eb8]/10 pt-5 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2 sm:flex-1">
              {stories.map((s, i) => {
                const active = i === safeIndex;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={active}
                    data-testid={`story-tab-${i}`}
                    className={`flex min-w-0 max-w-full items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-offset-2 ${
                      active
                        ? "bg-[#005eb8] text-white"
                        : "bg-white text-[#0f1c2e] ring-1 ring-[#005eb8]/15 hover:ring-[#005eb8]/40"
                    }`}
                  >
                    <span className={`text-[11px] font-bold tabular-nums ${active ? "text-white/70" : "text-[#005eb8]/60"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="truncate">{s.title}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => paginate(-1)}
                aria-label="Предыдущая история"
                data-testid="story-prev"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#005eb8]/20 text-[#005eb8] transition-colors hover:bg-[#005eb8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-offset-2"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                aria-label="Следующая история"
                data-testid="story-next"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#005eb8]/20 text-[#005eb8] transition-colors hover:bg-[#005eb8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-offset-2"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export const BenefitHighlightsSection = (): JSX.Element => {
  const { data: benefits = [] } = useQuery<Benefit[]>({ queryKey: ["/api/benefits"] });
  const { data: doctors = [] } = useQuery<Doctor[]>({ queryKey: ["/api/doctors"] });
  const { data: stories = [] } = useQuery<Story[]>({ queryKey: ["/api/stories"] });

  const avatars = doctors.slice(0, 5);

  return (
    <section className="relative w-full bg-white py-16 lg:py-28" data-testid="section-benefits">
      {/* Soft decorative aura — clipped to its own layer so it never crops the
          card's ring/shadow (especially on mobile, where the card sits near the edge) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#005eb8]/[0.06] blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#2f86dd]/[0.06] blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease }}
          className="mb-10 max-w-3xl lg:mb-14"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-[#005eb8]/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#005eb8]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#005eb8]" />
            Истории нашей клиники
          </span>
          <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-tight text-[#0f1c2e] sm:text-4xl lg:text-[3rem]">
            Наши врачи{" "}
            <span className="relative whitespace-nowrap text-[#005eb8]">
              спасают жизни
              <svg
                className="absolute -bottom-1 left-0 h-2.5 w-full text-[#005eb8]/30"
                viewBox="0 0 200 8"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M2 6 Q 100 0 198 6" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            — каждый день
          </h2>
          <p className="mt-5 text-base leading-relaxed text-gray-500 sm:text-lg">
            Реальные истории из практики нашей клиники — о том, как внимательность
            врача и своевременная диагностика меняют судьбы пациентов.
          </p>
        </motion.header>

        {/* Unified image + story carousel */}
        {stories.length > 0 && <StoriesCarousel stories={stories} avatars={avatars} />}

        {/* Supporting benefit cards */}
        {benefits.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {benefits.map((item, i) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease, delay: 0.06 * i }}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#005eb8]/25 hover:shadow-[0_18px_40px_-22px_rgba(0,94,184,0.4)] sm:p-7"
                data-testid={`benefit-${item.id}`}
              >
                <span className="pointer-events-none absolute right-5 top-5 select-none text-4xl font-bold leading-none text-gray-100 transition-colors duration-300 group-hover:text-[#005eb8]/15">
                  0{i + 1}
                </span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#005eb8]/8 text-[#005eb8] transition-colors duration-300 group-hover:bg-[#005eb8] group-hover:text-white">
                  <Icon name={item.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold leading-snug text-[#0f1c2e]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.text}</p>
              </motion.article>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="#contacts"
            data-testid="button-benefits-book"
            className="group inline-flex items-center gap-2 rounded-full bg-[#005eb8] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#004a93]"
          >
            Записаться на приём
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
