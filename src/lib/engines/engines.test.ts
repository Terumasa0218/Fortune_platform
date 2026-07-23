import { describe, expect, it } from "vitest";
import { calcWesternChart, calcWesternTransitSnapshot } from "../astro/western";
import { calcBaziDetailed } from "./bazi-detailed";
import { calcAllFortunes } from "./index";
import { calcKyusei } from "./kyusei";
import { calcMaya } from "./maya";
import { calcNumerology } from "./numerology";
import { calcWesternDetailed } from "./western-detailed";
import { calcZiwei } from "./ziwei";
import { ZIWEI_INDEPENDENT_FIXTURES } from "./fixtures/ziwei-independent";

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
    expect(result.readings).toHaveLength(6);
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

    for (const reading of result.readings) {
      expect(reading.topics.map((topic) => topic.id)).toEqual([
        "talent",
        "love",
        "career",
        "money",
        "evidence",
      ]);
      expect(
        reading.topics
          .filter((topic) => topic.id !== "evidence")
          .every((topic) => topic.blocks.some((block) => block.tier === "free")),
      ).toBe(true);
      expect(
        reading.topics
          .filter((topic) => topic.id !== "evidence")
          .every((topic) => topic.blocks.some((block) => block.tier === "premium")),
      ).toBe(true);
      expect(
        reading.topics
          .find((topic) => topic.id === "evidence")
          ?.blocks.every((block) => block.tier === "free"),
      ).toBe(true);
    }

    const baziReading = result.readings.find((reading) => reading.method === "bazi");
    const baziFreeTitles = baziReading?.topics
      .filter((topic) => topic.id !== "evidence")
      .flatMap((topic) => topic.blocks.filter((block) => block.tier === "free"))
      .map((block) => block.title);
    expect(baziFreeTitles).toEqual([
      "才能とポテンシャル",
      "恋愛の傾向",
      "仕事で活きる力",
      "金運と稼ぎ方",
    ]);

    const baziNormalTitles = baziReading?.topics
      .filter((topic) => topic.id !== "evidence")
      .flatMap((topic) => topic.blocks.map((block) => block.title));
    expect(baziNormalTitles).not.toContain("命式の核");
    expect(baziNormalTitles).not.toContain("月令格局と社会的な役割");
    expect(
      baziReading?.topics
        .find((topic) => topic.id === "evidence")
        ?.blocks.flatMap((block) => block.body)
        .some((line) => line.includes("日主")),
    ).toBe(true);

    const terminologyByMethod = {
      ziwei: /命宮|夫妻宮|官禄宮|財帛宮|四化|大限|流年/,
      numerology: /ライフパス|誕生日数|態度数|ピナクル|チャレンジ/,
      kyusei: /本命星|月命星|傾斜|回座|同会|被同会/,
      maya: /K'iche'|ツォルキン|トレセーナ|出生日名/,
    } as const;

    for (const [method, terminology] of Object.entries(terminologyByMethod)) {
      const reading = result.readings.find((item) => item.method === method);
      const normalText = reading?.topics
        .filter((topic) => topic.id !== "evidence")
        .flatMap((topic) => topic.blocks.flatMap((block) => [block.title, ...block.body]))
        .join("\n") ?? "";
      const evidenceText = reading?.topics
        .find((topic) => topic.id === "evidence")
        ?.blocks.flatMap((block) => [block.title, ...block.body])
        .join("\n") ?? "";

      expect(normalText).not.toMatch(terminology);
      expect(evidenceText).toMatch(terminology);
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

  it("四柱推命v7は月令格局・命式・大運・流年・流月を分野別に合成する", () => {
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

    expect(result.version).toBe("bazi-structure-synthesis-v7");
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
    expect(result.chart.structure).toMatchObject({
      school: "子平真詮系・月令格局法-v1",
      primary: {
        name: "印綬格",
        tenGod: "印綬",
        hiddenStem: "甲",
        qiLabel: "本気",
        transparentPillars: ["年干 甲"],
        category: "順用",
      },
      status: "supported",
      statusLabel: "成立を支える条件あり",
    });
    expect(result.chart.structure.supports.join(" ")).toContain("食傷によって知識を外へ泄秀");
    expect(result.chart.structure.alternatives).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "劫財透干候補",
          hiddenStem: "丙",
          transparentPillars: ["月干 丙"],
        }),
      ]),
    );
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
      expect.arrayContaining(["day-master", "day-master-strength", "structure", "month-command", "god-印綬"]),
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

  it.each([
    ["1988-01-02", "正官格", "正官", "順用"],
    ["1988-01-09", "七殺格", "偏官", "逆用"],
    ["1988-01-23", "食神格", "食神", "順用"],
    ["1988-02-09", "建禄格", "比肩", "禄刃"],
    ["1988-02-16", "正財格", "正財", "順用"],
    ["1988-03-02", "偏印格", "偏印", "逆用"],
    ["1988-03-10", "陽刃格", "劫財", "禄刃"],
    ["1988-04-09", "偏財格", "偏財", "順用"],
    ["1988-04-23", "月劫格", "比肩", "禄刃"],
    ["1988-05-02", "傷官格", "傷官", "逆用"],
  ] as const)("四柱推命の月令格局を固定する: %s -> %s", (birthDate, name, tenGod, category) => {
    const result = calcBaziDetailed({ birthDate, birthTime: "12:00" }, "2026-07-22");

    expect(result.chart.structure.primary).toMatchObject({ name, tenGod, category });
    expect(result.chart.structure.primary.qiLabel).toBe("本気");
    expect(result.chart.structure.evidence[0]).toContain(`本気 ${result.chart.structure.primary.hiddenStem}`);
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

  it("紫微斗数v5は十四主星・四化・格局・運限を領域別に統合する", () => {
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

    expect(result.version).toBe("ziwei-pattern-synthesis-v5");
    expect(result.chart.calculationScope).toBe("natal-and-daily-timing-v3");
    expect(result.chart.interpretationScope).toBe("weighted-domain-and-pattern-synthesis-v2");
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
    expect(result.chart.palaces.find((item) => item.name === "財帛宮")?.majorStars).toHaveLength(0);
    expect(result.chart.palaces.find((item) => item.name === "財帛宮")?.borrowedMajorStars.length).toBeGreaterThan(0);
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

  it.each(ZIWEI_INDEPENDENT_FIXTURES)(
    "紫微斗数は独立実装の固定盤と一致する: $id",
    (fixture) => {
      const result = calcZiwei({
        birthDate: fixture.birthDate,
        birthTime: fixture.birthTime,
        gender: fixture.gender,
      });
      const palaces = Object.fromEntries(
        result.chart.palaces.map((palace) => [
          palace.earthlyBranch,
          [palace.name, ...palace.majorStars.map((star) => star.name)],
        ]),
      );

      expect(result.chart.fiveElementsClass.replace("の", "")).toBe(fixture.fiveElementsClass);
      expect(result.chart.mingBranch).toBe(fixture.mingBranch);
      expect(result.chart.shenBranch).toBe(fixture.shenBranch);
      expect(palaces).toEqual(fixture.palaces);
      expect(result.chart.palaces.flatMap((palace) => palace.majorStars)).toHaveLength(14);
    },
  );

  it.each([
    ["1980-01-01", "04:00", ["sha-po-lang"]],
    ["1980-01-01", "12:00", ["ji-yue-tong-liang"]],
    ["1980-01-01", "20:00", ["sha-po-lang", "qi-sha-chao-dou"]],
    ["1980-01-02", "02:00", ["fu-xiang-chao-yuan"]],
    ["1980-01-03", "02:00", ["ri-yue-bing-ming", "ri-zhao-lei-men"]],
    ["1980-01-05", "08:00", ["zi-fu-tong-gong"]],
    ["1980-01-05", "18:00", ["ji-ju-tong-lin"]],
    ["1980-01-08", "10:00", ["ri-yue-tong-gong"]],
    ["1980-01-11", "20:00", ["ju-ri-tong-gong"]],
  ] as const)("紫微斗数v5は代表格局を固定盤から検出する: %s %s", (birthDate, birthTime, ids) => {
    const result = calcZiwei({ birthDate, birthTime, gender: "male" });
    const detected = result.chart.patterns.map((pattern) => pattern.id);

    expect(detected).toEqual(expect.arrayContaining([...ids]));
    for (const id of ids) {
      const pattern = result.chart.patterns.find((item) => item.id === id);
      expect(pattern).toMatchObject({
        school: "紫微斗数全書系・三方四正格局-v1",
        coreCondition: expect.any(String),
        evidence: expect.any(Array),
        supportEvidence: expect.any(Array),
        challengeEvidence: expect.any(Array),
      });
      expect(pattern?.evidence.length).toBeGreaterThan(0);
    }
  });

  it("紫微斗数v5は格局を仕事・金運・才能の合成根拠へ接続する", () => {
    const result = calcZiwei({
      birthDate: "2000-08-16",
      birthTime: "04:00",
      gender: "male",
    });
    const pattern = result.chart.patterns.find((item) => item.id === "fu-xiang-chao-yuan");

    expect(pattern).toMatchObject({
      name: "府相朝垣",
      coreCondition: "官禄宮の天府と財帛宮の天相が命宮を会照",
      domains: ["career", "money", "talent"],
    });
    expect(pattern?.evidence).toEqual(expect.arrayContaining([expect.stringContaining("天府"), expect.stringContaining("天相")]));
    expect(result.chart.synthesis.career.factors.map((item) => item.code)).toEqual(
      expect.arrayContaining(["pattern-fu-xiang-chao-yuan", "pattern-fu-xiang-chao-yuan-risk"]),
    );
    expect(result.chart.synthesis.money.factors.map((item) => item.code)).toContain("pattern-fu-xiang-chao-yuan");
    expect(result.chart.synthesis.talent.factors.map((item) => item.code)).toContain("pattern-fu-xiang-chao-yuan");
  });

  it("九星気学v7は四星・傾斜・同会被同会・12節月を領域別に統合する", () => {
    const result = calcKyusei(
      {
        birthDate: "2004-02-18",
        birthTime: "13:03",
        timezone: "Asia/Tokyo",
      },
      "2026-07-22",
    );

    expect(result.version).toBe("kyusei-weighted-synthesis-v7");
    expect(result.chart.calculationScope).toBe("timezone-aware-12-month-meeting-v6");
    expect(result.chart.interpretationScope).toBe("weighted-domain-and-meeting-synthesis-v1");
    expect(result.chart.honmei.name).toBe("五黄土星");
    expect(result.chart.getsumei.name).toBe("二黒土星");
    expect(result.chart.dayStar.name).toBe("一白水星");
    expect(result.chart.timeStar.name).toBe("八白土星");
    expect(result.chart.yearGanZhi).toBe("甲申");
    expect(result.chart.monthGanZhi).toBe("丙寅");
    expect(result.chart.previousJie.name).toBe("立春");
    expect(result.chart.previousJie.dateTime).toBe("2004-02-04 20:56:13");
    expect(result.chart.nextJie.name).toBe("啓蟄");
    expect(result.chart.inclination).toMatchObject({
      school: "東洋運勢学会・月盤傾斜法（中宮裏卦）-v1",
      status: "determined",
      palace: "艮宮",
      star: { name: "八白土星" },
      centerAdjustment: false,
      rawPlacement: { palace: "艮宮", star: { name: "五黄土星" } },
    });
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
    expect(result.chart.timing.yearMeeting).toMatchObject({
      lowerBoard: "後天定位盤",
      upperBoard: "年盤",
      sameMeeting: {
        palace: "離宮",
        meetingStar: { name: "九紫火星" },
        relation: { type: "生入", polarity: "support" },
        agency: "self-initiated",
      },
      receivedMeeting: {
        palace: "中宮",
        meetingStar: { name: "一白水星" },
        relation: { type: "剋出", polarity: "challenge" },
        agency: "externally-received",
      },
    });
    expect(result.chart.timing.monthMeeting).toMatchObject({
      lowerBoard: "年盤",
      upperBoard: "月盤",
      sameMeeting: {
        palace: "兌宮",
        meetingStar: { name: "三碧木星" },
        relation: { type: "剋入", polarity: "challenge" },
      },
      receivedMeeting: {
        palace: "離宮",
        meetingStar: { name: "七赤金星" },
        relation: { type: "生出", polarity: "neutral" },
      },
    });
    expect(new Set(result.chart.timing.yearBoard.placements.map((item) => item.star.number)).size).toBe(9);
    expect(new Set(result.chart.timing.monthBoard.placements.map((item) => item.palace)).size).toBe(9);
    expect(result.chart.timing.solarYear).toBe(2026);
    expect(result.chart.timing.monthlyWindows).toHaveLength(12);
    expect(result.chart.timing.monthlyWindows.map((item) => item.monthBoard.centerStar.number)).toEqual([
      8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7, 6,
    ]);
    expect(result.chart.timing.monthlyWindows.filter((item) => item.active)).toEqual([
      expect.objectContaining({
        termName: "小暑",
        startDateTime: expect.stringMatching(/^2026-07-/),
        endDateTime: expect.stringMatching(/^2026-08-/),
        supportScore: -2,
        classification: "demanding",
        monthBoard: expect.objectContaining({ centerStar: expect.objectContaining({ name: "三碧木星" }) }),
        meeting: expect.objectContaining({
          sameMeeting: expect.objectContaining({ meetingStar: expect.objectContaining({ name: "三碧木星" }) }),
          receivedMeeting: expect.objectContaining({ meetingStar: expect.objectContaining({ name: "七赤金星" }) }),
        }),
      }),
    ]);
    expect(result.chart.synthesis.love.factors.map((item) => item.code)).toEqual([
      "honmei",
      "getsumei",
      "inclination",
      "day-star",
      "year-same-meeting",
      "year-received-meeting",
      "month-same-meeting",
      "month-received-meeting",
    ]);
    expect(result.chart.synthesis.love.factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "honmei", polarity: "strength", weight: 0.96 }),
        expect.objectContaining({ code: "year-same-meeting", polarity: "strength" }),
        expect.objectContaining({ code: "year-received-meeting", polarity: "challenge" }),
        expect.objectContaining({ code: "month-same-meeting", polarity: "challenge" }),
      ]),
    );
    expect(result.chart.synthesis.love.compatiblePartner).toContain("対等に異論を言える人");
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining([
        "hiddenPotential",
        "compatiblePartner",
        "difficultPartner",
        "careerStyle",
        "moneyRisk",
        "goodTiming",
        "badTiming",
      ]),
    );
  });

  it("九星気学v7は立春前の対象日を前年の12節月へ含める", () => {
    const result = calcKyusei(
      { birthDate: "2004-02-18", birthTime: "13:03", timezone: "Asia/Tokyo" },
      "2026-01-20",
    );

    expect(result.chart.timing.solarYear).toBe(2025);
    expect(result.chart.timing.monthlyWindows[0].termName).toBe("立春");
    expect(result.chart.timing.monthlyWindows[11].termName).toBe("小寒");
    expect(result.chart.timing.monthlyWindows.filter((item) => item.active)).toEqual([
      expect.objectContaining({ termName: "小寒" }),
    ]);
  });

  it("九星気学は立春の前後で本命星を切り替える", () => {
    const before = calcKyusei({ birthDate: "2004-02-03", birthTime: "12:00" }, "2026-07-22");
    const after = calcKyusei({ birthDate: "2004-02-05", birthTime: "12:00" }, "2026-07-22");

    expect(before.chart.honmei.name).not.toBe(after.chart.honmei.name);
    expect(before.chart.yearGanZhi).toBe("癸未");
    expect(after.chart.yearGanZhi).toBe("甲申");
  });

  it.each([
    ["1990-09-15", "離宮", "九紫火星"],
    ["1991-07-15", "坎宮", "一白水星"],
    ["1992-05-15", "兌宮", "七赤金星"],
    ["1993-03-15", "艮宮", "八白土星"],
    ["1994-10-15", "坤宮", "二黒土星"],
    ["1995-08-15", undefined, undefined],
    ["1996-06-15", "震宮", "三碧木星"],
    ["1997-04-15", "巽宮", "四緑木星"],
    ["1998-02-15", "乾宮", "六白金星"],
  ] as const)("九星気学v7は中宮傾斜の裏卦と合成結果を固定する: %s", (birthDate, palace, star) => {
    const result = calcKyusei({ birthDate, birthTime: "12:00" }, "2026-07-22");

    expect(result.chart.honmei.number).toBe(result.chart.getsumei.number);
    expect(result.chart.inclination.centerAdjustment).toBe(true);
    expect(result.chart.inclination.palace).toBe(palace);
    expect(result.chart.inclination.star?.name).toBe(star);
    expect(result.chart.inclination.status).toBe(
      palace ? "determined" : "center-five-undetermined",
    );
    expect(result.chart.synthesis.talent.conclusion.length).toBeGreaterThan(40);
    expect(result.chart.synthesis.career.factors.map((item) => item.code)).toContain("honmei");
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

  it("古典マヤ暦v4は出生暦、13日区間、回帰日、共鳴窓を返す", () => {
    const result = calcMaya({ birthDate: "2004-02-18" }, "2026-07-22");

    expect(result.version).toBe("maya-classic-living-tradition-v5");
    expect(result.chart.calculationScope).toBe("classic-calendar-round-and-resonance-windows-v4");
    expect(result.chart.interpretationScope).toBe(
      "weighted-living-tradition-synthesis-v2",
    );
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
      previousTzolkinReturnDate: "2026-03-14",
      nextTzolkinReturnDate: "2026-11-29",
      nextCalendarRoundReturnDate: "2056-02-05",
    });
    expect(result.chart.timing.targetTrecenaWindow).toMatchObject({
      startDate: "2026-07-11",
      endDate: "2026-07-23",
      daySign: { name: "Ok" },
    });
    expect(result.chart.timing.upcomingResonanceWindows).toHaveLength(32);
    expect(
      result.chart.timing.upcomingResonanceWindows.filter((item) =>
        item.matches.includes("exact-tzolkin-return"),
      ),
    ).toEqual([
      expect.objectContaining({
        date: "2026-11-29",
        offsetDays: 130,
        tone: 12,
        daySign: expect.objectContaining({ name: "Chuwen" }),
      }),
    ]);
    expect(result.chart.synthesis.love.factors.map((item) => item.code)).toEqual([
      "living-tradition",
      "birth-day-sign",
      "birth-day-sign-shadow",
      "birth-trecena",
      "target-day",
      "target-trecena",
      "next-return",
    ]);
    expect(result.chart.synthesis.love.factors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "living-tradition", provenance: "living-kiche-tradition" }),
        expect.objectContaining({ code: "birth-day-sign", provenance: "modern-symbolic" }),
        expect.objectContaining({ code: "target-trecena", provenance: "classic-calendar" }),
      ]),
    );
    expect(result.sections.map((section) => section.topic)).toEqual(
      expect.arrayContaining([
        "compatiblePartner",
        "difficultPartner",
        "careerStrengths",
        "careerWeaknesses",
        "assetBuilding",
        "hiddenPotential",
        "overallFlow",
        "lifeTurningPoint",
      ]),
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

  it.each([
    ["2012-12-02", "Imix", "IMOX", "海・川・湖"],
    ["2012-12-03", "Ik", "IQ'", "風・空気・精神・空の心"],
    ["2012-12-04", "Akbal", "AQ'AB'AL", "闇・夜明け・手"],
    ["2012-12-05", "Kan", "K'AT", "網・もつれ・解きほぐし"],
    ["2012-12-06", "Chicchan", "KAN", "羽毛ある蛇"],
    ["2012-12-07", "Cimi", "KAME", "死・善悪を含む移行"],
    ["2012-12-08", "Manik", "KEJ", "鹿・天地を支える四本の柱"],
    ["2012-12-09", "Lamat", "Q'ANIL", "種・黄色・金・四季"],
    ["2012-12-10", "Muluk", "TOJ", "供物・支払い・助け・傾聴・理解"],
    ["2012-12-11", "Ok", "TZ'I'", "犬・人間の五感・物質的精神的正義"],
    ["2012-12-12", "Chuwen", "B'ATZ'", "糸・運命・過去からの連続性"],
    ["2012-12-13", "Eb", "E", "道"],
    ["2012-12-14", "Ben", "AJ", "トウモロコシ畑・神聖な力を持つ杖"],
    ["2012-12-15", "Ix", "I'X", "虎・生命力・祭壇・知恵"],
    ["2012-12-16", "Men", "TZ'IKIN", "鳥・空間・金銭・事業・商人"],
    ["2012-12-17", "Kib", "AJMAQ", "意志・過ちを防ぐ日"],
    ["2012-12-18", "Kaban", "NO'J", "知恵・判断・理性・思考"],
    ["2012-12-19", "Etznab", "TIJAX", "運命・黒曜石の刃・突発的誘惑"],
    ["2012-12-20", "Kawak", "KAWOQ", "雷・蟻・女性"],
    ["2012-12-21", "Ajaw", "AJPU'", "生命・運命・植物・動物・太陽"],
  ])("古典マヤ暦v5は20日名をK'iche' Chol Q'ij伝統へ対応づける: %s", (date, yucatec, kiche, etymology) => {
    const result = calcMaya({ birthDate: date }, date);

    expect(result.chart.daySign.name).toBe(yucatec);
    expect(result.chart.daySign.livingTradition).toMatchObject({
      system: "K'iche' Chol Q'ij",
      name: kiche,
      etymology,
      source: "Smithsonian NMAI / K'iche' Day Keepers Komon Tohil",
    });
    expect(result.chart.daySign.livingTradition.qualities.length).toBeGreaterThan(0);
  });

  it("古典マヤ暦はFAMSI公開の2026-07-18換算例と一致する", () => {
    const result = calcMaya({ birthDate: "2026-07-18" }, "2026-07-18");

    expect(result.chart.longCount.formatted).toBe("13.0.13.13.17");
    expect(result.chart.tone).toBe(8);
    expect(result.chart.daySign.name).toBe("Kaban");
    expect(result.chart.haab.formatted).toBe("10 Xul");
    expect(result.chart.timing.sameTzolkinDay).toBe(true);
    expect(result.chart.timing.sameCalendarRound).toBe(true);
    expect(result.chart.timing.previousTzolkinReturnDate).toBe("2026-07-18");
    expect(result.chart.timing.nextTzolkinReturnDate).toBe("2027-04-04");
  });

  it.each([
    ["2012-12-21", "2013-09-07"],
    ["2004-02-18", "2004-11-04"],
    ["2024-02-29", "2024-11-15"],
    ["1900-01-01", "1900-09-18"],
    ["2099-12-31", "2100-09-17"],
  ])("古典マヤ暦は260日後に係数・日名・cycleDayが戻る: %s", (birthDate, returnDate) => {
    const birth = calcMaya({ birthDate }, birthDate);
    const returned = calcMaya({ birthDate }, returnDate);

    expect(returned.chart.timing.daysSinceBirth).toBe(260);
    expect(returned.chart.timing.sameTzolkinDay).toBe(true);
    expect(returned.chart.timing.target.tone).toBe(birth.chart.tone);
    expect(returned.chart.timing.target.daySign.name).toBe(birth.chart.daySign.name);
    expect(returned.chart.timing.target.cycleDay).toBe(birth.chart.cycleDay);
    expect(returned.chart.timing.sameCalendarRound).toBe(false);
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
    expect(result.chart.synthesis.love.factors.map((item) => item.source)).toEqual(
      expect.arrayContaining(["ライフパス 8", "第1ピナクル 11（0-28歳）"]),
    );
    expect(result.chart.synthesis.career.factors.map((item) => item.source)).toContain("態度数 2");
    expect(result.chart.synthesis.money.factors.map((item) => item.source)).toContain("第1チャレンジ 7（0-28歳）");
    expect(result.chart.synthesis.talent.factors.map((item) => item.source)).toContain("誕生日数 9");
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
