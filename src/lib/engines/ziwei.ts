import { astro } from "iztro";
import { dateInTimezone } from "../time/chineseCalendarTime";
import type { IFunctionalAstrolabe } from "iztro/lib/astro/FunctionalAstrolabe";
import {
  BirthProfileInput,
  DetailedFortuneResult,
  FortuneSection,
  FortuneSignal,
  confidenceFromScore,
  defaultConfidence,
  sectionsToDomainReadings,
} from "./types";
import {
  buildZiweiSynthesis,
  type ZiweiSynthesis,
  type ZiweiTopicSynthesis,
} from "./ziwei-synthesis";
import { detectZiweiPatterns, type ZiweiPattern } from "./ziwei-patterns";

export type PalaceName =
  | "命宮"
  | "兄弟宮"
  | "夫妻宮"
  | "子女宮"
  | "財帛宮"
  | "疾厄宮"
  | "遷移宮"
  | "交友宮"
  | "官禄宮"
  | "田宅宮"
  | "福徳宮"
  | "父母宮";

export type ZiweiStar = {
  name: string;
  category: "major" | "minor" | "adjective";
  brightness?: string;
  mutagen?: "禄" | "権" | "科" | "忌";
};

export type ZiweiTransformation = {
  kind: "禄" | "権" | "科" | "忌";
  star: string;
  natalPalace?: PalaceName;
};

export type ZiweiRelatedPalace = {
  name: PalaceName;
  earthlyBranch: string;
  majorStars: ZiweiStar[];
};

export type ZiweiPalace = {
  name: PalaceName;
  heavenlyStem: string;
  earthlyBranch: string;
  isBodyPalace: boolean;
  isOriginalPalace: boolean;
  majorStars: ZiweiStar[];
  borrowedMajorStars: ZiweiStar[];
  minorStars: ZiweiStar[];
  adjectiveStars: ZiweiStar[];
  changsheng12: string;
  decadal?: {
    range: [number, number];
    heavenlyStem: string;
    earthlyBranch: string;
  };
  ages: number[];
  meaning: string;
  surroundedPalaces: {
    opposite: ZiweiRelatedPalace;
    wealth: ZiweiRelatedPalace;
    career: ZiweiRelatedPalace;
  };
};

export type ZiweiTiming = {
  targetDate: string;
  nominalAge: number;
  decadal: {
    palace: PalaceName;
    heavenlyStem: string;
    earthlyBranch: string;
    transformations: ZiweiTransformation[];
  };
  yearly: {
    palace: PalaceName;
    heavenlyStem: string;
    earthlyBranch: string;
    transformations: ZiweiTransformation[];
  };
  monthly: {
    palace: PalaceName;
    heavenlyStem: string;
    earthlyBranch: string;
    transformations: ZiweiTransformation[];
  };
  daily: {
    palace: PalaceName;
    heavenlyStem: string;
    earthlyBranch: string;
    transformations: ZiweiTransformation[];
  };
};

export type ZiweiBaseChart = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  time: string;
  timeRange: string;
  timeIndex: number;
  timeAssumed: boolean;
  genderBasis: "male" | "female" | "unspecified";
  zodiac: string;
  mingBranch: string;
  shenBranch: string;
  soulStar: string;
  bodyStar: string;
  fiveElementsClass: string;
  palaces: ZiweiPalace[];
  natalTransformations: ZiweiTransformation[];
  patterns: ZiweiPattern[];
  timing?: ZiweiTiming;
  calculationScope: "natal-and-daily-timing-v3";
  calculationMethod: "iztro-default";
  calculationLibraryVersion: "2.5.8";
};

export type ZiweiChart = ZiweiBaseChart & {
  synthesis: ZiweiSynthesis;
  interpretationScope: "weighted-domain-and-pattern-synthesis-v2";
};

type MajorStarMeaning = {
  keywords: string[];
  strength: string;
  challenge: string;
  advice: string;
};

