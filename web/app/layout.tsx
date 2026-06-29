import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Providers } from "./providers";
import { AnalyticsPixel } from "./_components/AnalyticsPixel";
import { YandexMetrika } from "./_components/YandexMetrika";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  OG_IMAGE,
  absoluteUrl,
  BASE_KEYWORDS,
} from "./lib/site";

const DEFAULT_TITLE = "ММЦ «МЕДЕО» — клиника доказательной медицины в Москве";

// viewport-fit=cover активирует env(safe-area-inset-*) на iPhone — иначе
// нижнее меню и плавающая кнопка прячутся за нативными панелями Safari.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s — ММЦ «МЕДЕО»",
  },
  description: SITE_DESCRIPTION,
  keywords: BASE_KEYWORDS,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16.png", type: "image/png", sizes: "16x16" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-48.png", type: "image/png", sizes: "48x48" },
      { url: "/favicon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: SITE_NAME,
    url: "/",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      { url: absoluteUrl(OG_IMAGE), width: 1200, height: 630, alt: SITE_NAME },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [absoluteUrl(OG_IMAGE)],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=localStorage.getItem('medeo-a11y');if(!r)return;var s=JSON.parse(r);if(!s||s.enabled!==true)return;var d=document.documentElement;var pick=function(v,a,f){return a.indexOf(v)>=0?v:f;};d.setAttribute('data-a11y','on');d.setAttribute('data-a11y-font',pick(s.font,['normal','large','xlarge'],'normal'));d.setAttribute('data-a11y-scheme',pick(s.scheme,['white','black','blue'],'white'));d.setAttribute('data-a11y-spacing',pick(s.spacing,['normal','medium','large'],'normal'));d.setAttribute('data-a11y-images',s.images===false?'off':'on');d.setAttribute('data-a11y-serif',s.serif===true?'on':'off');}catch(e){}})();`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <AnalyticsPixel />
        <YandexMetrika />
      </body>
    </html>
  );
}
