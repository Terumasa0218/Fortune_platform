import { describe, expect, it } from "vitest";
import {
  baziTalentCopyPack,
  buildBaziTalentFreeCopy,
} from "./bazi-talent-copy";

const sampleContext = {
  key: "bazi-talent-free-v1",
  variables: {
    dayMaster: "丁",
    dominantGods: ["印綬", "比肩", "劫財"],
  },
};

describe("buildBaziTalentFreeCopy", () => {
  it("多治見の代表例を合意した無料枠の構造で返す", () => {
    const copy = buildBaziTalentFreeCopy(sampleContext);

    expect(copy?.sections.map((section) => section.title)).toEqual([
      "1）「なぜ？」を見過ごさず、深く理解できる",
      "2）情報が多くても、大事な点を見失わない",
      "3）分かったことを、相手に届く言葉へ変えられる",
      "才能が活きやすい場面",
      "才能を伸ばす鍵",
    ]);
    expect(copy?.sections[3].body).toHaveLength(2);
  });

  it("同じ鑑定根拠を3つの文体で読み分けられる", () => {
    const standard = buildBaziTalentFreeCopy(sampleContext, "standard");
    const warm = buildBaziTalentFreeCopy(sampleContext, "warm");
    const playful = buildBaziTalentFreeCopy(sampleContext, "playful");

    expect(standard?.sections[0].title).toContain("深く理解できる");
    expect(warm?.sections[0].title).toContain("ちゃんと分かりたい");
    expect(playful?.sections[0].title).toContain("終われない");
  });

  it("ユーモア文が未登録の項目は標準文を使う", () => {
    const copy = buildBaziTalentFreeCopy(
      {
        key: "bazi-talent-free-v1",
        variables: { dayMaster: "甲", dominantGods: ["比肩"] },
      },
      "playful",
    );

    expect(copy?.sections[0].title).toContain(
      baziTalentCopyPack.dayMasters.甲.standard.primaryHeading,
    );
  });

  it("全ての日主と通変星の組み合わせを表示できる", () => {
    for (const dayMaster of Object.keys(baziTalentCopyPack.dayMasters)) {
      for (const tenGod of Object.keys(baziTalentCopyPack.tenGods)) {
        expect(buildBaziTalentFreeCopy({
          key: "bazi-talent-free-v1",
          variables: { dayMaster, dominantGods: [tenGod] },
        })).not.toBeNull();
      }
    }
  });
});
