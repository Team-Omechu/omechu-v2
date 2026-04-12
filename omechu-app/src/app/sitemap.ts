import type { MetadataRoute } from "next";

import { BASE_URL } from "@/shared/constants/url";

interface Menu {
  id: string;
  name: string;
  image_link: string | null;
}

type WrappedResponse<T> = {
  resultType: "SUCCESS" | "FAIL";
  success?: T;
};

async function fetchAllMenus(): Promise<Menu[]> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return [];

  const allMenus: Menu[] = [];
  let lastMenuId = 0;

  while (true) {
    let res: Response;
    try {
      res = await fetch(`${apiUrl}/menu/allMenu/${lastMenuId}`);
    } catch {
      break;
    }

    if (res.status === 404) break;
    if (!res.ok) break;

    let raw: unknown;
    try {
      raw = await res.json();
    } catch {
      break;
    }

    // resultType 래핑 여부 처리
    let data: Menu[];
    if (
      raw &&
      typeof raw === "object" &&
      !Array.isArray(raw) &&
      "resultType" in raw
    ) {
      const wrapped = raw as WrappedResponse<Menu[]>;
      if (wrapped.resultType !== "SUCCESS" || !wrapped.success) break;
      data = wrapped.success;
    } else {
      data = raw as Menu[];
    }

    if (!Array.isArray(data) || data.length === 0) break;

    const fetchedLastId = Number(data[data.length - 1].id);
    if (!Number.isFinite(fetchedLastId) || fetchedLastId <= lastMenuId) break;

    allMenus.push(...data);
    lastMenuId = fetchedLastId;
  }

  return allMenus;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const menus = await fetchAllMenus();

  const menuUrls: MetadataRoute.Sitemap = menus.flatMap((menu) => {
    const encoded = encodeURIComponent(menu.name);
    return [
      {
        url: `${BASE_URL}/mainpage/result/${encoded}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
      {
        url: `${BASE_URL}/random-recommend/${encoded}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      },
    ];
  });

  return [
    {
      url: `${BASE_URL}/mainpage`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/mainpage/result`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/random-recommend`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/menu-battle`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...menuUrls,
  ];
}
