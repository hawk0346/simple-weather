import { describe, expect, it } from "bun:test";
import { normalizeRomaji } from "./normalize-romaji";

describe("normalizeRomaji", () => {
  it("converts to lowercase", () => {
    expect(normalizeRomaji("TOKYO")).toBe("tokyo");
  });

  it("normalizes oo to o", () => {
    expect(normalizeRomaji("oosaka")).toBe("osaka");
  });

  it("normalizes vowel + u patterns", () => {
    expect(normalizeRomaji("toukyou")).toBe("tokyo");
    expect(normalizeRomaji("chuugoku")).toBe("chugoku");
    expect(normalizeRomaji("ryu")).toBe("ryu");
  });

  it("keeps already-normalized values", () => {
    expect(normalizeRomaji("sapporo")).toBe("sapporo");
  });
});
