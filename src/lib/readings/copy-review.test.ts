import { describe, expect, it } from "vitest";
import { calcAllFortunes } from "../engines";
import { buildCopyReviewRecords } from "./copy-review";

describe("buildCopyReviewRecords", () => {
  const records = buildCopyReviewRecords(
    "tajimi-2004-male",
    "2004/2/18 男性・多治見・時刻あり",
    calcAllFortunes(
      {
        birthDate: "2004-02-18",
        birthTime: "13:03",
        gender: "male",
        birthPlace: "岐阜県多治見市",
        latitude: 35.3328,
        longitude: 137.132,
        timezone: "Asia/Tokyo",
      },
      "2026-07-26",
    ),
  );

  it("確認画面で一意に扱える文章レコードを作る", () => {
    expect(records.length).toBeGreaterThan(100);
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    expect(records.every((record) => record.characterCount > 0)).toBe(true);
  });

  it("改訂した四柱推命・才能の無料文は十分な量と見出し構造を持つ", () => {
    const freeTalent = records.find(
      (record) =>
        record.method === "bazi" &&
        record.topic === "talent" &&
        record.tier === "free",
    );

    expect(freeTalent?.blockTitle).toBe("才能の傾向（何が得意で、どんな場面で活きるか）");
    expect(freeTalent?.characterCount).toBeGreaterThanOrEqual(250);
    expect(freeTalent?.body).toEqual(
      expect.arrayContaining([
        "1）「なぜ？」を見過ごさず、深く理解できる",
        "才能が活きやすい場面",
        "才能を伸ばす鍵",
      ]),
    );
    expect(freeTalent?.warnings.map((warning) => warning.kind)).not.toEqual(
      expect.arrayContaining(["length", "structure", "jargon", "sales"]),
    );
  });

  it("専門用語を許可する鑑定根拠では専門用語警告を出さない", () => {
    const evidence = records.filter((record) => record.topic === "evidence");
    expect(evidence.length).toBeGreaterThan(0);
    expect(
      evidence.every((record) => record.warnings.every((warning) => warning.kind !== "jargon")),
    ).toBe(true);
  });
});
