import { describe, expect, it } from "vitest";

import { siteJsonLd } from "./siteJsonLd";

describe("siteJsonLd", () => {
  it("keeps the expected schema graph shape", () => {
    expect(siteJsonLd["@context"]).toBe("https://schema.org");
    expect(Array.isArray(siteJsonLd["@graph"])).toBe(true);
    expect(siteJsonLd["@graph"]).toHaveLength(3);
    expect(siteJsonLd["@graph"][0]).toMatchObject({
      "@type": "WebSite",
      name: "오메추",
    });
  });
});
