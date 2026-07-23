import { Solar } from "lunar-typescript";
import {
  chinaSolarToTimezone,
  dateInTimezone,
  solarAtSameInstant,
} from "../time/chineseCalendarTime";
import {
  BirthProfileInput,
  DetailedFortuneResult,
  FortuneSection,
  FortuneSignal,
  confidenceFromScore,
  parseBirthParts,
  sectionsToDomainReadings,
} from "./types";

export type KyuseiNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type KyuseiStar = {
  number: KyuseiNumber;
  name: string;
  element: "水" | "土" | "木" | "金" | "火";
  keywords: string[];
  talent: string;
  challenge: string;
  advice: string;
};

type SolarTermBoundary = {
  name: string;
  dateTime: string;
};

export type KyuseiPalaceKey = "坎宮" | "坤宮" | "震宮" | "巽宮" | "中宮" | "乾宮" | "兌宮" | "艮宮" | "離宮";

export type KyuseiBoardPlacement = {
  palace: KyuseiPalaceKey;
  direction: string;
  homeNumber: KyuseiNumber;
  star: KyuseiStar;
  theme: string;
};

export type KyuseiBoard = {
  centerStar: KyuseiStar;
  placements: KyuseiBoardPlacement[];
  honmeiPlacement: KyuseiBoardPlacement;
  getsumeiPlacement: KyuseiBoardPlacement;
};

export type KyuseiChart = {
  birthDateTime: string;
  timeAssumed: boolean;
  honmei: KyuseiStar;
  getsumei: KyuseiStar;
  dayStar: KyuseiStar;
  timeStar: KyuseiStar;
  yearGanZhi: string;
  monthGanZhi: string;
  zodiacBranch: string;
  previousJie: SolarTermBoundary;
  nextJie: SolarTermBoundary;
  timing: {
    targetDate: string;
    /** @deprecated Use yearBoard.centerStar. This is the annual center star, not personal luck. */
    yearStar: KyuseiStar;
    /** @deprecated Use monthBoard.centerStar. This is the monthly center star, not personal luck. */
    monthStar: KyuseiStar;
    yearBoard: KyuseiBoard;
    monthBoard: KyuseiBoard;
  };
  calculationScope: "timezone-aware-four-stars-and-personal-rotation-v4";
  calculationMethod: "lichun-and-solar-month-boundaries";
  calculationLibraryVersion: "lunar-typescript-1.8.6";
};

const STARS: Record<KyuseiNumber, KyuseiStar> = {
  1: {
    number: 1,
    name: "一白水星",
    element: "水",
    keywords: ["柔軟性", "知性", "人脈"],
    talent: "状況に合わせて形を変えながら、情報と人をつなぐ力があります。",
    challenge: "迷いや不安が強い時は、判断を先送りしやすくなります。",
    advice: "静かに考える時間と、信頼できる相談相手を持つと流れを作れます。",
  },
  2: {
    number: 2,
    name: "二黒土星",
    element: "土",
    keywords: ["育成", "継続", "支援"],
    talent: "人や物事を時間をかけて育て、確実に形にする力があります。",
    challenge: "受け身になりすぎると、望む方向へ進む速度が落ちます。",
    advice: "小さな主導権を持つと、支える才能が成果に変わります。",
  },
  3: {
    number: 3,
    name: "三碧木星",
    element: "木",
    keywords: ["発信", "行動力", "若々しさ"],
    talent: "新しい流れに素早く反応し、周囲を活気づける力があります。",
    challenge: "勢いで動きすぎると、詰めの甘さが出やすいです。",
    advice: "行動の後に振り返る習慣を置くと、直感が経験値になります。",
  },
  4: {
    number: 4,
    name: "四緑木星",
    element: "木",
    keywords: ["信頼", "調整", "広がり"],
    talent: "人との縁を広げ、物事を穏やかに整える力があります。",
    challenge: "周囲に合わせすぎると、決断が曖昧になりやすいです。",
    advice: "大切にする基準を明確にすると、信頼が長期的な力になります。",
  },
  5: {
    number: 5,
    name: "五黄土星",
    element: "土",
    keywords: ["中心力", "再生", "影響力"],
    talent: "混乱した状況の中心に立ち、再編していく強い力があります。",
    challenge: "影響力が強いぶん、頑固さや支配性として出ることがあります。",
    advice: "周囲の声を受け取るほど、中心力が信頼に変わります。",
  },
  6: {
    number: 6,
    name: "六白金星",
    element: "金",
    keywords: ["責任", "理想", "リーダーシップ"],
    talent: "高い視座で目標を掲げ、責任を持ってやり抜く力があります。",
    challenge: "完璧さを求めすぎると、孤立や緊張を招きやすいです。",
    advice: "任せる仕組みを持つと、大きな理想を現実化できます。",
  },
  7: {
    number: 7,
    name: "七赤金星",
    element: "金",
    keywords: ["喜び", "会話", "魅力"],
    talent: "人を楽しませ、言葉や雰囲気で価値を伝える力があります。",
    challenge: "目先の楽しさに流れると、継続性が弱くなります。",
    advice: "楽しさを成果につなげる導線を作ると魅力が仕事になります。",
  },
  8: {
    number: 8,
    name: "八白土星",
    element: "土",
    keywords: ["変化", "蓄積", "継承"],
    talent: "過去の蓄積を受け継ぎ、必要な変化を起こす力があります。",
    challenge: "変えるか守るかで迷うと、動きが止まりやすいです。",
    advice: "残すものと変えるものを分けると、大きな転換を導けます。",
  },
  9: {
    number: 9,
    name: "九紫火星",
    element: "火",
    keywords: ["知性", "美意識", "注目"],
    talent: "物事を明るみに出し、美しくわかりやすく見せる力があります。",
    challenge: "評価を気にしすぎると、内面の消耗が増えます。",
    advice: "知性と美意識を磨くほど、人前で輝く役割が増えます。",
  },
};