const MAJOR_STAR_MEANING: Record<string, MajorStarMeaning> = {
  紫微: {
    keywords: ["統率", "大局観", "尊厳"],
    strength: "長期的な視点で全体をまとめ、責任ある立場で構想を形にできます。",
    challenge: "理想や自尊心が先行すると、周囲との距離や過大評価が生まれやすくなります。",
    advice: "知識と実務力を積み、任せられる協力者を育てるほど統率力が安定します。",
  },
  天機: {
    keywords: ["知略", "企画", "適応"],
    strength: "変化を素早く読み、複数の選択肢や改善策を組み立てられます。",
    challenge: "考えが広がりすぎると、決断や継続が遅れやすくなります。",
    advice: "仮説を期限付きの実験へ変え、知識の深さと実行量を補いましょう。",
  },
  太陽: {
    keywords: ["発信", "公共性", "主導"],
    strength: "人前で方向を示し、情報や価値を広く伝える力があります。",
    challenge: "善意や主導性が強すぎると、相手への圧力や境界線の越境になり得ます。",
    advice: "相手の裁量を残した伝え方を選ぶと、影響力が信頼につながります。",
  },
  武曲: {
    keywords: ["実行", "財務", "自立"],
    strength: "現実的な判断と行動力で、資源や数字を成果へ変えられます。",
    challenge: "結論を急いだり一人で抱えたりすると、対話と計画が不足しやすくなります。",
    advice: "実行前に第三者の視点を入れると、強い決断力を長期成果へつなげられます。",
  },
  天同: {
    keywords: ["共感", "調和", "享受"],
    strength: "人を安心させ、柔らかな関係や居心地のよい環境を作れます。",
    challenge: "衝突を避けすぎると、必要な決断や負荷への耐性が育ちにくくなります。",
    advice: "守りたい快適さを明確にし、そのための小さな責任を引き受けましょう。",
  },
  廉貞: {
    keywords: ["規律", "戦略", "美意識"],
    strength: "複雑な利害やルールを読み、魅力と戦略性を両立できます。",
    challenge: "評価や勝敗への執着が強まると、関係が緊張しやすくなります。",
    advice: "譲れない原則と柔軟に交渉できる条件を分けることが鍵です。",
  },
  天府: {
    keywords: ["管理", "蓄積", "安定"],
    strength: "人や資源を落ち着いて管理し、長く続く基盤を作れます。",
    challenge: "安定を守ろうとするほど、変化への着手が遅れたり抱え込みやすくなります。",
    advice: "余力を蓄えるだけでなく、使う基準と更新時期も先に決めましょう。",
  },
  太陰: {
    keywords: ["観察", "受容", "内省"],
    strength: "細部と感情の変化を捉え、静かな配慮や計画へ変えられます。",
    challenge: "不安を内側で反復すると、慎重さが消極性へ傾きやすくなります。",
    advice: "感じたことを記録し、確認可能な事実と想像を分けて扱いましょう。",
  },
  貪狼: {
    keywords: ["好奇心", "社交", "多才"],
    strength: "新しい人や分野へ入り、魅力と学習速度で機会を増やせます。",
    challenge: "興味や欲求が広がりすぎると、集中と節度が崩れやすくなります。",
    advice: "探索する期間と仕上げる期間を分けると、多才さが実績になります。",
  },
  巨門: {
    keywords: ["言語", "検証", "問題提起"],
    strength: "疑問を言語化し、議論や調査によって見落とされた論点を明らかにできます。",
    challenge: "疑念や批判が強まると、言葉が対立や自己防衛に偏りやすくなります。",
    advice: "結論だけでなく根拠と改善案を添えると、鋭さが専門性として伝わります。",
  },
  天相: {
    keywords: ["調整", "公平", "補佐"],
    strength: "立場の違う人を調整し、運用と品質を整える力があります。",
    challenge: "周囲の期待を優先しすぎると、自分の判断軸が曖昧になりやすいです。",
    advice: "公平さの基準を明文化し、必要な場面では自分の結論を示しましょう。",
  },
  天梁: {
    keywords: ["保護", "倫理", "助言"],
    strength: "経験や原則を使って人を守り、長期的な視点から助言できます。",
    challenge: "正しさや保護意識が強すぎると、説教的または過干渉になりやすくなります。",
    advice: "相手が求める支援量を確認してから知恵を渡すと、信頼が深まります。",
  },
  七殺: {
    keywords: ["決断", "突破", "独立"],
    strength: "不確実な状況でも腹を決め、難所を突破する集中力があります。",
    challenge: "速度と独立性を優先すると、調整不足や極端な判断につながりやすくなります。",
    advice: "撤退条件と確認役を先に置くと、大胆さを安全に活かせます。",
  },
  破軍: {
    keywords: ["改革", "再編", "挑戦"],
    strength: "古い仕組みを壊して組み替え、大きな変化を起こす力があります。",
    challenge: "変化そのものが目的になると、蓄積や人間関係まで失いやすくなります。",
    advice: "残す資産と変える対象を分け、改革後の運用まで設計しましょう。",
  },
};

