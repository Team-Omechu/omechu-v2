const DEFAULT_SITE_URL = "https://omechu.log8.kr";

export function getBaseUrl(siteUrl = process.env.NEXT_PUBLIC_SITE_URL) {
  return siteUrl || DEFAULT_SITE_URL;
}

export const BASE_URL = getBaseUrl();
