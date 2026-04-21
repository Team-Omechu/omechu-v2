import { describe, expect, it } from "vitest";

import { getBaseUrl } from "./url";

describe("getBaseUrl", () => {
  it("falls back to the production site url", () => {
    expect(getBaseUrl("")).toBe("https://omechu.log8.kr");
  });

  it("returns the explicit site url when provided", () => {
    expect(getBaseUrl("https://preview.omechu.test")).toBe(
      "https://preview.omechu.test",
    );
  });
});