const PALACE_NAME_MAP: Record<string, PalaceName> = {
  命宮: "命宮",
  兄弟: "兄弟宮",
  夫妻: "夫妻宮",
  子女: "子女宮",
  財帛: "財帛宮",
  疾厄: "疾厄宮",
  遷移: "遷移宮",
  僕役: "交友宮",
  官祿: "官禄宮",
  田宅: "田宅宮",
  福德: "福徳宮",
  父母: "父母宮",
};

const PALACE_MEANING: Record<PalaceName, string> = {
  命宮: "本人の気質、中心的な才能、人生の基本姿勢",
  兄弟宮: "兄弟姉妹、近い仲間、横のつながり",
  夫妻宮: "恋愛、結婚、パートナー像、長期関係",
  子女宮: "子ども、創作、後進育成、楽しみ",
  財帛宮: "稼ぎ方、金銭感覚、資源の扱い方",
  疾厄宮: "体質、疲れ方、心身の管理",
  遷移宮: "外部環境、移動、社会から見える姿",
  交友宮: "友人、協力者、部下、チームとの縁",
  官禄宮: "仕事、役割、社会的評価、キャリア",
  田宅宮: "住まい、家族基盤、所有、蓄積",
  福徳宮: "精神的満足、内面、趣味、幸福感",
  父母宮: "親、上司、保護者、目上との関係",
};

const MUTAGEN_MAP: Record<string, ZiweiTransformation["kind"]> = {
  祿: "禄",
  禄: "禄",
  權: "権",
  権: "権",
  科: "科",
  忌: "忌",
};

function normalizePalaceName(name: string): PalaceName {
  const normalized = PALACE_NAME_MAP[name];
  if (!normalized) throw new Error(`Unsupported Zi Wei palace name: ${name}`);
  return normalized;
}

function normalizeMutagen(mutagen?: string): ZiweiStar["mutagen"] {
  return mutagen ? MUTAGEN_MAP[mutagen] : undefined;
}

function timeIndexFromBirthTime(birthTime?: string | null): { index: number; assumed: boolean } {
  const match = birthTime ? /^([01]\d|2[0-3]):([0-5]\d)$/.exec(birthTime) : null;
  if (!match) return { index: 6, assumed: true };

  const hour = Number(match[1]);
  if (hour === 23) return { index: 12, assumed: false };
  if (hour === 0) return { index: 0, assumed: false };
  return { index: Math.floor((hour + 1) / 2), assumed: false };
}

function genderBasis(input: BirthProfileInput): ZiweiChart["genderBasis"] {
  if (input.gender === "male" || input.gender === "female") return input.gender;
  return "unspecified";
}

function toLibraryGender(gender: ZiweiChart["genderBasis"]): "male" | "female" {
  // Main-star placement is gender independent. Unknown/non-binary input uses a
  // neutral placeholder only to obtain the natal chart; gender-based timing is omitted.
  return gender === "female" ? "female" : "male";
}

function mapStar(
  star: { name: string; brightness?: string; mutagen?: string },
  category: ZiweiStar["category"],
): ZiweiStar {
  return {
    name: star.name,
    category,
    brightness: star.brightness || undefined,
    mutagen: normalizeMutagen(star.mutagen),
  };
}

