import { describe, expect, it } from "vitest";
import type { FortuneMethod, InputRequirement } from "@/lib/engines/types";
import type { MethodReadingReport } from "./types";
import { rankReadingsForDomain } from "./rank-methods";

const REQUIREMENTS: Record<FortuneMethod, InputRequirement> = {
  bazi: { birthDate: "required", birthTime: "recommended", birthPlace: "recommended" },
  western: { birthDate: "required", birthTime: "recommended", birthPlace: "recommended" },
  ziwei: { birthDate: "required", birthTime: "required", birthPlace: "unused" },
  numerology: { birthDate: "required", birthTime: "unused", birthPlace: "unused" },
  kyusei: { birthDate: "required", birthTime: "recommended", birthPlace: "unused" },
  maya: { birthDate: "required", birthTime: "unused", birthPlace: "unused" },
};

function report(method: FortuneMethod): MethodReadingReport {
  return {
    method,
    displayName: method,
    version: "test",
    inputRequirement: REQUIREMENTS[method],
    confidence: { score: 1, level: "high", reasons: [] },
    topics: [
      {
        id: "talent",
        title: "才能",
        overview: "",
        confidence: 1,
        blocks: [{ id: "free", kind: "interpretation", title: "才能", body: ["本文"], tier: "free" }],
      },
    ],
  };
}

const readings = (["maya", "kyusei", "numerology", "ziwei", "western", "bazi"] as FortuneMethod[])
  .map(report);

describe("rankReadingsForDomain", () => {
  it("出生時刻と出生地がある場合は分野適性を優先し、同点を固定順で並べる", () => {
    const ranked = rankReadingsForDomain(
      readings,
      { birthDate: "2000-01-01", birthTime: "12:00", latitude: 35, longitude: 137 },
      "talent",
    );

    expect(ranked.map((item) => item.method)).toEqual([
      "bazi",
      "ziwei",
      "western",
      "numerology",
      "kyusei",
      "maya",
    ]);
  });

  it("生年月日のみの場合は追加情報を必要としない占術を上位へ動かす", () => {
    const ranked = rankReadingsForDomain(readings, { birthDate: "2000-01-01" }, "talent");

    expect(ranked[0].method).toBe("numerology");
    expect(ranked.map((item) => item.method)).toContain("bazi");
    expect(ranked.map((item) => item.method).slice(-1)).toEqual(["maya"]);
  });
});
