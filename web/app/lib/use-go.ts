import { usePathname, useRouter } from "next/navigation";
import { scrollTo, scrollToWhenReady } from "@/hooks/use-smooth-scroll";

/**
 * Navigation helper that mirrors the wouter-based behaviour of the legacy app:
 * - hash links (#about) scroll to the section on the home page, navigating home first if needed
 * - path links (/prices) navigate and scroll to top
 */
export function useGo() {
  const pathname = usePathname();
  const router = useRouter();

  return (href: string) => {
    if (!href || href === "#") return;
    if (href.startsWith("#")) {
      if (pathname !== "/") {
        router.push("/");
        scrollToWhenReady(href, -80);
      } else {
        const el = document.querySelector(href);
        if (el) scrollTo(el as HTMLElement, -80);
      }
    } else {
      router.push(href);
      window.scrollTo(0, 0);
    }
  };
}