function buildPalaces(astrolabe: IFunctionalAstrolabe, includeGenderTiming: boolean): ZiweiPalace[] {
  const raw = astrolabe.palaces;

  return raw.map((palace, index) => {
    const opposite = raw[(index + 6) % 12];
    const majorStars = palace.majorStars.map((star) => mapStar(star, "major"));
    const borrowedMajorStars = majorStars.length
      ? []
      : opposite.majorStars.map((star) => mapStar(star, "major"));
    const name = normalizePalaceName(palace.name);
    const surrounded = astrolabe.surroundedPalaces(index);
    const relatedPalace = (related: typeof surrounded.opposite): ZiweiRelatedPalace => ({
      name: normalizePalaceName(related.name),
      earthlyBranch: related.earthlyBranch,
      majorStars: related.majorStars.map((star) => mapStar(star, "major")),
    });

    return {
      name,
      heavenlyStem: palace.heavenlyStem,
      earthlyBranch: palace.earthlyBranch,
      isBodyPalace: palace.isBodyPalace,
      isOriginalPalace: palace.isOriginalPalace,
      majorStars,
      borrowedMajorStars,
      minorStars: palace.minorStars.map((star) => mapStar(star, "minor")),
      adjectiveStars: palace.adjectiveStars.map((star) => mapStar(star, "adjective")),
      changsheng12: palace.changsheng12,
      decadal: includeGenderTiming
        ? {
            range: palace.decadal.range,
            heavenlyStem: palace.decadal.heavenlyStem,
            earthlyBranch: palace.decadal.earthlyBranch,
          }
        : undefined,
      ages: includeGenderTiming ? palace.ages : [],
      meaning: PALACE_MEANING[name],
      surroundedPalaces: {
        opposite: relatedPalace(surrounded.opposite),
        wealth: relatedPalace(surrounded.wealth),
        career: relatedPalace(surrounded.career),
      },
    };
  });
}

function findStarPalace(palaces: ZiweiPalace[], starName: string): PalaceName | undefined {
  return palaces.find((palace) =>
    [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars].some(
      (star) => star.name === starName,
    ),
  )?.name;
}

function transformationsFromNames(
  names: string[],
  palaces: ZiweiPalace[],
): ZiweiTransformation[] {
  const kinds: ZiweiTransformation["kind"][] = ["禄", "権", "科", "忌"];
  return names.slice(0, 4).map((star, index) => ({
    kind: kinds[index],
    star,
    natalPalace: findStarPalace(palaces, star),
  }));
}

function natalTransformations(palaces: ZiweiPalace[]): ZiweiTransformation[] {
  return palaces.flatMap((palace) =>
    [...palace.majorStars, ...palace.minorStars, ...palace.adjectiveStars]
      .filter((star): star is ZiweiStar & { mutagen: ZiweiTransformation["kind"] } => Boolean(star.mutagen))
      .map((star) => ({ kind: star.mutagen, star: star.name, natalPalace: palace.name })),
  );
}

function isoDate(date: Date | string): string {
  if (typeof date === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid targetDate. Expected YYYY-MM-DD.");
    return date;
  }
  return date.toISOString().slice(0, 10);
}

function buildTiming(
  astrolabe: IFunctionalAstrolabe,
  palaces: ZiweiPalace[],
  targetDate: Date | string,
): ZiweiTiming {
  const target = isoDate(targetDate);
  const horoscope = astrolabe.horoscope(target);
  const decadalPalace = palaces[horoscope.decadal.index];
  const yearlyPalace = palaces[horoscope.yearly.index];
  const monthlyPalace = palaces[horoscope.monthly.index];
  const dailyPalace = palaces[horoscope.daily.index];

  return {
    targetDate: target,
    nominalAge: horoscope.age.nominalAge,
    decadal: {
      palace: decadalPalace.name,
      heavenlyStem: horoscope.decadal.heavenlyStem,
      earthlyBranch: horoscope.decadal.earthlyBranch,
      transformations: transformationsFromNames(horoscope.decadal.mutagen, palaces),
    },
    yearly: {
      palace: yearlyPalace.name,
      heavenlyStem: horoscope.yearly.heavenlyStem,
      earthlyBranch: horoscope.yearly.earthlyBranch,
      transformations: transformationsFromNames(horoscope.yearly.mutagen, palaces),
    },
    monthly: {
      palace: monthlyPalace.name,
      heavenlyStem: horoscope.monthly.heavenlyStem,
      earthlyBranch: horoscope.monthly.earthlyBranch,
      transformations: transformationsFromNames(horoscope.monthly.mutagen, palaces),
    },
    daily: {
      palace: dailyPalace.name,
      heavenlyStem: horoscope.daily.heavenlyStem,
      earthlyBranch: horoscope.daily.earthlyBranch,
      transformations: transformationsFromNames(horoscope.daily.mutagen, palaces),
    },
  };
}

