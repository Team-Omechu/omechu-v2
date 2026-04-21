import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { Providers } from "@/app/providers";

import { THEME_COLOR } from "@/shared/constants/theme";
import { BASE_URL } from "@/shared/constants/url";
import { siteJsonLd } from "@/shared/lib/siteJsonLd";

import { PageTransition } from "@/shared";

import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "오메추 | 오늘 뭐 먹지? 메뉴 추천 서비스",
    template: "%s | 오메추",
  },
  description:
    "당신의 취향과 상황을 분석하여 오늘 딱 맞는 메뉴와 주변 맛집을 추천해 드립니다.",
  keywords: [
    "메뉴추천",
    "오늘뭐먹지",
    "맛집추천",
    "오메추",
    "점심메뉴",
    "저녁메뉴",
    "음식추천",
  ],
  authors: [{ name: "OMECHU Team" }],
  creator: "OMECHU Team",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  openGraph: {
    url: BASE_URL,
    siteName: "오메추",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "오메추 - 오늘 뭐 먹지? 메뉴 추천 서비스",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [
      {
        url: "/og/og-image.png",
        alt: "오메추 - 오늘 뭐 먹지? 메뉴 추천 서비스",
      },
    ],
  },
  verification: {
    other: {
      "naver-site-verification": "c700681f7356867cf35c8d9566f0a021e4f9b19d",
    },
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="bg-gray-200">
        <Script id="website-jsonld" type="application/ld+json">
          {JSON.stringify(siteJsonLd)}
        </Script>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}
        {/* 모바일 앱 컨테이너 - max-width 제한, 중앙 정렬 */}
        <div className="bg-background-primary relative mx-auto flex min-h-screen w-full max-w-120 min-w-93.75 flex-col overflow-x-hidden shadow-xl">
          <Providers>
            <main className="bg-background-primary scrollbar-hide flex flex-1 flex-col overflow-y-scroll">
              <PageTransition>{children}</PageTransition>
            </main>
          </Providers>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
