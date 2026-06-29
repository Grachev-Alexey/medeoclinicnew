"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const YM_ID = 109376811;

export function YandexMetrika(): JSX.Element | null {
  const pathname = usePathname();
  // Excluded on /admin: no webvisor session recording and no internal panel
  // URLs leaked to Yandex. Tracked by pathname only — this site has no
  // query-param navigation, and avoiding useSearchParams keeps pages server-
  // rendered (no client-render bailout) for SEO.
  const isAdmin = pathname?.startsWith("/admin") ?? false;
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (isAdmin) return;
    // The `init` call below already registers the first page view, so skip the
    // very first effect run and only fire a `hit` on subsequent SPA navigations.
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    const ym = (window as unknown as { ym?: (...args: unknown[]) => void }).ym;
    if (typeof ym === "function") {
      ym(YM_ID, "hit", window.location.href, { referer: document.referrer });
    }
  }, [pathname, isAdmin]);

  if (isAdmin) return null;

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`(function(m,e,t,r,i,k,a){
        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
    })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}', 'ym');
    ym(${YM_ID}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${YM_ID}`}
            style={{ position: "absolute", left: "-9999px" }}
            alt=""
          />
        </div>
      </noscript>
    </>
  );
}