function palaceByName(chart: ZiweiChart, name: PalaceName): ZiweiPalace {
  const palace = chart.palaces.find((item) => item.name === name);
  if (!palace) throw new Error(`Zi Wei palace not found: ${name}`);
  return palace;
}

function effectiveMajorStars(palace: ZiweiPalace): ZiweiStar[] {
  return palace.majorStars.length ? palace.majorStars : palace.borrowedMajorStars;
}

function starLabel(star: ZiweiStar): string {
  return `${star.name}${star.brightness ? `（${star.brightness}）` : ""}${star.mutagen ? `・化${star.mutagen}` : ""}`;
}

function palaceEvidence(palace: ZiweiPalace): string[] {
  const direct = palace.majorStars.length > 0;
  const stars = effectiveMajorStars(palace);
  const secondary = palace.minorStars.slice(0, 4).map(starLabel);
  const surrounded = palace.surroundedPalaces;
  const relatedLabel = (role: string, related: ZiweiRelatedPalace) =>
    `${role}: ${related.name}${related.earthlyBranch} ${related.majorStars.map(starLabel).join("・") || "主星なし"}`;
  return [
    `${palace.name}: ${palace.heavenlyStem}${palace.earthlyBranch}`,
    direct
      ? `主星: ${stars.map(starLabel).join("・")}`
      : `空宮のため対宮主星を参照: ${stars.map(starLabel).join("・") || "主星なし"}`,
    ...(secondary.length ? [`補助星: ${secondary.join("・")}`] : []),
    `三方四正 / ${relatedLabel("対宮", surrounded.opposite)} / ${relatedLabel("財帛位", surrounded.wealth)} / ${relatedLabel("官禄位", surrounded.career)}`,
    ...(palace.isBodyPalace ? ["身宮が重なる宮"] : []),
  ];
}

function sectionFromPalace(
  chart: ZiweiChart,
  palaceName: PalaceName,
  theme: FortuneSection["theme"],
  topic: FortuneSection["topic"],
  title: string,
  framing: string,
): FortuneSection {
  const palace = palaceByName(chart, palaceName);
  const stars = effectiveMajorStars(palace);
  const meanings = stars.map((star) => MAJOR_STAR_MEANING[star.name]).filter(Boolean);
  const starNames = stars.map((star) => star.name).join("・") || "主星なし";
  const borrowed = palace.majorStars.length === 0 && palace.borrowedMajorStars.length > 0;
  const surroundedStars = [
    ...palace.surroundedPalaces.opposite.majorStars,
    ...palace.surroundedPalaces.wealth.majorStars,
    ...palace.surroundedPalaces.career.majorStars,
  ];
  const surroundedStarNames = [...new Set(surroundedStars.map((star) => star.name))];
  const surroundedKeywords = surroundedStars
    .flatMap((star) => MAJOR_STAR_MEANING[star.name]?.keywords ?? [])
    .slice(0, 4);

  return {
    theme,
    topic,
    title,
    summary: `${palaceName}の${borrowed ? "対宮参照主星" : "主星"}は ${starNames}。${framing}${meanings
      .map((meaning) => meaning.strength)
      .join("")}`,
    keywords: [...new Set([...meanings.flatMap((meaning) => meaning.keywords), ...surroundedKeywords])],
    strengths: [
      ...meanings.map((meaning) => meaning.strength),
      ...(surroundedStarNames.length
        ? [`三方四正の主星 ${surroundedStarNames.join("・")} は、この宮の働きを支える周辺条件として読みます。`]
        : []),
    ],
    challenges: meanings.map((meaning) => meaning.challenge),
    advice: meanings.map((meaning) => meaning.advice),
    evidence: palaceEvidence(palace),
  };
}

