import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";

let lenisInstance: Lenis | null = null;

export function useSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisInstance = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}

export function scrollTo(target: string | number | HTMLElement, offset = 0) {
  lenisInstance?.scrollTo(target, { duration: 1.2, offset });
}

export function scrollToWhenReady(selector: string, offset = 0, timeout = 1200) {
  const start = performance.now();
  const tick = () => {
    const el = document.querySelector(selector);
    if (el) {
      scrollTo(el as HTMLElement, offset);
      return;
    }
    if (performance.now() - start < timeout) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
