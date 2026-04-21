import { describe, expect, it } from "vitest";

import { generateMenuMetadata } from "./generateMenuMetadata";

describe("generateMenuMetadata", () => {
  it("returns noindex metadata when menu detail is missing", () => {
    const metadata = generateMenuMetadata(null, "/mainpage/result/1");

    expect(metadata.title).toBe("오메추 | 오늘 뭐 먹지?");
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it("builds canonical and open graph metadata for a menu", () => {
    const metadata = generateMenuMetadata(
      {
        name: "김치찌개",
        description: "얼큰한 찌개",
        calory: "500",
        carbo: "30",
        protein: "20",
        fat: "10",
        sodium: "1000",
        vitamin: [],
        allergic: [],
        image_link: "https://cdn.example.com/menu.jpg",
        recipe_link: null,
        recipe_link_source: null,
        recipe_video_name: null,
      },
      "/mainpage/result/1",
    );

    expect(metadata.title).toBe("오메추 | 오늘의 메뉴는 [김치찌개]");
    expect(metadata.alternates?.canonical).toBe(
      "https://omechu.log8.kr/mainpage/result/1",
    );
    const images = metadata.openGraph?.images;
    const firstImage = Array.isArray(images) ? images[0] : images;
    expect(firstImage).toMatchObject({
      url: "https://cdn.example.com/menu.jpg",
      alt: "김치찌개 이미지",
    });
  });
});