function timingSections(chart: ZiweiChart): FortuneSection[] {
  if (!chart.timing) {
    return [
      {
        theme: "timing",
        topic: "overallFlow",
        title: "時期の詳しい判定",
        summary: "現在の入力内容では、長期的な運気の巡り方を一つに確定できないため、時期については断定を控えています。",
        keywords: ["時期未確定"],
        strengths: [],
        challenges: ["長期的な運気の順序が二通り考えられるため、良い時期・注意する時期に幅が出ます。"],
        advice: ["入力内容を確認すると、10年単位の流れと対象年の動きを重ねて詳しく判定できます。"],
        evidence: ["紫微斗数の大限配置は伝統上の男女区分を使用"],
      },
    ];
  }

  const positive = chart.timing.yearly.transformations.filter((item) => item.kind !== "忌");
  const caution = chart.timing.yearly.transformations.find((item) => item.kind === "忌");
  const year = chart.timing.targetDate.slice(0, 4);
  const monthly = chart.timing.monthly;
  const daily = chart.timing.daily;

  return [
    {
      theme: "timing",
      topic: "goodTiming",
      title: `${year}年に伸ばしやすい領域`,
      summary: "この年は、機会が増える領域、責任が強まる領域、評価されやすい領域を分けて見ることが大切です。追い風がある場所ほど、役割と期限を明確にすると成果へつながります。",
      keywords: positive.map((item) => `${item.natalPalace ?? "配置確認中"}・化${item.kind}`),
      strengths: positive.map((item) =>
        item.kind === "禄"
          ? "人、情報、資源の流れが生まれやすく、機会を受け取りやすい領域があります。"
          : item.kind === "権"
            ? "責任と決定権が強まり、自分の判断を形にしやすい領域があります。"
            : "努力を整理して見せることで、評価や信頼につながりやすい領域があります。",
      ),
      challenges: [],
      advice: ["一年だけで吉凶を決めず、生まれ持った傾向と長期的な流れに共通するテーマを優先しましょう。"],
      evidence: [
        `対象日 ${chart.timing.targetDate} / 流年 ${chart.timing.yearly.heavenlyStem}${chart.timing.yearly.earthlyBranch}`,
        `流月命宮 ${monthly.palace} / ${monthly.heavenlyStem}${monthly.earthlyBranch}`,
        `流日命宮 ${daily.palace} / ${daily.heavenlyStem}${daily.earthlyBranch}`,
        ...positive.map((item) => `${item.star} 化${item.kind} -> ${item.natalPalace ?? "所在宮不明"}`),
      ],
    },
    {
      theme: "timing",
      topic: "badTiming",
      title: `${year}年に丁寧に扱う領域`,
      summary: caution
        ? "執着、行き違い、やり直しが起こりやすい領域があります。悪い年と決めつけず、確認不足を補い、優先順位を見直す時期として使うことが大切です。"
        : "この年に特に注意を向ける領域を一つに絞れないため、大きな決断では確認の回数を増やします。",
      keywords: caution ? [`${caution.natalPalace ?? "配置確認中"}・化忌`, "再検討"] : ["要確認"],
      strengths: ["注意点を先に言語化することで、修正と準備に使えます。"],
      challenges: caution ? ["一つの考えや結果へこだわりすぎると、対話や修正が遅れやすくなります。"] : [],
      advice: ["重要な決定は、感情的な反応と確認可能な事実を分けて見直しましょう。"],
      evidence: caution ? [`${caution.star} 化忌 -> ${caution.natalPalace ?? "所在宮不明"}`] : [],
    },
  ];
}

