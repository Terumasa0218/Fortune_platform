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
      "1）答えだけでなく、理由まで深く考えられる",
      "2）複雑な内容から、大切な部分を見つけられる",
      "3）理解したことを、自分の言葉で伝えられる",
      "才能が活きやすい場面",
      "才能を伸ばす鍵",
    ]);
    expect(copy?.sections[3].body).toHaveLength(2);
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