const FLIGHT_PALACES: Array<Omit<KyuseiBoardPlacement, "star">> = [
  { palace: "中宮", direction: "中央", homeNumber: 5, theme: "物事が集中し、影響と負荷が増幅する" },
  { palace: "乾宮", direction: "北西", homeNumber: 6, theme: "責任、目上、完成度が焦点になる" },
  { palace: "兌宮", direction: "西", homeNumber: 7, theme: "収穫、会話、喜びと支出が焦点になる" },
  { palace: "艮宮", direction: "北東", homeNumber: 8, theme: "停止と再開、継承、転換が焦点になる" },
  { palace: "離宮", direction: "南", homeNumber: 9, theme: "評価、可視化、分離と明確化が焦点になる" },
  { palace: "坎宮", direction: "北", homeNumber: 1, theme: "内省、準備、人知れない苦労が焦点になる" },
  { palace: "坤宮", direction: "南西", homeNumber: 2, theme: "基礎、支援、継続的な育成が焦点になる" },
  { palace: "震宮", direction: "東", homeNumber: 3, theme: "開始、発信、早い展開が焦点になる" },
  { palace: "巽宮", direction: "南東", homeNumber: 4, theme: "信用、縁、交渉と遠方への広がりが焦点になる" },
];

function starNumber(value: number): KyuseiNumber {
  return (((value - 1) % 9 + 9) % 9 + 1) as KyuseiNumber;
}

function buildBoard(centerStar: KyuseiStar, honmei: KyuseiStar, getsumei: KyuseiStar): KyuseiBoard {
  const placements = FLIGHT_PALACES.map((palace, offset) => ({
    ...palace,
    star: STARS[starNumber(centerStar.number + offset)],
  }));
  const placementOf = (star: KyuseiStar) => {
    const placement = placements.find((item) => item.star.number === star.number);
    if (!placement) throw new Error(`Nine-star placement missing: ${star.name}`);
    return placement;
  };
  return {
    centerStar,
    placements,
    honmeiPlacement: placementOf(honmei),
    getsumeiPlacement: placementOf(getsumei),
  };
}

const SOLAR_TERM_JA: Record<string, string> = {
  惊蛰: "啓蟄",
  谷雨: "穀雨",
  小满: "小満",
  芒种: "芒種",
  处暑: "処暑",
  秋分: "秋分",
  霜降: "霜降",
  小雪: "小雪",
  冬至: "冬至",
};

function solarTermNameJa(name: string): string {
  return SOLAR_TERM_JA[name] ?? name;
}

function parseBirthTime(birthTime?: string | null): { hour: number; minute: number; assumed: boolean } {
  const match = birthTime ? /^([01]\d|2[0-3]):([0-5]\d)$/.exec(birthTime) : null;
  if (!match) return { hour: 12, minute: 0, assumed: true };
  return { hour: Number(match[1]), minute: Number(match[2]), assumed: false };
}

function starFromNineStar(nineStar: { getIndex(): number }): KyuseiStar {
  const number = (nineStar.getIndex() + 1) as KyuseiNumber;
  const star = STARS[number];
  if (!star) throw new Error(`Unsupported nine-star index: ${nineStar.getIndex()}`);
  return star;
}

function parseTargetDate(
  targetDate: Date | string,
  timezone: string,
): { year: number; month: number; day: number; iso: string } {
  if (typeof targetDate === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
    if (!match) throw new Error("Invalid targetDate. Expected YYYY-MM-DD.");
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]), iso: targetDate };
  }
  const iso = dateInTimezone(targetDate, timezone);
  return {
    year: Number(iso.slice(0, 4)),
    month: Number(iso.slice(5, 7)),
    day: Number(iso.slice(8, 10)),
    iso,
  };
}