function buildSections(chart: ZiweiChart): FortuneSection[] {
  const sectionFromSynthesis = (
    base: FortuneSection,
    synthesis: ZiweiTopicSynthesis,
  ): FortuneSection => ({
    ...base,
    summary: synthesis.conclusion,
    strengths: [...new Set(synthesis.strengths)],
    challenges: [...new Set(synthesis.challenges)],
    advice: [...new Set(synthesis.advice)],
    evidence: synthesis.factors
      .sort((left, right) => right.weight - left.weight)
      .map(
        (item) =>
          `${item.source} / weight ${item.weight.toFixed(2)} / ${item.interpretation}`,
      ),
  });
  const loveBase = sectionFromPalace(
    chart,
    "夫妻宮",
    "love",
    "loveStyle",
    "恋愛と関係の築き方",
    "恋愛では、これらの性質を関係の中でどう扱うかが中心になります。",
  );
  const marriageBase = sectionFromPalace(
    chart,
    "夫妻宮",
    "marriage",
    "marriage",
    "結婚と長期関係",
    "長期関係では、役割分担・決断・生活運用にこの傾向が現れます。",
  );
  const careerBase = sectionFromPalace(
    chart,
    "官禄宮",
    "career",
    "careerStyle",
    "仕事の型",
    "仕事では、社会的役割と成果の出し方にこの性質が現れます。",
  );
  const moneyBase = sectionFromPalace(
    chart,
    "財帛宮",
    "money",
    "earningStyle",
    "稼ぎ方と金銭感覚",
    "収入を作る方法と資源管理にこの性質が現れます。",
  );
  const propertyBase = sectionFromPalace(
    chart,
    "田宅宮",
    "money",
    "assetBuilding",
    "蓄積と資産形成",
    "田宅宮は、所有・生活基盤・長期的な蓄積の作り方を補足します。",
  );
  const talentBase = sectionFromPalace(
    chart,
    "命宮",
    "talent",
    "coreTalent",
    "中心的な才能",
    "命宮は、意識しやすい気質と能力の使い方を示す中心です。",
  );
  const innerBase = sectionFromPalace(
    chart,
    "福徳宮",
    "talent",
    "hiddenPotential",
    "内面と潜在力",
    "福徳宮は、内的な満足、思考の癖、表に出にくい動機を補足します。",
  );
  const love = sectionFromSynthesis(loveBase, chart.synthesis.love);
  const marriage = sectionFromSynthesis(marriageBase, chart.synthesis.marriage);
  const career = sectionFromSynthesis(careerBase, chart.synthesis.career);
  const money = sectionFromSynthesis(moneyBase, chart.synthesis.money);
  const property = sectionFromSynthesis(propertyBase, chart.synthesis.money);
  const talent = sectionFromSynthesis(talentBase, chart.synthesis.talent);
  const inner = sectionFromSynthesis(innerBase, chart.synthesis.talent);

  return [
    love,
    marriage,
    {
      ...love,
      topic: "compatiblePartner",
      title: "相性の良い相手像",
      summary: chart.synthesis.love.compatiblePartner,
    },
    {
      ...love,
      topic: "difficultPartner",
      title: "摩擦が生じやすい相手像",
      summary: chart.synthesis.love.difficultPartner,
      strengths: [],
    },
    career,
    {
      ...career,
      topic: "careerStrengths",
      title: "仕事面の長所",
      summary: career.strengths.join(""),
      challenges: [],
    },
    {
      ...career,
      topic: "careerWeaknesses",
      title: "仕事面の注意点",
      summary: career.challenges.join(""),
      strengths: [],
    },
    {
      ...career,
      topic: "successKeys",
      title: "成功のために必要なこと",
      summary: career.advice.join(""),
    },
    money,
    property,
    {
      ...money,
      topic: "moneyRisk",
      title: "金運の注意点",
      summary: money.challenges.join(""),
      strengths: [],
    },
    talent,
    inner,
    ...timingSections(chart),
  ];
}

function buildSignals(sections: FortuneSection[], confidence: number): FortuneSignal[] {
  return sections.flatMap((section) => [
    ...section.strengths.map((trait) => ({
      method: "ziwei" as const,
      theme: section.theme,
      trait,
      polarity: "strength" as const,
      score: 70,
      confidence,
      evidence: section.evidence.join(" / "),
    })),
    ...section.challenges.map((trait) => ({
      method: "ziwei" as const,
      theme: section.theme,
      trait,
      polarity: "challenge" as const,
      score: 62,
      confidence,
      evidence: section.evidence.join(" / "),
    })),
  ]);
}

