import type { MetadataRoute } from "next";

import { BASE_URL } from "@/shared/constants/url";
import { createClient } from "@/shared/lib/supabase/server";

async function fetchAllMenus(): Promise<{ name: string }[]> {
  try {
    const sb = await createClient();
    const { data, error } = await sb.from("menu").select("name").order("id");
    if (error) return [];
    return (data ?? []) as { name: string }[];
  } catch {
    return [];
  }
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
