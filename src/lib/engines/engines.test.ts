import { describe, expect, it } from "vitest";
import { calcWesternChart, calcWesternTransitSnapshot } from "../astro/western";
import { calcBaziDetailed } from "./bazi-detailed";
import { calcAllFortunes } from "./index";
import { calcKyusei } from "./kyusei";
import { calcMaya } from "./maya";
import { calcNumerology } from "./numerology";
import { calcWesternDetailed } from "./western-detailed";
import { calcZiwei } from "./ziwei";

describe("calcAllFortunes", () => {
  it("6占術それぞれが4分野の詳細結果を返す", () => {
    const result = calcAllFortunes(
      {
        name: "sample",
        birthDate: "2004-02-18",
        birthTime: "13:03",
        gender: "male",
        birthPlace: "Gifu, Japan",
        latitude: 35.4233,
        longitude: 136.7607,
        timezone: "Asia/Tokyo",
        confidence: {
          time: "exact",
          place: "city",
        },
      },
      "2026-07-22",
    );

    expect(result.results).toHaveLength(6);
    expect(result.targetDate).toBe("2026-07-22");
    expect(result.results.map((item) => item.method)).toEqual([
      "bazi",
      "western",
      "ziwei",
      "numerology",
      "kyusei",
      "maya",
    ]);
    const maya = result.results.find((item) => item.method === "maya");
    expect(
      (maya?.chart as { timing?: { target?: { date?: string } } }).timing?.target?.date,
    ).toBe("2026-07-22");

    for (const engineResult of result.results) {
      expect(engineResult.domains.map((domain) => domain.domain)).toEqual([
        "love",
        "career",
        "money",
        "talent",
      ]);
      expect(engineResult.sections.length).toBeGreaterThan(0);
      expect(engineResult.signals.length).toBeGreaterThan(0);
      expect(engineResult.confidence.score).toBeGreaterThanOrEqual(0);
      expect(engineResult.confidence.score).toBeLessThanOrEqual(1);
    }
  });

  it("生年月日だけでも6占術が限定範囲と不足理由を返す", () => {
    const input = { birthDate: "2004-02-18" };
    const targetDate = "2026-07-22";
    const all = calcAllFortunes(input, targetDate);
    const bazi = calcBaziDetailed(input, targetDate);
    const western = calcWesternDetailed(input, targetDate);
    const ziwei = calcZiwei(input, targetDate);
    const numerology = calcNumerology(input, targetDate);
    const kyusei = calcKyusei(input, targetDate);
    const maya = calcMaya(input, targetDate);

    expect(all.results).toHaveLength(6);
    expect(all.results.every((result) => result.domains.length === 4)).toBe(true);
    expect(bazi.chart.timePillar).toBeUndefined();
    expect(bazi.confidence.reasons.join(" ")).toContain("出生時刻がない");
    expect(western.chart.ascendant).toBeUndefined();
    expect(western.chart.midheaven).toBeUndefined();
    expect(western.confidence.reasons.join(" ")).toContain("ASC/MCには出生時刻と出生地が必要");
    expect(ziwei.chart.timeAssumed).toBe(true);
    expect(ziwei.chart.timing).toBeUndefined();
    expect(ziwei.confidence.reasons.join(" ")).toContain("命宮・星配置は暫定");
    expect(numerology.confidence.score).toBeGreaterThan(0.8);
    expect(kyusei.chart.timeAssumed).toBe(true);
    expect(kyusei.confidence.reasons.join(" ")).toContain("日家・時家九星は暫定");
    expect(maya.chart.timing.target.date).toBe(targetDate);
  });

  it("四柱推命v6は命式・大運・流年・流月を分野別に合成する", () => {
    const result = calcBaziDetailed(
      {
        birthDate: "2004-02-18",
        birthTime: "13:03",
        gender: "male",
        birthPlace: "Gifu, Japan",
        latitude: 35.4233,
        longitude: 136.7607,
        timezone: "Asia/Tokyo",
      },
      "2026-07-22",
    );

    expect(result.version).toBe("bazi-detailed-synthesis-v6");
    expect(result.chart.calculationScope).toBe("bazi-foundation-annual-monthly-v5");
    expect(result.chart.yearPillar.stem + result.chart.yearPillar.branch).toBe("甲申");
    expect(result.chart.monthPillar.stem + result.chart.monthPillar.branch).toBe("丙寅");
    expect(result.chart.dayPillar.stem + result.chart.dayPillar.branch).toBe("丁卯");
    expect(result.chart.timePillar && result.chart.timePillar.stem + result.chart.timePillar.branch).toBe("丁未");
    expect(result.chart.solarMonth.approximate).toBe(false);
    expect(result.chart.solarMonth.termDateTime).toBe("2004-02-04 20:56:13");
    expect(result.chart.pillars.length).toBe(4);
    expect(result.chart.monthPillar.hiddenStems.length).toBeGreaterThan(0);
    expect(result.chart.monthPillar.stemTenGod).toBeDefined();
    expect(result.chart.dayPillar.twelveStage).toBeDefined();
    expect(result.chart.usefulElements.length).toBeGreaterThan(0);
    expect(result.chart.luckCycles).toHaveLength(2);
    expect(result.chart.luckCycles.find((cycle) => cycle.selected)?.direction).toBe("forward");
    expect(result.chart.luckCycles.find((cycle) => cycle.selected)?.startDateTime).toBe("2009-06-27 21:03:00");
    expect(result.chart.timing.targetDate).toBe("2026-07-22");
    expect(result.chart.timing.annualPillar.stem + result.chart.timing.annualPillar.branch).toBe("丙午");
    expect(result.chart.timing.annualTenGod).toBe("劫財");
    expect(result.chart.timing.months).toHaveLength(12);
    expect(result.chart.timing.monthly.monthOrdinal).toBe(6);
    expect(result.chart.timing.monthly.pillar.stem + result.chart.timing.monthly.pillar.branch).toBe("乙未");
    expect(result.chart.timing.monthly.tenGod).toBe("偏印");
    expect(result.chart.timing.months.map((month) => month.pillar.stem + month.pillar.branch)).toEqual([
      "庚寅", "辛卯", "壬辰", "癸巳", "甲午", "乙未",
      "丙申", "丁酉", "戊戌", "己亥", "庚子", "辛丑",
    ]);
    expect(result.chart.timing.activeLuckCycle).toBeDefined();
    expect(
      result.chart.timing.activeLuckCycle
        ? result.chart.timing.activeLuckCycle.pillar.stem + result.chart.timing.activeLuckCycle.pillar.branch
        : undefined,
    ).toBe("戊辰");
    expect(result.chart.interpretationScope).toBe("weighted-domain-synthesis-v1");
    expect(result.chart.synthesis.talent.factors.map((factor) => factor.code)).toEqual(
      expect.arrayContaining(["day-master", "day-master-strength", "month-command", "god-印綬"]),
    );
    expect(result.chart.synthesis.talent.factors.find((factor) => factor.code === "month-command")?.source).toContain(
      "印綬",
    );
    expect(result.chart.synthesis.love.factors.map((factor) => factor.code)).toEqual(
      expect.arrayContaining(["spouse-palace", "spouse-palace-main", "relationship-stars", "self-stars-strong"]),
    );
    expect(result.chart.synthesis.career.factors.map((factor) => factor.code)).toEqual(
      expect.arrayContaining(["career-印綬", "active-dayun", "annual", "monthly"]),
    );
    expect(result.chart.synthesis.money.conclusion).toContain("技能や知識を商品化");
    expect(result.chart.synthesis.timing.favorableMonths).toEqual([1, 2, 3, 4, 9, 10, 11, 12]);
    expect(result.chart.synthesis.timing.cautionMonths).toEqual([5, 6, 7, 8]);
    expect(result.sections.map((section) => section.topic)).toContain("goodTiming");
    expect(result.sections.map((section) => section.topic)).toContain("badTiming");
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining([
        "compatiblePartner",
        "difficultPartner",
        "careerWeaknesses",
        "successKeys",
        "moneyRisk",
        "assetBuilding",
      ]),
    );
  });

  it("四柱推命v4は出生地タイムゾーン上の正確な立春時刻で年柱・月柱を切り替える", () => {
    const before = calcBaziDetailed({
      birthDate: "2004-02-04",
      birthTime: "20:30",
      timezone: "Asia/Tokyo",
    });
    const after = calcBaziDetailed({
      birthDate: "2004-02-04",
      birthTime: "21:00",
      timezone: "Asia/Tokyo",
    });

    expect(before.chart.yearPillar.stem + before.chart.yearPillar.branch).toBe("癸未");
    expect(before.chart.monthPillar.stem + before.chart.monthPillar.branch).toBe("乙丑");
    expect(after.chart.yearPillar.stem + after.chart.yearPillar.branch).toBe("甲申");
    expect(after.chart.monthPillar.stem + after.chart.monthPillar.branch).toBe("丙寅");
    expect(before.chart.solarMonth.termDateTime).not.toBe("2004-02-04 20:56:13");
    expect(after.chart.solarMonth.termDateTime).toBe("2004-02-04 20:56:13");
  });

  it("四柱推命の経度補正は世界のIANAタイムゾーンと夏時間を使う", () => {
    const summer = calcBaziDetailed({
      birthDate: "2004-07-01",
      birthTime: "12:00",
      longitude: -74.006,
      timezone: "America/New_York",
    });
    const winter = calcBaziDetailed({
      birthDate: "2004-01-01",
      birthTime: "12:00",
      longitude: -74.006,
      timezone: "America/New_York",
    });

    expect(summer.chart.trueSolarTime?.longitudeCorrectionMinutes).toBe(-56);
    expect(summer.chart.trueSolarTime?.adjustedTime).toBe("11:04");
    expect(winter.chart.trueSolarTime?.longitudeCorrectionMinutes).toBe(4);
    expect(winter.chart.trueSolarTime?.adjustedTime).toBe("12:04");
  });

  it("西洋占星術v6は主要配置を分野別に合成し約1年の運気窓を返す", () => {
    const result = calcWesternDetailed(
      {
        birthDate: "2004-02-18",
        birthTime: "13:03",
        birthPlace: "Gifu, Japan",
        latitude: 35.4233,
        longitude: 136.7607,
        timezone: "Asia/Tokyo",
      },
      "2026-07-22",
    );

    expect(result.version).toBe("western-natal-synthesis-v6");
    expect(result.chart.calculationScope).toBe("natal-synthesis-and-forecast-v6");
    expect(result.chart.planets.map((planet) => planet.name)).toEqual([
      "太陽",
      "月",
      "水星",
      "金星",
      "火星",
      "木星",
      "土星",
      "天王星",
      "海王星",
      "冥王星",
    ]);
    expect(result.chart.planets.find((planet) => planet.name === "冥王星")?.sign).toBe("いて");
    expect(result.chart.planets.find((planet) => planet.name === "冥王星")?.degree).toBe(21);
    expect(result.chart.ascendant?.sign).toBe("かに");
    expect(result.chart.midheaven).toBeDefined();
    expect(result.chart.lunarNodes[0].name).toBe("ドラゴンヘッド");
    expect(result.chart.lunarNodes[0].longitude).toBeCloseTo(45.152, 2);
    expect(result.chart.aspects.length).toBeGreaterThan(0);
    expect(result.chart.timing.targetDate).toBe("2026-07-22");
    expect(result.chart.timing.planets).toHaveLength(10);
    expect(result.chart.timing.aspects.length).toBeGreaterThan(0);
    expect(result.chart.forecast.startDate).toBe("2026-07-22");
    expect(result.chart.forecast.endDate).toBe("2027-07-22");
    expect(result.chart.forecast.windows.length).toBeGreaterThan(0);
    expect(result.chart.synthesis.love.factors.map((factor) => factor.code)).toEqual(
      expect.arrayContaining([
        "venus-sign",
        "mars-sign",
        "moon-sign",
        "descendant-sign",
        "venus-saturn-hard",
        "venus-neptune-soft",
        "mars-neptune-hard",
      ]),
    );
    expect(result.chart.synthesis.love.conclusion).toContain("惹かれる速さ");
    expect(result.chart.synthesis.love.conclusion).toContain("交際後の慎重さ");
    expect(result.chart.synthesis.love.compatiblePartner).toContain("責任感と長期的な構築");
    expect(result.chart.synthesis.career.factors.map((factor) => factor.code)).toEqual(
      expect.arrayContaining([
        "太陽-天王星-合",
        "水星-海王星-合",
        "火星-土星-セクスタイル",
        "土星-天王星-トライン",
      ]),
    );
    expect(result.chart.synthesis.money.factors.find((factor) => factor.code === "eighth-house")?.source).toContain(
      "太陽・水星・海王星",
    );
    expect(result.sections.map((section) => section.topic)).toContain("marriage");
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining([
        "compatiblePartner",
        "difficultPartner",
        "careerWeaknesses",
        "successKeys",
        "moneyRisk",
        "assetBuilding",
      ]),
    );
    expect(result.sections.map((section) => section.topic)).toContain("badTiming");
  });

  it("西洋占星術の度数と逆行はSwiss Ephemeris 2.10.03の固定値に一致する", () => {
    const natal = calcWesternChart({
      birthDate: "2004-02-18",
      birthTime: "13:03",
      latitude: 35.4233,
      longitude: 136.7607,
      timezone: "Asia/Tokyo",
    });
    const expectedNatal = {
      太陽: 328.832,
      月: 299.761,
      水星: 317.358,
      金星: 11.119,
      火星: 39.4,
      木星: 165.878,
      土星: 96.604,
      天王星: 332.559,
      海王星: 313.462,
      冥王星: 261.899,
    } as const;

    for (const planet of natal.planets) {
      expect(Math.abs(planet.longitude - expectedNatal[planet.name])).toBeLessThan(0.02);
    }
    expect(Math.abs((natal.ascendant?.longitude ?? 0) - 92.682)).toBeLessThan(0.01);
    expect(Math.abs((natal.midheaven?.longitude ?? 0) - 343.702)).toBeLessThan(0.01);
    expect(natal.planets.filter((planet) => planet.retrograde).map((planet) => planet.name)).toEqual([
      "木星",
      "土星",
    ]);

    const transit = calcWesternTransitSnapshot({
      natalPlanets: natal.planets,
      targetDate: "2026-07-22",
      timezone: "Asia/Tokyo",
    });
    const expectedTransit = {
      太陽: 119.355,
      月: 216.864,
      水星: 106.472,
      金星: 163.604,
      火星: 76.338,
      木星: 124.775,
      土星: 14.731,
      天王星: 64.656,
      海王星: 4.36,
      冥王星: 304.406,
    } as const;

    for (const planet of transit.planets) {
      expect(Math.abs(planet.longitude - expectedTransit[planet.name])).toBeLessThan(0.02);
    }
    expect(transit.planets.filter((planet) => planet.retrograde).map((planet) => planet.name)).toEqual([
      "水星",
      "海王星",
      "冥王星",
    ]);
  });

  it("紫微斗数v4は十四主星・四化・運限を領域別に統合する", () => {
    const result = calcZiwei(
      {
        gender: "male",
        birthDate: "2004-02-18",
        birthTime: "13:03",
        birthPlace: "Gifu, Japan",
        latitude: 35.4233,
        longitude: 136.7607,
        timezone: "Asia/Tokyo",
      },
      "2026-07-22",
    );

    const ming = result.chart.palaces.find((palace) => palace.name === "命宮");
    const spouse = result.chart.palaces.find((palace) => palace.name === "夫妻宮");
    const majorStars = result.chart.palaces.flatMap((palace) => palace.majorStars);

    expect(result.version).toBe("ziwei-natal-synthesis-v4");
    expect(result.chart.calculationScope).toBe("natal-and-daily-timing-v3");
    expect(result.chart.interpretationScope).toBe("weighted-domain-synthesis-v1");
    expect(result.chart.time).toBe("未時");
    expect(result.chart.mingBranch).toBe("未");
    expect(result.chart.shenBranch).toBe("酉");
    expect(ming?.majorStars.map((star) => star.name)).toEqual(["天府"]);
    expect(spouse?.majorStars.map((star) => star.name)).toEqual(["武曲", "破軍"]);
    expect(ming?.surroundedPalaces).toMatchObject({
      opposite: { name: "遷移宮", earthlyBranch: "丑" },
      wealth: { name: "財帛宮", earthlyBranch: "卯" },
      career: { name: "官禄宮", earthlyBranch: "亥" },
    });
    expect(ming?.surroundedPalaces.opposite.majorStars.map((star) => star.name)).toEqual(["廉貞", "七殺"]);
    expect(ming?.surroundedPalaces.wealth.majorStars).toHaveLength(0);
    expect(ming?.surroundedPalaces.career.majorStars.map((star) => star.name)).toEqual(["天相"]);
    expect(majorStars).toHaveLength(14);
    expect(result.chart.natalTransformations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "禄", star: "廉貞", natalPalace: "遷移宮" }),
        expect.objectContaining({ kind: "権", star: "破軍", natalPalace: "夫妻宮" }),
        expect.objectContaining({ kind: "科", star: "武曲", natalPalace: "夫妻宮" }),
        expect.objectContaining({ kind: "忌", star: "太陽", natalPalace: "兄弟宮" }),
      ]),
    );
    expect(result.chart.timing?.targetDate).toBe("2026-07-22");
    expect(result.chart.timing?.monthly).toMatchObject({
      palace: "兄弟宮",
      heavenlyStem: "乙",
      earthlyBranch: "未",
    });
    expect(result.chart.timing?.monthly.transformations.map(({ kind, star }) => `${star}化${kind}`)).toEqual([
      "天機化禄",
      "天梁化権",
      "紫微化科",
      "太陰化忌",
    ]);
    expect(result.chart.timing?.daily).toMatchObject({
      palace: "疾厄宮",
      heavenlyStem: "丁",
      earthlyBranch: "酉",
    });
    expect(result.chart.timing?.daily.transformations.map(({ kind, star }) => `${star}化${kind}`)).toEqual([
      "太陰化禄",
      "天同化権",
      "天機化科",
      "巨門化忌",
    ]);
    expect(result.chart.synthesis.love.factors.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "夫妻宮-star-0-武曲",
        "夫妻宮-star-1-破軍",
        "natal-transform-権-破軍",
        "natal-transform-科-武曲",
        "decadal-transform-忌-武曲",
      ]),
    );
    expect(result.chart.synthesis.career.factors.map((item) => item.code)).toEqual(
      expect.arrayContaining(["官禄宮-star-0-天相", "yearly-transform-忌-廉貞"]),
    );
    expect(result.chart.synthesis.money.conclusion).toContain("空宮");
    expect(result.chart.synthesis.talent.factors.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "命宮-star-0-天府",
        "福徳宮-star-0-紫微",
        "福徳宮-star-1-貪狼",
        "福徳宮-body",
      ]),
    );
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining(["marriage", "careerStrengths", "moneyRisk", "goodTiming", "badTiming"]),
    );
  });

  it("紫微斗数は性別区分が未設定なら大限を断定しない", () => {
    const result = calcZiwei({
      birthDate: "2004-02-18",
      birthTime: "13:03",
    });

    expect(result.chart.genderBasis).toBe("unspecified");
    expect(result.chart.timing).toBeUndefined();
    expect(result.chart.palaces.every((palace) => palace.decadal == null)).toBe(true);
    expect(result.confidence.reasons.join(" ")).toContain("大限・流年は表示していません");
  });

  it("紫微斗数はiztro公式の2000-08-16寅時固定盤と一致する", () => {
    const result = calcZiwei({
      birthDate: "2000-08-16",
      birthTime: "04:00",
      gender: "male",
    });
    const palace = (name: string) => result.chart.palaces.find((item) => item.name === name);

    expect(result.chart.lunarDate).toBe("二〇〇〇年七月十七");
    expect(result.chart.chineseDate).toBe("庚辰 甲申 丙午 庚寅");
    expect(result.chart.mingBranch).toBe("午");
    expect(result.chart.shenBranch).toBe("戌");
    expect(result.chart.soulStar).toBe("破軍");
    expect(result.chart.bodyStar).toBe("文昌");
    expect(palace("命宮")?.majorStars.map((star) => star.name)).toEqual(["紫微"]);
    expect(palace("夫妻宮")?.majorStars.map((star) => star.name)).toEqual(["七殺"]);
    expect(palace("官禄宮")?.majorStars.map((star) => star.name)).toEqual(["廉貞", "天府"]);
    expect(palace("官禄宮")?.isBodyPalace).toBe(true);
  });

  it("九星気学v4は節入り基準の四星と年盤・月盤の個人回座を返す", () => {
    const result = calcKyusei(
      {
        birthDate: "2004-02-18",
        birthTime: "13:03",
        timezone: "Asia/Tokyo",
      },
      "2026-07-22",
    );

    expect(result.version).toBe("kyusei-personal-rotation-v4");
    expect(result.chart.calculationScope).toBe("timezone-aware-four-stars-and-personal-rotation-v4");
    expect(result.chart.honmei.name).toBe("五黄土星");
    expect(result.chart.getsumei.name).toBe("二黒土星");
    expect(result.chart.dayStar.name).toBe("一白水星");
    expect(result.chart.timeStar.name).toBe("八白土星");
    expect(result.chart.yearGanZhi).toBe("甲申");
    expect(result.chart.monthGanZhi).toBe("丙寅");
    expect(result.chart.previousJie.name).toBe("立春");
    expect(result.chart.previousJie.dateTime).toBe("2004-02-04 20:56:13");
    expect(result.chart.nextJie.name).toBe("啓蟄");
    expect(result.chart.timing.yearBoard.centerStar.name).toBe("一白水星");
    expect(result.chart.timing.yearBoard.honmeiPlacement).toMatchObject({
      palace: "離宮",
      direction: "南",
      homeNumber: 9,
      star: { name: "五黄土星" },
    });
    expect(result.chart.timing.yearBoard.getsumeiPlacement).toMatchObject({
      palace: "乾宮",
      direction: "北西",
      star: { name: "二黒土星" },
    });
    expect(result.chart.timing.monthBoard.centerStar.name).toBe("三碧木星");
    expect(result.chart.timing.monthBoard.honmeiPlacement).toMatchObject({
      palace: "兌宮",
      direction: "西",
      homeNumber: 7,
      star: { name: "五黄土星" },
    });
    expect(result.chart.timing.monthBoard.getsumeiPlacement).toMatchObject({
      palace: "巽宮",
      direction: "南東",
      star: { name: "二黒土星" },
    });
    expect(new Set(result.chart.timing.yearBoard.placements.map((item) => item.star.number)).size).toBe(9);
    expect(new Set(result.chart.timing.monthBoard.placements.map((item) => item.palace)).size).toBe(9);
  });

  it("九星気学は立春の前後で本命星を切り替える", () => {
    const before = calcKyusei({ birthDate: "2004-02-03", birthTime: "12:00" }, "2026-07-22");
    const after = calcKyusei({ birthDate: "2004-02-05", birthTime: "12:00" }, "2026-07-22");

    expect(before.chart.honmei.name).not.toBe(after.chart.honmei.name);
    expect(before.chart.yearGanZhi).toBe("癸未");
    expect(after.chart.yearGanZhi).toBe("甲申");
  });

  it("九星気学は日本時間の立春時刻前後で本命星を切り替える", () => {
    const before = calcKyusei({
      birthDate: "2004-02-04",
      birthTime: "20:30",
      timezone: "Asia/Tokyo",
    });
    const after = calcKyusei({
      birthDate: "2004-02-04",
      birthTime: "21:00",
      timezone: "Asia/Tokyo",
    });

    expect(before.chart.yearGanZhi).toBe("癸未");
    expect(after.chart.yearGanZhi).toBe("甲申");
    expect(before.chart.honmei.name).not.toBe(after.chart.honmei.name);
  });

  it("古典マヤ暦v3は出生暦と対象日の260日・カレンダーラウンド周期を返す", () => {
    const result = calcMaya({ birthDate: "2004-02-18" }, "2026-07-22");

    expect(result.version).toBe("maya-classic-target-cycles-v3");
    expect(result.chart.calculationScope).toBe("classic-calendar-round-and-target-cycles-v3");
    expect(result.chart.longCount.formatted).toBe("12.19.11.0.11");
    expect(result.chart.tone).toBe(12);
    expect(result.chart.daySign.name).toBe("Chuwen");
    expect(result.chart.cycleDay).toBe(51);
    expect(result.chart.haab.formatted).toBe("19 Pax");
    expect(result.chart.calendarRound).toBe("12 Chuwen 19 Pax");
    expect(result.chart.lordOfNight).toBe(2);
    expect(result.chart.timing.target).toMatchObject({
      date: "2026-07-22",
      tone: 12,
      cycleDay: 181,
      daySign: { name: "Imix" },
      longCount: { formatted: "13.0.13.14.1" },
      haab: { formatted: "14 Xul" },
      calendarRound: "12 Imix 14 Xul",
    });
    expect(result.chart.timing).toMatchObject({
      daysSinceBirth: 8190,
      tzolkinOffset: 130,
      daysUntilTzolkinReturn: 130,
      calendarRoundOffset: 8190,
      daysUntilCalendarRoundReturn: 10790,
      sameTzolkinDay: false,
      sameCalendarRound: false,
    });
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining(["overallFlow", "lifeTurningPoint"]),
    );
  });

  it("古典マヤ暦の基準日は13.0.0.0.0・4 Ajaw・3 K'ank'inになる", () => {
    const result = calcMaya({ birthDate: "2012-12-21" });

    expect(result.chart.longCount.formatted).toBe("13.0.0.0.0");
    expect(result.chart.tone).toBe(4);
    expect(result.chart.daySign.name).toBe("Ajaw");
    expect(result.chart.cycleDay).toBe(160);
    expect(result.chart.haab.formatted).toBe("3 K'ank'in");
  });

  it("古典マヤ暦はFAMSI公開の2026-07-18換算例と一致する", () => {
    const result = calcMaya({ birthDate: "2026-07-18" }, "2026-07-18");

    expect(result.chart.longCount.formatted).toBe("13.0.13.13.17");
    expect(result.chart.tone).toBe(8);
    expect(result.chart.daySign.name).toBe("Kaban");
    expect(result.chart.haab.formatted).toBe("10 Xul");
    expect(result.chart.timing.sameTzolkinDay).toBe(true);
    expect(result.chart.timing.sameCalendarRound).toBe(true);
  });

  it("数秘術v4は基本数・ピナクル・チャレンジ・個人周期を領域別に統合する", () => {
    const result = calcNumerology({ birthDate: "2004-02-18" }, "2026-07-22");

    expect(result.version).toBe("numerology-pythagorean-synthesis-v4");
    expect(result.chart.interpretationScope).toBe("weighted-domain-synthesis-v1");
    expect(result.chart.lifePathNumber).toBe(8);
    expect(result.chart.birthDayNumber).toBe(9);
    expect(result.chart.attitudeNumber).toBe(2);
    expect(result.chart.personalYearNumber).toBe(3);
    expect(result.chart.personalMonthNumber).toBe(1);
    expect(result.chart.personalDayNumber).toBe(5);
    expect(result.chart.monthlyCycles.map((cycle) => cycle.number)).toEqual([4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6]);
    expect(result.chart.monthlyCycles.find((cycle) => cycle.current)).toEqual({
      month: 7,
      number: 1,
      current: true,
    });
    expect(result.chart.pinnacles.map((item) => item.number)).toEqual([11, 6, 8, 8]);
    expect(result.chart.challenges.map((item) => item.number)).toEqual([7, 3, 4, 4]);
    expect(result.chart.pinnacles.find((item) => item.current)?.index).toBe(1);
    expect(result.chart.synthesis.love.factors.map((item) => item.code)).toEqual([
      "life-path",
      "birth-day",
      "attitude",
      "pinnacle-1",
      "challenge-1",
      "personal-year",
      "personal-month",
      "personal-day",
    ]);
    expect(result.chart.synthesis.love.conclusion).toContain("ライフパス8");
    expect(result.chart.synthesis.love.conclusion).toContain("ピナクル11");
    expect(result.chart.synthesis.career.conclusion).toContain("態度数2");
    expect(result.chart.synthesis.money.conclusion).toContain("チャレンジ7");
    expect(result.chart.synthesis.talent.conclusion).toContain("誕生日数9");
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining([
        "loveStyle",
        "marriage",
        "compatiblePartner",
        "difficultPartner",
        "careerStrengths",
        "careerWeaknesses",
        "successKeys",
        "earningStyle",
        "moneyRisk",
        "assetBuilding",
        "coreTalent",
        "hiddenPotential",
      ]),
    );
  });
});