function section(
  theme: FortuneSection["theme"],
  topic: FortuneSection["topic"],
  title: string,
  primary: KyuseiStar,
  secondary: KyuseiStar,
  evidence: string[],
): FortuneSection {
  return {
    theme,
    topic,
    title,
    summary: `${primary.name}の${primary.keywords.join("・")}を中心に、${secondary.name}の${secondary.keywords.join("・")}が内面や具体的な反応として重なります。`,
    keywords: [...new Set([...primary.keywords, ...secondary.keywords])],
    strengths: [primary.talent, secondary.talent],
    challenges: [primary.challenge, secondary.challenge],
    advice: [primary.advice, secondary.advice],
    evidence,
  };
}

export function calcKyusei(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<KyuseiChart> {
  const { year, month, day } = parseBirthParts(input.birthDate);
  const time = parseBirthTime(input.birthTime);
  const solar = Solar.fromYmdHms(year, month, day, time.hour, time.minute, 0);
  const lunar = solar.getLunar();
  const timezone = input.timezone ?? "Asia/Tokyo";
  const termSolar = input.timezone
    ? solarAtSameInstant(
        input.birthDate,
        input.birthTime ?? "12:00",
        input.timezone,
      )
    : solar;
  const termLunar = termSolar.getLunar();
  const honmei = starFromNineStar(termLunar.getYearNineStar(3));
  const getsumei = starFromNineStar(termLunar.getMonthNineStar(3));
  const dayStar = starFromNineStar(lunar.getDayNineStar());
  const timeStar = starFromNineStar(lunar.getTimeNineStar());
  const previousJie = termLunar.getPrevJie(false);
  const nextJie = termLunar.getNextJie(false);
  const target = parseTargetDate(targetDate, timezone);
  const targetSolar = input.timezone
    ? solarAtSameInstant(target.iso, "12:00", input.timezone)
    : Solar.fromYmdHms(target.year, target.month, target.day, 12, 0, 0);
  const targetLunar = targetSolar.getLunar();
  const yearCenterStar = starFromNineStar(targetLunar.getYearNineStar(3));
  const monthCenterStar = starFromNineStar(targetLunar.getMonthNineStar(3));
  const yearBoard = buildBoard(yearCenterStar, honmei, getsumei);
  const monthBoard = buildBoard(monthCenterStar, honmei, getsumei);
  const chart: KyuseiChart = {
    birthDateTime: solar.toYmdHms(),
    timeAssumed: time.assumed,
    honmei,
    getsumei,
    dayStar,
    timeStar,
    yearGanZhi: termLunar.getYearInGanZhiExact(),
    monthGanZhi: termLunar.getMonthInGanZhiExact(),
    zodiacBranch: termLunar.getYearZhiExact(),
    previousJie: {
      name: solarTermNameJa(previousJie.getName()),
      dateTime: chinaSolarToTimezone(previousJie.getSolar(), input.timezone),
    },
    nextJie: {
      name: solarTermNameJa(nextJie.getName()),
      dateTime: chinaSolarToTimezone(nextJie.getSolar(), input.timezone),
    },
    timing: {
      targetDate: target.iso,
      yearStar: yearCenterStar,
      monthStar: monthCenterStar,
      yearBoard,
      monthBoard,
    },
    calculationScope: "timezone-aware-four-stars-and-personal-rotation-v4",
    calculationMethod: "lichun-and-solar-month-boundaries",
    calculationLibraryVersion: "lunar-typescript-1.8.6",
  };

  const sections: FortuneSection[] = [
    section(
      "talent",
      "coreTalent",
      `本命星 ${honmei.name}`,
      honmei,
      getsumei,
      [`立春基準の年干支 ${chart.yearGanZhi}`, `本命星 ${honmei.name} / 月命星 ${getsumei.name}`],
    ),
    section(
      "talent",
      "hiddenPotential",
      `月命星 ${getsumei.name}`,
      getsumei,
      dayStar,
      [`節月 ${chart.monthGanZhi}`, `前の節 ${chart.previousJie.name} ${chart.previousJie.dateTime}`],
    ),
    section(
      "love",
      "loveStyle",
      "恋愛で表れやすい性質",
      honmei,
      getsumei,
      [`本命星 ${honmei.name}`, `月命星 ${getsumei.name}`],
    ),
    section(
      "marriage",
      "marriage",
      "結婚生活の安定条件",
      getsumei,
      honmei,
      [`内面を示す月命星 ${getsumei.name}`, `社会的な基調を示す本命星 ${honmei.name}`],
    ),
    section(
      "career",
      "careerStrengths",
      "仕事面の長所",
      honmei,
      dayStar,
      [`本命星 ${honmei.name}`, `日家九星 ${dayStar.name}`],
    ),
    section(
      "career",
      "careerWeaknesses",
      "仕事面の注意点",
      honmei,
      getsumei,
      [`本命星 ${honmei.name}`, `月命星 ${getsumei.name}`],
    ),
    section(
      "career",
      "successKeys",
      "成功のために必要なこと",
      dayStar,
      honmei,
      [`日家九星 ${dayStar.name}`, `本命星 ${honmei.name}`],
    ),
    section(
      "money",
      "earningStyle",
      "稼ぎ方と金銭感覚",
      honmei,
      getsumei,
      [`本命星 ${honmei.name}`, `月命星 ${getsumei.name}`],
    ),
    section(
      "money",
      "assetBuilding",
      "資産形成の型",
      getsumei,
      dayStar,
      [`月命星 ${getsumei.name}`, `日家九星 ${dayStar.name}`],
    ),
    {
      theme: "timing",
      topic: "overallFlow",
      title: `${target.iso.slice(0, 4)}年の運気テーマ`,
      summary: `年盤の中宮星は${yearCenterStar.name}。本人の${honmei.name}は${yearBoard.honmeiPlacement.palace}（${yearBoard.honmeiPlacement.direction}）へ回座し、${yearBoard.honmeiPlacement.theme}年です。対象月は${monthBoard.honmeiPlacement.palace}へ移るため、年の背景と月の動きを分けて読みます。`,
      keywords: [
        ...yearCenterStar.keywords,
        yearBoard.honmeiPlacement.palace,
        monthBoard.honmeiPlacement.palace,
      ],
      strengths: [
        `${yearBoard.honmeiPlacement.palace}のテーマを意識すると、${honmei.talent}`,
        `${monthBoard.honmeiPlacement.palace}の月は、${monthBoard.honmeiPlacement.theme}動きを具体化できます。`,
      ],
      challenges: [
        honmei.challenge,
        `${yearBoard.honmeiPlacement.palace}では、${yearBoard.honmeiPlacement.theme}ため、過剰さと停滞の両方を確認します。`,
      ],
      advice: [
        honmei.advice,
        `年盤の${yearBoard.honmeiPlacement.palace}と月盤の${monthBoard.honmeiPlacement.palace}を重ね、同じテーマが続く時は負荷を分散しましょう。`,
      ],
      evidence: [
        `対象日 ${target.iso}`,
        `年盤中宮 ${yearCenterStar.name} / 本命星回座 ${yearBoard.honmeiPlacement.palace}（${yearBoard.honmeiPlacement.direction}）`,
        `月盤中宮 ${monthCenterStar.name} / 本命星回座 ${monthBoard.honmeiPlacement.palace}（${monthBoard.honmeiPlacement.direction}）`,
        `年盤の月命星回座 ${yearBoard.getsumeiPlacement.palace} / 月盤の月命星回座 ${monthBoard.getsumeiPlacement.palace}`,
      ],
    },
  ];

  const confidenceScore = time.assumed ? 0.78 : 0.9;
  const signals: FortuneSignal[] = sections.flatMap((item) =>
    item.keywords.map((keyword) => ({
      method: "kyusei" as const,
      theme: item.theme,
      trait: keyword,
      polarity: "strength" as const,
      score: 68,
      confidence: confidenceScore,
      evidence: item.evidence.join(" / "),
    })),
  );

  return {
    method: "kyusei",
    displayName: "九星気学",
    version: "kyusei-personal-rotation-v4",
    inputRequirement: {
      birthDate: "required",
      birthTime: "recommended",
      birthPlace: "unused",
    },
    confidence: confidenceFromScore(confidenceScore, [
      "本命星は立春、月命星は各月の節入り時刻を境界として算出しています。",
      input.timezone
        ? `節入りの瞬間を ${input.timezone} の現地時刻へ変換しています。`
        : "タイムゾーン未指定のため、節入り時刻は中国標準時として扱います。",
      time.assumed
        ? "出生時刻がないため正午を仮置きしています。日家・時家九星は暫定です。"
        : "出生時刻から日家・時家九星も算出しています。",
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "本命星・月命星・日家九星・時家九星を別々に保持しています。",
      "年盤・月盤は中宮星だけで個人運を断定せず、九宮全体を生成して本命星と月命星の回座宮を保持しています。",
      "方位吉凶には移動日時・出発地点・目的地が必要なため、出生鑑定とは別機能として実装します。",
      "回座宮は実装済みですが、同会法、被同会、傾斜法、最大吉方の吉凶判定は次の九星気学拡張で追加します。",
    ],
  };
}
