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
import {
  buildKyuseiSynthesis,
  type KyuseiSynthesis,
  type KyuseiTopicSynthesis,
} from "./kyusei-synthesis";

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

export type KyuseiElementRelation = {
  type: "比和" | "生入" | "生出" | "剋入" | "剋出";
  polarity: "support" | "neutral" | "challenge";
  description: string;
};

export type KyuseiMeetingSide = {
  palace: KyuseiPalaceKey;
  direction: string;
  subjectStar: KyuseiStar;
  meetingStar: KyuseiStar;
  relation: KyuseiElementRelation;
  agency: "self-initiated" | "externally-received";
};

export type KyuseiMeeting = {
  layer: "year" | "month";
  lowerBoard: "後天定位盤" | "年盤";
  upperBoard: "年盤" | "月盤";
  sameMeeting: KyuseiMeetingSide;
  receivedMeeting: KyuseiMeetingSide;
};

export type KyuseiMonthlyWindow = {
  index: number;
  termName: string;
  startDateTime: string;
  endDateTime: string;
  active: boolean;
  yearCenterStar: KyuseiStar;
  monthBoard: KyuseiBoard;
  meeting: KyuseiMeeting;
  supportScore: number;
  classification: "supportive" | "mixed" | "demanding";
};

export type KyuseiInclination = {
  school: "東洋運勢学会・月盤傾斜法（中宮裏卦）-v1";
  status: "determined" | "center-five-undetermined";
  birthMonthCenterStar: KyuseiStar;
  rawPlacement: KyuseiBoardPlacement;
  palace?: KyuseiPalaceKey;
  star?: KyuseiStar;
  centerAdjustment: boolean;
  meaning: string;
};

export type KyuseiChart = {
  birthDateTime: string;
  timeAssumed: boolean;
  honmei: KyuseiStar;
  getsumei: KyuseiStar;
  dayStar: KyuseiStar;
  timeStar: KyuseiStar;
  inclination: KyuseiInclination;
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
    yearMeeting: KyuseiMeeting;
    monthMeeting: KyuseiMeeting;
    solarYear: number;
    monthlyWindows: KyuseiMonthlyWindow[];
  };
  synthesis: KyuseiSynthesis;
  interpretationScope: "weighted-domain-and-meeting-synthesis-v1";
  calculationScope: "timezone-aware-12-month-meeting-v6";
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

const GENERATES: Record<KyuseiStar["element"], KyuseiStar["element"]> = {
  水: "木",
  木: "火",
  火: "土",
  土: "金",
  金: "水",
};

const OVERCOMES: Record<KyuseiStar["element"], KyuseiStar["element"]> = {
  水: "火",
  火: "金",
  金: "木",
  木: "土",
  土: "水",
};

const CENTER_INCLINATION: Partial<Record<KyuseiNumber, KyuseiNumber>> = {
  1: 9,
  2: 6,
  3: 4,
  4: 3,
  6: 2,
  7: 8,
  8: 7,
  9: 1,
};

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

function placementAt(board: KyuseiBoard, palace: KyuseiPalaceKey): KyuseiBoardPlacement {
  const placement = board.placements.find((item) => item.palace === palace);
  if (!placement) throw new Error(`Nine-star palace missing: ${palace}`);
  return placement;
}

function elementRelation(subject: KyuseiStar, other: KyuseiStar): KyuseiElementRelation {
  if (subject.element === other.element) {
    return { type: "比和", polarity: "support", description: "同じ五行が重なり、持ち味が強まりやすい関係" };
  }
  if (GENERATES[other.element] === subject.element) {
    return { type: "生入", polarity: "support", description: "相手側の五行から支援や資源を受け取りやすい関係" };
  }
  if (GENERATES[subject.element] === other.element) {
    return { type: "生出", polarity: "neutral", description: "自分の力を外へ注ぎ、成果と消耗の両方が出やすい関係" };
  }
  if (OVERCOMES[other.element] === subject.element) {
    return { type: "剋入", polarity: "challenge", description: "外側から制約や修正圧力を受けやすい関係" };
  }
  return { type: "剋出", polarity: "challenge", description: "自分から管理・制御する負担が増えやすい関係" };
}

function relationScore(relation: KyuseiElementRelation): number {
  return relation.polarity === "support" ? 2 : relation.polarity === "challenge" ? -2 : 0;
}

