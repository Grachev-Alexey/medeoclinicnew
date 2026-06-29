import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";

type Myth = {
  id: string;
  tag: string;
  question: string;
  verdictType: "myth" | "partial" | "truth";
  answer: string;
  source: string;
};

const verdictConfig = {
  myth:    { label: "МИФ",      color: "#e11d48", bg: "#fff1f2", border: "#fecdd3", icon: "✕", g1: "#e11d48", g2: "#fb7185" },
  partial: { label: "ЧАСТИЧНО", color: "#d97706", bg: "#fffbeb", border: "#fde68a", icon: "≈", g1: "#d97706", g2: "#fbbf24" },
  truth:   { label: "ПРАВДА",   color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", icon: "✓", g1: "#059669", g2: "#34d399" },
};

/* ScaleX "flip" — avoids 3D transforms so text stays crisp */
const HALF = 0.14; // seconds for each half-flip

export const MythBusterSection = (): JSX.Element | null => {
  const { data: myths = [] } = useQuery<Myth[]>({ queryKey: ["/api/myths"] });

  const [current, setCurrent]   = useState(0);
  const [direction, setDirection] = useState(1);
  const [flipped, setFlipped]   = useState(false);
  // "animating" tracks the halfway point so we can swap face mid-animation
  const [showBack, setShowBack] = useState(false);
  const [scaleX, setScaleX]     = useState(1);
  const flipping = useRef(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const lastTouch = useRef(0);

  /* Trigger the scaleX flip animation */
  const doFlip = (targetFlipped: boolean) => {
    if (flipping.current) return;
    flipping.current = true;
    // Phase 1: squeeze to 0
    setScaleX(0);
    setTimeout(() => {
      setShowBack(targetFlipped);
      setFlipped(targetFlipped);
      // Phase 2: expand back to 1
      setScaleX(1);
      setTimeout(() => { flipping.current = false; }, HALF * 1000 + 20);
    }, HALF * 1000);
  };

  const handleClick = () => {
    if (Date.now() - lastTouch.current < 600) return; // suppress synthetic click after touch
    doFlip(!flipped);
  };

  // Тап/свайп по самой карточке не должен срабатывать, если палец на ссылке
  // или кнопке внутри карточки (иначе CTA «провалится» и карточка перевернётся).
  const isInteractiveTarget = (t: EventTarget | null) =>
    t instanceof Element && !!t.closest('a,button,[role="button"]');

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isInteractiveTarget(e.target)) return;
    lastTouch.current = Date.now();
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
    if (dy > 50) return;
    if (Math.abs(dx) > 55) {
      dx < 0 ? goNext() : goPrev();
    } else {
      doFlip(!flipped);
    }
  };

  const goTo = (idx: number, dir: number) => {
    setShowBack(false);
    setFlipped(false);
    setScaleX(1);
    flipping.current = false;
    setDirection(dir);
    setCurrent(idx);
  };
  const goNext = () => goTo((current + 1) % myths.length,  1);
  const goPrev = () => goTo((current - 1 + myths.length) % myths.length, -1);

  if (myths.length === 0) return null;

  const safeCurrent = Math.min(current, myths.length - 1);
  const myth = myths[safeCurrent];
  const vc   = verdictConfig[myth.verdictType] ?? verdictConfig.myth;

  const cardStyle = {
    borderRadius: 24,
    background: "#ffffff",
    minHeight: 420,
    boxShadow: "0 8px 48px -8px rgba(0,94,184,0.13), 0 2px 16px -4px rgba(0,0,0,0.06)",
    overflow: "hidden" as const,
    display: "flex" as const,
    flexDirection: "column" as const,
  };

  return (
    <section className="w-full py-14 lg:py-24" style={{ background: "#f7fafa" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#005eb8] mb-3">
            Медицина vs мифы
          </p>
          <h2 className="text-2xl lg:text-3xl font-semibold text-[#0f1c2e] tracking-tight mb-3">
            Проверьте свои знания
          </h2>
          <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
            Нажмите на карточку — получите научный ответ
          </p>
        </div>

        <div className="flex flex-col items-center gap-10">

          {/* Card with slide transition between myths */}
          <div className="w-full max-w-lg" style={{ minHeight: 432 }}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={safeCurrent}
                initial={{ opacity: 0, x: direction * 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -48 }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
                /* scaleX flip wrapper */
                style={{
                  transform: `scaleX(${scaleX})`,
                  transition: `transform ${HALF}s cubic-bezier(0.4,0,0.6,1)`,
                  transformOrigin: "center",
                }}
                onClick={handleClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full cursor-pointer select-none"
                data-testid="myth-flip-card"
              >
                {/* ── FRONT ── */}
                {!showBack && (
                  <div style={cardStyle}>
                    <div className="h-[3px]" style={{ background: "linear-gradient(90deg,#005eb8,#2f86dd)", flexShrink: 0 }} />

                    <div className="flex flex-col flex-1 p-8 lg:p-10 relative overflow-hidden">
                      {/* Watermark */}
                      <span
                        aria-hidden="true"
                        className="absolute right-4 bottom-4 select-none pointer-events-none font-bold"
                        style={{ fontSize: 160, lineHeight: 1, color: "#005eb8", opacity: 0.04 }}
                      >?</span>

                      <div className="flex items-center justify-between mb-7">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-[#005eb8]">
                          <FlaskConical className="h-3 w-3" />
                          {myth.tag}
                        </span>
                        <span className="text-[11px] text-gray-300 tabular-nums">{safeCurrent + 1}&thinsp;/&thinsp;{myths.length}</span>
                      </div>

                      <p className="text-[10px] tracking-[0.22em] uppercase font-semibold text-gray-300 mb-3">Миф или правда?</p>

                      <h3 className="text-[#0f1c2e] font-semibold text-2xl lg:text-[1.65rem] leading-snug whitespace-pre-line flex-1">
                        {myth.question}
                      </h3>

                      <div className="mt-8 flex items-center gap-2">
                        <span className="text-[10px] tracking-[0.12em] text-gray-300 uppercase font-medium">Нажмите на карточку</span>
                        <motion.span
                          animate={{ x: [0, 5, 0] }}
                          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                          className="text-gray-300 text-sm"
                        >→</motion.span>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── BACK ── */}
                {showBack && (
                  <div style={cardStyle}>
                    <div className="h-[3px]" style={{ background: `linear-gradient(90deg,${vc.g1},${vc.g2})`, flexShrink: 0 }} />

                    <div className="flex flex-col flex-1 p-8 lg:p-10">
                      <div className="flex items-center gap-3 mb-7">
                        <span
                          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold tracking-[0.18em] uppercase"
                          style={{ background: vc.bg, color: vc.color, border: `1px solid ${vc.border}` }}
                        >
                          <span className="font-bold leading-none">{vc.icon}</span>
                          {vc.label}
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.15em] text-gray-300 uppercase">{myth.tag}</span>
                      </div>

                      <p className="text-[#0f1c2e] text-base lg:text-[1.05rem] leading-relaxed font-medium flex-1">
                        {myth.answer}
                      </p>

                      <p className="mt-4 text-[11px] text-gray-400 italic">{myth.source}</p>

                      <a
                        href="#contacts"
                        data-testid="myth-cta"
                        onClick={(e) => e.stopPropagation()}
                        className="mt-7 inline-flex w-fit items-center gap-2 rounded-full text-[13px] font-semibold px-6 py-3 transition-all hover:brightness-110 active:scale-95"
                        style={{ background: "#005eb8", color: "#fff" }}
                      >
                        Задать вопрос врачу <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-5">
            <motion.button
              whileTap={{ scale: 0.88 }}
              data-testid="myth-prev"
              onClick={goPrev}
              aria-label="Предыдущий"
              className="flex items-center justify-center h-11 w-11 rounded-full bg-white text-gray-400 hover:text-[#005eb8] transition-colors"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>

            <div className="flex items-center gap-2">
              {myths.map((m, i) => (
                <motion.button
                  key={m.id}
                  data-testid={`myth-dot-${i}`}
                  onClick={() => goTo(i, i > safeCurrent ? 1 : -1)}
                  animate={{ width: i === safeCurrent ? 24 : 8 }}
                  transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                  className="h-2 rounded-full"
                  style={{ background: i === safeCurrent ? "#005eb8" : "#d1d5db" }}
                  aria-label={`Карточка ${i + 1}`}
                />
              ))}
            </div>

            <motion.button
              whileTap={{ scale: 0.88 }}
              data-testid="myth-next"
              onClick={goNext}
              aria-label="Следующий"
              className="flex items-center justify-center h-11 w-11 rounded-full bg-white text-gray-400 hover:text-[#005eb8] transition-colors"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.07)", border: "1px solid #e5e7eb" }}
            >
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          </div>

          <p className="lg:hidden text-[11px] text-gray-400 tracking-widest uppercase -mt-3">
            Свайп для листания
          </p>
        </div>

      </div>
    </section>
  );
};