export function calcZiwei(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<ZiweiChart> {
  const confidence = defaultConfidence(input);
  const time = timeIndexFromBirthTime(input.birthTime);
  const gender = genderBasis(input);
  const libraryGender = toLibraryGender(gender);
  const astrolabe = astro.astrolabeBySolarDate(
    input.birthDate,
    time.index,
    libraryGender,
    true,
    "ja-JP",
  );
  const includeGenderTiming = gender !== "unspecified";
  const normalizedTargetDate =
    typeof targetDate === "string"
      ? targetDate
      : dateInTimezone(targetDate, input.timezone ?? "Asia/Tokyo");
  const palaces = buildPalaces(astrolabe, includeGenderTiming);
  const natal = natalTransformations(palaces);
  const patterns = detectZiweiPatterns({ palaces, natalTransformations: natal });
  const baseChart: ZiweiBaseChart = {
    solarDate: astrolabe.solarDate,
    lunarDate: astrolabe.lunarDate,
    chineseDate: astrolabe.chineseDate,
    time: astrolabe.time,
    timeRange: astrolabe.timeRange,
    timeIndex: time.index,
    timeAssumed: time.assumed,
    genderBasis: gender,
    zodiac: astrolabe.zodiac,
    mingBranch: astrolabe.earthlyBranchOfSoulPalace,
    shenBranch: astrolabe.earthlyBranchOfBodyPalace,
    soulStar: astrolabe.soul,
    bodyStar: astrolabe.body,
    fiveElementsClass: astrolabe.fiveElementsClass,
    palaces,
    natalTransformations: natal,
    patterns,
    timing: includeGenderTiming ? buildTiming(astrolabe, palaces, normalizedTargetDate) : undefined,
    calculationScope: "natal-and-daily-timing-v3",
    calculationMethod: "iztro-default",
    calculationLibraryVersion: "2.5.8",
  };
  const chart: ZiweiChart = {
    ...baseChart,
    synthesis: buildZiweiSynthesis(baseChart),
    interpretationScope: "weighted-domain-and-pattern-synthesis-v2",
  };
  const sections = buildSections(chart);
  const score = time.assumed ? 0.35 : includeGenderTiming ? 0.84 : 0.68;
  const signals = buildSignals(sections, score);

  return {
    method: "ziwei",
    displayName: "紫微斗数",
    version: "ziwei-pattern-synthesis-v5",
    inputRequirement: {
      birthDate: "required",
      birthTime: "required",
      birthPlace: "unused",
    },
    confidence: confidenceFromScore(score, [
      time.assumed
        ? "出生時刻がないため正午を仮置きしています。命宮・星配置は暫定です。"
        : `出生時刻を ${chart.time}（${chart.timeRange}）として計算しています。`,
      includeGenderTiming
        ? "伝統上の男女区分を使って大限・流年を計算しています。"
        : "性別区分が未設定のため、性別に依存する大限・流年は表示していません。",
      confidence.time === "approximate"
        ? "出生時刻が概算のため、時辰境界に近い場合は隣の命盤との比較が必要です。"
        : "十四主星・補助星・生年四化・十二宮を標準方式で排盤しています。",
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "排盤は iztro 2.5.8 の default アルゴリズムを使用しています。",
      "時刻は出生地の現地標準時をそのまま時辰へ変換し、真太陽時補正は行っていません。",
      "空宮は対宮の主星を参照し、借星であることをデータ上で区別しています。",
      "命宮・身宮・対象宮・三方四正・生年四化と大限から流日までを、領域別の重み付き根拠として統合しています。",
      "代表格局は紫微斗数全書系の成立条件を採用し、輔弼昌曲魁鉞禄存・禄権科を補強、羊陀火鈴空劫・化忌を負荷として別々に記録します。",
      "星の性質は傾向として扱い、一つの星や一つの四化だけで吉凶を断定しません。",
    ],
  };
}
