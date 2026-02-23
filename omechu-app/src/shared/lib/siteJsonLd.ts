import { BASE_URL } from "@/shared/constants/url";

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${BASE_URL}#website`,
      url: BASE_URL,
      name: "오메추",
      alternateName: "Omechu",
      inLanguage: "ko-KR",
      description:
        "사용자의 취향과 상황을 분석하여 오늘 딱 맞는 메뉴와 주변 맛집을 추천해 드립니다.",
      potentialAction: {
        "@type": "SearchAction",
        target: `${BASE_URL}/mainpage/result?query={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      "@id": `${BASE_URL}#webapp`,
      url: BASE_URL,
      name: "오메추",
      applicationCategory: "FoodService",
      operatingSystem: "Web",
      inLanguage: "ko-KR",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "KRW",
      },
    },
    {
      "@type": "Organization",
      "@id": `${BASE_URL}#organization`,
      name: "OMECHU Team",
      url: BASE_URL,
      logo: `${BASE_URL}/icons/icon-512x512.png`,
    },
  ],
};