function buildMeeting(
  layer: KyuseiMeeting["layer"],
  lowerBoard: KyuseiBoard,
  upperBoard: KyuseiBoard,
  honmei: KyuseiStar,
): KyuseiMeeting {
  const samePalace = upperBoard.honmeiPlacement;
  const receivedPalace = lowerBoard.honmeiPlacement;
  const sameStar = placementAt(lowerBoard, samePalace.palace).star;
  const receivedStar = placementAt(upperBoard, receivedPalace.palace).star;

  return {
    layer,
    lowerBoard: layer === "year" ? "後天定位盤" : "年盤",
    upperBoard: layer === "year" ? "年盤" : "月盤",
    sameMeeting: {
      palace: samePalace.palace,
      direction: samePalace.direction,
      subjectStar: honmei,
      meetingStar: sameStar,
      relation: elementRelation(honmei, sameStar),
      agency: "self-initiated",
    },
    receivedMeeting: {
      palace: receivedPalace.palace,
      direction: receivedPalace.direction,
      subjectStar: honmei,
      meetingStar: receivedStar,
      relation: elementRelation(honmei, receivedStar),
      agency: "externally-received",
    },
  };
}

function buildInclination(honmei: KyuseiStar, getsumei: KyuseiStar): KyuseiInclination {
  const birthMonthBoard = buildBoard(getsumei, honmei, getsumei);
  const rawPlacement = birthMonthBoard.honmeiPlacement;
  if (rawPlacement.palace !== "中宮") {
    const star = STARS[rawPlacement.homeNumber];
    return {
      school: "東洋運勢学会・月盤傾斜法（中宮裏卦）-v1",
      status: "determined",
      birthMonthCenterStar: getsumei,
      rawPlacement,
      palace: rawPlacement.palace,
      star,
      centerAdjustment: false,
      meaning: `出生月盤で本命星が${rawPlacement.palace}へ回座するため、${star.name}の${star.keywords.join("・")}が内面の動機として現れやすい傾斜です。`,
    };
  }

  const adjustedNumber = CENTER_INCLINATION[honmei.number];
  if (!adjustedNumber) {
    return {
      school: "東洋運勢学会・月盤傾斜法（中宮裏卦）-v1",
      status: "center-five-undetermined",
      birthMonthCenterStar: getsumei,
      rawPlacement,
      centerAdjustment: true,
      meaning: "五黄土星の中宮傾斜はこの採用方式では傾斜宮なしとし、本命星と月命星を中心に読みます。",
    };
  }

  const adjusted = FLIGHT_PALACES.find((item) => item.homeNumber === adjustedNumber);
  if (!adjusted) throw new Error(`Nine-star center inclination missing: ${adjustedNumber}`);
  const star = STARS[adjustedNumber];
  return {
    school: "東洋運勢学会・月盤傾斜法（中宮裏卦）-v1",
    status: "determined",
    birthMonthCenterStar: getsumei,
    rawPlacement,
    palace: adjusted.palace,
    star,
    centerAdjustment: true,
    meaning: `本命星と月命星が同じ中宮傾斜のため、定位の裏卦である${adjusted.palace}を採用し、${star.name}の${star.keywords.join("・")}を潜在傾向として読みます。`,
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
  inclination?: KyuseiStar,
): FortuneSection {
  const hidden = inclination && ![primary.number, secondary.number].includes(inclination.number)
    ? inclination
    : undefined;
  return {
    theme,
    topic,
    title,
    summary: `${primary.name}の${primary.keywords.join("・")}を中心に、${secondary.name}の${secondary.keywords.join("・")}が内面や具体的な反応として重なります。${hidden ? `傾斜の${hidden.name}は、表に出にくい${hidden.keywords.join("・")}への動機を補足します。` : ""}`,
    keywords: [...new Set([...primary.keywords, ...secondary.keywords, ...(hidden?.keywords ?? [])])],
    strengths: [primary.talent, secondary.talent, ...(hidden ? [hidden.talent] : [])],
    challenges: [primary.challenge, secondary.challenge, ...(hidden ? [hidden.challenge] : [])],
    advice: [primary.advice, secondary.advice, ...(hidden ? [hidden.advice] : [])],
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
  const baseBoard = buildBoard(STARS[5], honmei, getsumei);
  const yearBoard = buildBoard(yearCenterStar, honmei, getsumei);
  const monthBoard = buildBoard(monthCenterStar, honmei, getsumei);
  const inclination = buildInclination(honmei, getsumei);
  const yearMeeting = buildMeeting("year", baseBoard, yearBoard, honmei);
  const monthMeeting = buildMeeting("month", yearBoard, monthBoard, honmei);
  const targetLocalDateTime = `${target.iso} 12:00:00`;
  const targetYearLichun = Solar.fromYmdHms(target.year, 2, 15, 12, 0, 0)
    .getLunar()
    .getPrevJie(false)
    .getSolar();
  const targetYearLichunLocal = chinaSolarToTimezone(targetYearLichun, input.timezone);
  const solarYear = targetLocalDateTime >= targetYearLichunLocal ? target.year : target.year - 1;
  const solarMonthSamples = [
    ...Array.from({ length: 11 }, (_, index) => ({ year: solarYear, month: index + 2 })),
    { year: solarYear + 1, month: 1 },
  ];
  const monthlyWindows: KyuseiMonthlyWindow[] = solarMonthSamples.map((sample, index) => {
    const sampleDate = `${sample.year}-${String(sample.month).padStart(2, "0")}-15`;
    const sampleSolar = input.timezone
      ? solarAtSameInstant(sampleDate, "12:00", input.timezone)
      : Solar.fromYmdHms(sample.year, sample.month, 15, 12, 0, 0);
    const sampleLunar = sampleSolar.getLunar();
    const startJie = sampleLunar.getPrevJie(false);
    const endJie = sampleLunar.getNextJie(false);
    const startDateTime = chinaSolarToTimezone(startJie.getSolar(), input.timezone);
    const endDateTime = chinaSolarToTimezone(endJie.getSolar(), input.timezone);
    const sampleYearStar = starFromNineStar(sampleLunar.getYearNineStar(3));
    const sampleMonthStar = starFromNineStar(sampleLunar.getMonthNineStar(3));
    const sampleYearBoard = buildBoard(sampleYearStar, honmei, getsumei);
    const sampleMonthBoard = buildBoard(sampleMonthStar, honmei, getsumei);
    const meeting = buildMeeting("month", sampleYearBoard, sampleMonthBoard, honmei);
    const supportScore =
      relationScore(meeting.sameMeeting.relation) +
      relationScore(meeting.receivedMeeting.relation);
    return {
      index: index + 1,
      termName: solarTermNameJa(startJie.getName()),
      startDateTime,
      endDateTime,
      active: targetLocalDateTime >= startDateTime && targetLocalDateTime < endDateTime,
      yearCenterStar: sampleYearStar,
      monthBoard: sampleMonthBoard,
      meeting,
      supportScore,
      classification: supportScore > 0 ? "supportive" : supportScore < 0 ? "demanding" : "mixed",
    };
  });
  const activeMonthlyWindow = monthlyWindows.find((item) => item.active);
  const synthesis = buildKyuseiSynthesis({
    honmei,
    getsumei,
    dayStar,
    inclination,
    yearMeeting,
    monthMeeting,
    activeMonthlyWindow,
  });
  const chart: KyuseiChart = {
    birthDateTime: solar.toYmdHms(),
    timeAssumed: time.assumed,
    honmei,
    getsumei,
    dayStar,
    timeStar,
    inclination,
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
      yearMeeting,
      monthMeeting,
      solarYear,
      monthlyWindows,
    },
    synthesis,
    interpretationScope: "weighted-domain-and-meeting-synthesis-v1",
    calculationScope: "timezone-aware-12-month-meeting-v6",
    calculationMethod: "lichun-and-solar-month-boundaries",
    calculationLibraryVersion: "lunar-typescript-1.8.6",
  };

  const inclinationStar = inclination.star ?? getsumei;
  const meetings = [
    { label: "年の同会", side: yearMeeting.sameMeeting },
    { label: "年の被同会", side: yearMeeting.receivedMeeting },
    { label: "月の同会", side: monthMeeting.sameMeeting },
    { label: "月の被同会", side: monthMeeting.receivedMeeting },
  ];
  const supportiveMeetings = meetings.filter((item) => item.side.relation.polarity === "support");
  const demandingMeetings = meetings.filter((item) => item.side.relation.polarity !== "support");
  const meetingText = (item: (typeof meetings)[number]) =>
    `${item.label}は${item.side.palace}の${item.side.meetingStar.name}（${item.side.relation.type}）。${item.side.relation.description}です。`;
  const supportiveWindows = monthlyWindows
    .filter((item) => item.classification === "supportive")
    .sort((left, right) => right.supportScore - left.supportScore || left.index - right.index);
  const demandingWindows = monthlyWindows
    .filter((item) => item.classification === "demanding")
    .sort((left, right) => left.supportScore - right.supportScore || left.index - right.index);
  const monthlyWindowText = (item: KyuseiMonthlyWindow) =>
    `${item.termName}節（${item.startDateTime.slice(0, 10)}〜${item.endDateTime.slice(0, 10)}）は、同会${item.meeting.sameMeeting.meetingStar.name}・${item.meeting.sameMeeting.relation.type}、被同会${item.meeting.receivedMeeting.meetingStar.name}・${item.meeting.receivedMeeting.relation.type}、支援度${item.supportScore > 0 ? "+" : ""}${item.supportScore}です。`;
  const fromSynthesis = (
    theme: FortuneSection["theme"],
    topic: FortuneSection["topic"],
    title: string,
    topicSynthesis: KyuseiTopicSynthesis,
  ): FortuneSection => ({
    theme,
    topic,
    title,
    summary: topicSynthesis.conclusion,
    keywords: [...new Set([...honmei.keywords, ...getsumei.keywords, ...(inclination.star?.keywords ?? [])])],
    strengths: [...new Set(topicSynthesis.strengths)],
    challenges: [...new Set(topicSynthesis.challenges)],
    advice: [...new Set(topicSynthesis.advice)],
    evidence: [...topicSynthesis.factors]
      .sort((left, right) => right.weight - left.weight)
      .map((item) => `${item.source} / weight ${item.weight.toFixed(2)} / ${item.interpretation}`),
  });
  const love = fromSynthesis("love", "loveStyle", "恋愛の傾向", synthesis.love);
  const marriage = fromSynthesis("marriage", "marriage", "結婚と長期関係", synthesis.marriage);
  const career = fromSynthesis("career", "careerStyle", "仕事の型", synthesis.career);
  const money = fromSynthesis("money", "earningStyle", "稼ぎ方と金銭感覚", synthesis.money);
  const talent = fromSynthesis("talent", "coreTalent", "中核の才能", synthesis.talent);
  const sections: FortuneSection[] = [
    talent,
    section(
      "personality",
      "growthAdvice",
      inclination.status === "determined" ? `傾斜 ${inclination.palace}・${inclinationStar.name}` : "中宮傾斜",
      inclinationStar,
      getsumei,
      [
        `節月 ${chart.monthGanZhi}`,
        `出生月盤中宮 ${getsumei.name} / 本命星回座 ${inclination.rawPlacement.palace}`,
        inclination.meaning,
      ],
    ),
    {
      ...talent,
      topic: "hiddenPotential",
      title: "潜在力の育て方",
      summary: `${synthesis.talent.conclusion}${talent.advice.join("")}`,
    },
    love,
    {
      ...love,
      topic: "compatiblePartner",
      title: "相性の良い相手像",
      summary: synthesis.love.compatiblePartner,
    },
    {
      ...love,
      topic: "difficultPartner",
      title: "摩擦が生じやすい相手像",
      summary: synthesis.love.difficultPartner,
      strengths: [],
    },
    marriage,
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
    {
      ...money,
      topic: "moneyRisk",
      title: "金運の注意点",
      summary: money.challenges.join(""),
      strengths: [],
    },
    {
      ...money,
      topic: "assetBuilding",
      title: "蓄積と資産形成",
      summary: money.advice.join(""),
    },
    {
      theme: "timing",
      topic: "overallFlow",
      title: `${target.iso.slice(0, 4)}年の運気テーマ`,
      summary: `年盤の中宮星は${yearCenterStar.name}。本人の${honmei.name}は${yearBoard.honmeiPlacement.palace}（${yearBoard.honmeiPlacement.direction}）へ回座し、${yearMeeting.sameMeeting.meetingStar.name}と同会、${yearMeeting.receivedMeeting.meetingStar.name}と被同会します。対象月は${monthBoard.honmeiPlacement.palace}へ移るため、年の背景と月の自発・他動作用を分けて読みます。`,
      keywords: [
        ...yearCenterStar.keywords,
        yearBoard.honmeiPlacement.palace,
        monthBoard.honmeiPlacement.palace,
      ],
      strengths: [
        `${yearBoard.honmeiPlacement.palace}のテーマを意識すると、${honmei.talent}`,
        `${monthBoard.honmeiPlacement.palace}の月は、${monthBoard.honmeiPlacement.theme}動きを具体化できます。`,
        ...supportiveMeetings.map(meetingText),
      ],
      challenges: [
        honmei.challenge,
        `${yearBoard.honmeiPlacement.palace}では、${yearBoard.honmeiPlacement.theme}ため、過剰さと停滞の両方を確認します。`,
        ...demandingMeetings.map(meetingText),
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
        `年の同会 ${yearMeeting.sameMeeting.meetingStar.name}（${yearMeeting.sameMeeting.relation.type}） / 被同会 ${yearMeeting.receivedMeeting.meetingStar.name}（${yearMeeting.receivedMeeting.relation.type}）`,
        `月の同会 ${monthMeeting.sameMeeting.meetingStar.name}（${monthMeeting.sameMeeting.relation.type}） / 被同会 ${monthMeeting.receivedMeeting.meetingStar.name}（${monthMeeting.receivedMeeting.relation.type}）`,
        `立春${solarYear}年からの12節月を比較 / 対象節月 ${activeMonthlyWindow?.termName ?? "未特定"}節`,
      ],
    },
    {
      theme: "timing",
      topic: "goodTiming",
      title: `${solarYear}節年に活かしやすい月`,
      summary: supportiveWindows.length
        ? `12節月の五行関係を比較すると、${supportiveWindows.slice(0, 3).map(monthlyWindowText).join("")}`
        : "12節月に支援度が正となる月はありません。吉凶断定ではなく、各回座宮の役割を丁寧に進める年として扱います。",
      keywords: supportiveWindows.slice(0, 3).flatMap((item) => [
        item.termName,
        ...item.meeting.sameMeeting.meetingStar.keywords,
        ...item.meeting.receivedMeeting.meetingStar.keywords,
      ]),
      strengths: supportiveWindows.slice(0, 3).map(monthlyWindowText),
      challenges: [],
      advice: [
        "支援度が高い月も、同会と被同会のどちらが支援側かを分け、受け身と自発行動を取り違えないようにします。",
      ],
      evidence: supportiveWindows.map(monthlyWindowText),
    },
    {
      theme: "timing",
      topic: "badTiming",
      title: `${solarYear}節年に調整が必要な月`,
      summary: demandingWindows.length
        ? `12節月の五行関係を比較すると、${demandingWindows.slice(0, 3).map(monthlyWindowText).join("")}`
        : "12節月に支援度が負となる月はなく、五行関係上の強い圧力は目立ちません。",
      keywords: demandingWindows.slice(0, 3).flatMap((item) => [
        item.termName,
        ...item.meeting.sameMeeting.meetingStar.keywords,
        ...item.meeting.receivedMeeting.meetingStar.keywords,
      ]),
      strengths: [],
      challenges: demandingWindows.slice(0, 3).map(monthlyWindowText),
      advice: [
        "支援度が低い月は中止の月ではありません。管理負荷、外圧、消耗のどれが強いかを同会・被同会から分けて予定に余白を置きます。",
      ],
      evidence: demandingWindows.map(monthlyWindowText),
    },
  ];

  const confidenceScore = time.assumed ? 0.78 : 0.9;
  const signals: FortuneSignal[] = sections.flatMap((item) => [
    ...item.strengths.map((trait) => ({
      method: "kyusei" as const,
      theme: item.theme,
      trait,
      polarity: "strength" as const,
      score: 70,
      confidence: confidenceScore,
      evidence: item.evidence.join(" / "),
    })),
    ...item.challenges.map((trait) => ({
      method: "kyusei" as const,
      theme: item.theme,
      trait,
      polarity: "challenge" as const,
      score: 62,
      confidence: confidenceScore,
      evidence: item.evidence.join(" / "),
    })),
  ]);

  return {
    method: "kyusei",
    displayName: "九星気学",
    version: "kyusei-weighted-synthesis-v7",
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
      "傾斜法は出生月盤上の本命星回座宮を使い、中宮傾斜は東洋運勢学会の定位裏卦方式で補正します。",
      "同会・被同会は、年運では後天定位盤と年盤、月運では年盤と月盤を重ね、自発的作用と外から受ける作用を分けています。",
      "立春から翌年立春までの12節月を生成し、各月の節入り時刻、月盤、同会・被同会、五行関係を比較できます。",
      "月の支援度は比和・生入を+2、生出を0、剋入・剋出を-2として相対比較する実装指標で、出来事や絶対吉凶の確率ではありません。",
      "恋愛・結婚・仕事・金運・才能は、本命星、月命星、傾斜、日家九星、年・月の同会被同会を分野別の重み付き根拠として統合しています。",
      "方位吉凶には移動日時・出発地点・目的地が必要なため、出生鑑定とは別機能として実装します。",
      "最大吉方と移動方位の吉凶判定は、地点と移動条件を入力する別機能として追加します。",
    ],
  };
}
