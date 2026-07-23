import type { EarthlyBranch, ElementBalance, FiveElement, HeavenlyStem, Pillar } from "./bazi-types";
import { Solar } from "lunar-typescript";
import { toUTC } from "../time/parseBirth";
import { chinaSolarToTimezone, solarAtSameInstant } from "../time/chineseCalendarTime";

export type YinYang = "陽" | "陰";
export type TenGod =
  | "比肩"
  | "劫財"
  | "食神"
  | "傷官"
  | "偏財"
  | "正財"
  | "偏官"
  | "正官"
  | "偏印"
  | "印綬";
export type TwelveStage =
  | "長生"
  | "沐浴"
  | "冠帯"
  | "建禄"
  | "帝旺"
  | "衰"
  | "病"
  | "死"
  | "墓"
  | "絶"
  | "胎"
  | "養";

export type HiddenStem = {
  stem: HeavenlyStem;
  tenGod: TenGod;
  element: FiveElement;
  weight: number;
  label: "本気" | "中気" | "余気";
};

export type DetailedPillar = Pillar & {
  label: "年柱" | "月柱" | "日柱" | "時柱";
  stemTenGod?: TenGod;
  hiddenStems: HiddenStem[];
  twelveStage: TwelveStage;
};

export type BaziRelation = {
  kind: "天干合" | "天干冲" | "支合" | "支冲" | "三合";
  target: string;
  meaning: string;
};

export type LuckCycleCandidate = {
  direction: "forward" | "reverse";
  startAge: number;
  startDateTime?: string;
  selected: boolean;
  reason: string;
  cycles: Array<{
    age: number;
    pillar: Pillar;
    focus: string;
  }>;
};

export type BaziAnnualTiming = {
  targetDate: string;
  annualPillar: Pillar;
  annualTenGod: TenGod;
  annualElementRole: "useful" | "avoid" | "neutral";
  focus: string;
  relations: BaziRelation[];
  monthly: {
    monthOrdinal: number;
    pillar: Pillar;
    tenGod: TenGod;
    elementRole: "useful" | "avoid" | "neutral";
    focus: string;
    relations: BaziRelation[];
  };
  months: Array<{
    monthOrdinal: number;
    label: string;
    pillar: Pillar;
    tenGod: TenGod;
    elementRole: "useful" | "avoid" | "neutral";
    focus: string;
    relations: BaziRelation[];
  }>;
  activeLuckCycle?: {
    startYear: number;
    endYear: number;
    startAge: number;
    endAge: number;
    pillar: Pillar;
    tenGod: TenGod;
    focus: string;
  };
};

export type DetailedBaziChart = {
  yearPillar: DetailedPillar;
  monthPillar: DetailedPillar;
  dayPillar: DetailedPillar;
  timePillar?: DetailedPillar;
  pillars: DetailedPillar[];
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  dayMasterYinYang: YinYang;
  elementBalance: ElementBalance;
  dominantElement: FiveElement;
  missingElements: FiveElement[];
  strongestElements: FiveElement[];
  tenGodBalance: Record<TenGod, number>;
  usefulElements: FiveElement[];
  avoidElements: FiveElement[];
  dayMasterStrength: {
    score: number;
    level: "身弱" | "中和" | "身強";
    summary: string;
  };
  relations: BaziRelation[];
  solarMonth: {
    solarYear: number;
    termName: string;
    termDateTime: string;
    branch: EarthlyBranch;
    monthOrdinal: number;
    approximate: boolean;
  };
  trueSolarTime?: {
    clockTime: string;
    adjustedTime: string;
    longitudeCorrectionMinutes: number;
  };
  luckCycles: LuckCycleCandidate[];
  timing: BaziAnnualTiming;
  calendarValidation: {
    exactSource: "lunar-typescript-1.8.6";
    approximatePillars: string[];
    exactPillars: string[];
    allMatched: boolean;
  };
  calculationScope: "bazi-foundation-annual-monthly-v5";
};

export const STEMS: HeavenlyStem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
export const BRANCHES: EarthlyBranch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

export const STEM_YINYANG: Record<HeavenlyStem, YinYang> = {
  甲: "陽",
  乙: "陰",
  丙: "陽",
  丁: "陰",
  戊: "陽",
  己: "陰",
  庚: "陽",
  辛: "陰",
  壬: "陽",
  癸: "陰",
};

const BRANCH_MAIN_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

const HIDDEN_STEMS: Record<EarthlyBranch, Array<{ stem: HeavenlyStem; weight: number; label: HiddenStem["label"] }>> = {
  子: [{ stem: "癸", weight: 1, label: "本気" }],
  丑: [
    { stem: "己", weight: 0.6, label: "本気" },
    { stem: "癸", weight: 0.3, label: "中気" },
    { stem: "辛", weight: 0.1, label: "余気" },
  ],
  寅: [
    { stem: "甲", weight: 0.6, label: "本気" },
    { stem: "丙", weight: 0.3, label: "中気" },
    { stem: "戊", weight: 0.1, label: "余気" },
  ],
  卯: [{ stem: "乙", weight: 1, label: "本気" }],
  辰: [
    { stem: "戊", weight: 0.6, label: "本気" },
    { stem: "乙", weight: 0.3, label: "中気" },
    { stem: "癸", weight: 0.1, label: "余気" },
  ],
  巳: [
    { stem: "丙", weight: 0.6, label: "本気" },
    { stem: "戊", weight: 0.3, label: "中気" },
    { stem: "庚", weight: 0.1, label: "余気" },
  ],
  午: [
    { stem: "丁", weight: 0.7, label: "本気" },
    { stem: "己", weight: 0.3, label: "中気" },
  ],
  未: [
    { stem: "己", weight: 0.6, label: "本気" },
    { stem: "丁", weight: 0.3, label: "中気" },
    { stem: "乙", weight: 0.1, label: "余気" },
  ],
  申: [
    { stem: "庚", weight: 0.6, label: "本気" },
    { stem: "壬", weight: 0.3, label: "中気" },
    { stem: "戊", weight: 0.1, label: "余気" },
  ],
  酉: [{ stem: "辛", weight: 1, label: "本気" }],
  戌: [
    { stem: "戊", weight: 0.6, label: "本気" },
    { stem: "辛", weight: 0.3, label: "中気" },
    { stem: "丁", weight: 0.1, label: "余気" },
  ],
  亥: [
    { stem: "壬", weight: 0.7, label: "本気" },
    { stem: "甲", weight: 0.3, label: "中気" },
  ],
};

const GENERATES: Record<FiveElement, FiveElement> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

const CONTROLS: Record<FiveElement, FiveElement> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

const GENERATED_BY: Record<FiveElement, FiveElement> = {
  木: "水",
  火: "木",
  土: "火",
  金: "土",
  水: "金",
};

const CONTROLLED_BY: Record<FiveElement, FiveElement> = {
  木: "金",
  火: "水",
  土: "木",
  金: "火",
  水: "土",
};

const MONTH_TERMS: Array<{
  month: number;
  day: number;
  termName: string;
  branch: EarthlyBranch;
  monthOrdinal: number;
}> = [
  { month: 1, day: 5, termName: "小寒", branch: "丑", monthOrdinal: 12 },
  { month: 2, day: 4, termName: "立春", branch: "寅", monthOrdinal: 1 },
  { month: 3, day: 6, termName: "啓蟄", branch: "卯", monthOrdinal: 2 },
  { month: 4, day: 5, termName: "清明", branch: "辰", monthOrdinal: 3 },
  { month: 5, day: 6, termName: "立夏", branch: "巳", monthOrdinal: 4 },
  { month: 6, day: 6, termName: "芒種", branch: "午", monthOrdinal: 5 },
  { month: 7, day: 7, termName: "小暑", branch: "未", monthOrdinal: 6 },
  { month: 8, day: 8, termName: "立秋", branch: "申", monthOrdinal: 7 },
  { month: 9, day: 8, termName: "白露", branch: "酉", monthOrdinal: 8 },
  { month: 10, day: 8, termName: "寒露", branch: "戌", monthOrdinal: 9 },
  { month: 11, day: 7, termName: "立冬", branch: "亥", monthOrdinal: 10 },
  { month: 12, day: 7, termName: "大雪", branch: "子", monthOrdinal: 11 },
];

const MONTH_STEM_START_BY_YEAR_STEM: Record<HeavenlyStem, number> = {
  甲: 2,
  己: 2,
  乙: 4,
  庚: 4,
  丙: 6,
  辛: 6,
  丁: 8,
  壬: 8,
  戊: 0,
  癸: 0,
};

const TWELVE_STAGE_TABLE: Record<HeavenlyStem, Record<EarthlyBranch, TwelveStage>> = {
  甲: { 亥: "長生", 子: "沐浴", 丑: "冠帯", 寅: "建禄", 卯: "帝旺", 辰: "衰", 巳: "病", 午: "死", 未: "墓", 申: "絶", 酉: "胎", 戌: "養" },
  乙: { 午: "長生", 巳: "沐浴", 辰: "冠帯", 卯: "建禄", 寅: "帝旺", 丑: "衰", 子: "病", 亥: "死", 戌: "墓", 酉: "絶", 申: "胎", 未: "養" },
  丙: { 寅: "長生", 卯: "沐浴", 辰: "冠帯", 巳: "建禄", 午: "帝旺", 未: "衰", 申: "病", 酉: "死", 戌: "墓", 亥: "絶", 子: "胎", 丑: "養" },
  丁: { 酉: "長生", 申: "沐浴", 未: "冠帯", 午: "建禄", 巳: "帝旺", 辰: "衰", 卯: "病", 寅: "死", 丑: "墓", 子: "絶", 亥: "胎", 戌: "養" },
  戊: { 寅: "長生", 卯: "沐浴", 辰: "冠帯", 巳: "建禄", 午: "帝旺", 未: "衰", 申: "病", 酉: "死", 戌: "墓", 亥: "絶", 子: "胎", 丑: "養" },
  己: { 酉: "長生", 申: "沐浴", 未: "冠帯", 午: "建禄", 巳: "帝旺", 辰: "衰", 卯: "病", 寅: "死", 丑: "墓", 子: "絶", 亥: "胎", 戌: "養" },
  庚: { 巳: "長生", 午: "沐浴", 未: "冠帯", 申: "建禄", 酉: "帝旺", 戌: "衰", 亥: "病", 子: "死", 丑: "墓", 寅: "絶", 卯: "胎", 辰: "養" },
  辛: { 子: "長生", 亥: "沐浴", 戌: "冠帯", 酉: "建禄", 申: "帝旺", 未: "衰", 午: "病", 巳: "死", 辰: "墓", 卯: "絶", 寅: "胎", 丑: "養" },
  壬: { 申: "長生", 酉: "沐浴", 戌: "冠帯", 亥: "建禄", 子: "帝旺", 丑: "衰", 寅: "病", 卯: "死", 辰: "墓", 巳: "絶", 午: "胎", 未: "養" },
  癸: { 卯: "長生", 寅: "沐浴", 丑: "冠帯", 子: "建禄", 亥: "帝旺", 戌: "衰", 酉: "病", 申: "死", 未: "墓", 午: "絶", 巳: "胎", 辰: "養" },
};

const STEM_COMBINATIONS: Record<string, { element: FiveElement; meaning: string }> = {
  甲己: { element: "土", meaning: "理想と現実を結び、形にする力。" },
  乙庚: { element: "金", meaning: "柔らかさと決断力が合わさり、専門性が磨かれる配置。" },
  丙辛: { element: "水", meaning: "華やかさと繊細さが混ざり、知性や表現が深まる配置。" },
  丁壬: { element: "木", meaning: "感性と流動性が結び、創造性や学びが育つ配置。" },
  戊癸: { element: "火", meaning: "安定感と直感が結び、情熱を持続させる配置。" },
};

const STEM_CLASHES: Record<string, string> = {
  甲庚: "開拓心と決断力がぶつかり、強い突破力にも摩擦にもなります。",
  乙辛: "繊細さと審美眼が鋭くなり、対人面で過敏さが出やすい配置です。",
  丙壬: "表現力と自由度が強く、勢いが大きいぶん方向づけが重要です。",
  丁癸: "感受性と思考が深まり、迷いを抱えやすい一方で洞察力が育ちます。",
};

const BRANCH_COMBINATIONS: Record<string, string> = {
  子丑: "粘り強く現実を固める縁。",
  寅亥: "成長と学びが広がる縁。",
  卯戌: "理想と責任を結びやすい縁。",
  辰酉: "整理力や専門性が出やすい縁。",
  巳申: "知性と行動力が絡み、変化を生みやすい縁。",
  午未: "表現と安定が結び、継続力が出る縁。",
};

const BRANCH_CLASHES: Record<string, string> = {
  子午: "感情と行動の波が大きく、勢いの調整が必要です。",
  丑未: "生活基盤や価値観の見直しが起きやすい配置です。",
  寅申: "挑戦と変化が強く、環境を変える力があります。",
  卯酉: "人間関係や美意識に緊張が出やすく、距離感が鍵です。",
  辰戌: "責任や居場所のテーマが揺さぶられやすい配置です。",
  巳亥: "直感と現実行動がぶつかり、方向転換が起きやすい配置です。",
};

const THREE_HARMONY = [
  { branches: ["申", "子", "辰"], element: "水", meaning: "知性・移動・情報を通じて運が動く。" },
  { branches: ["亥", "卯", "未"], element: "木", meaning: "育成・企画・人脈を通じて運が伸びる。" },
  { branches: ["寅", "午", "戌"], element: "火", meaning: "表現・発信・勝負所で運が開く。" },
  { branches: ["巳", "酉", "丑"], element: "金", meaning: "技術・整理・専門性で成果を作る。" },
] as const;

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function dateKey(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

function parseBirthDateParts(birthDate: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!match) throw new Error("Invalid birthDate. Expected YYYY-MM-DD.");
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function parseBirthTimeParts(birthTime?: string | null): { hour: number; minute: number } | undefined {
  if (!birthTime) return undefined;
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(birthTime);
  if (!match) return undefined;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function formatTargetDate(targetDate: Date | string, timezone = "Asia/Tokyo"): string {
  if (typeof targetDate === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new Error("Invalid targetDate. Expected YYYY-MM-DD.");
    }
    return targetDate;
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function pillarFromIndexes(stemIndex: number, branchIndex: number): Pillar {
  const stem = STEMS[mod(stemIndex, 10)];
  const branch = BRANCHES[mod(branchIndex, 12)];
  return { stem, branch, element: STEM_ELEMENT[stem] };
}

function calcYearPillar(solarYear: number): Pillar {
  return pillarFromIndexes(solarYear - 4, solarYear - 4);
}

function calcSolarMonth(params: { year: number; month: number; day: number }): DetailedBaziChart["solarMonth"] {
  const currentKey = dateKey(params.year, params.month, params.day);
  const lichunKey = dateKey(params.year, 2, 4);
  const solarYear = currentKey < lichunKey ? params.year - 1 : params.year;
  let selected = MONTH_TERMS[MONTH_TERMS.length - 1];

  for (const term of MONTH_TERMS) {
    if (currentKey >= dateKey(params.year, term.month, term.day)) {
      selected = term;
    }
  }

  if (params.month === 1 && params.day < 5) {
    selected = MONTH_TERMS[MONTH_TERMS.length - 1];
  }

  return {
    solarYear,
    termName: selected.termName,
    termDateTime: `${params.year}-${String(selected.month).padStart(2, "0")}-${String(selected.day).padStart(2, "0")} 00:00:00`,
    branch: selected.branch,
    monthOrdinal: selected.monthOrdinal,
    approximate: true,
  };
}

function calcMonthPillar(yearStem: HeavenlyStem, monthOrdinal: number): Pillar {
  const start = MONTH_STEM_START_BY_YEAR_STEM[yearStem];
  const stemIndex = start + monthOrdinal - 1;
  const branchIndex = BRANCHES.indexOf(MONTH_TERMS.find((term) => term.monthOrdinal === monthOrdinal)?.branch ?? "寅");
  return pillarFromIndexes(stemIndex, branchIndex);
}

function calcDayPillar(year: number, month: number, day: number): Pillar {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  const jd =
    day +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const baseJD = 2438734;
  const diff = jd - baseJD;
  return pillarFromIndexes(diff, diff);
}

function standardMeridian(
  birthDate: string,
  birthTime: string,
  timezone?: string,
): number | undefined {
  if (!timezone) return undefined;
  try {
    const [year, month, day] = birthDate.split("-").map(Number);
    const [hour, minute] = birthTime.split(":").map(Number);
    const localAsUtc = Date.UTC(year, month - 1, day, hour, minute);
    const actualUtc = toUTC(birthDate, birthTime, timezone).getTime();
    const utcOffsetHours = (localAsUtc - actualUtc) / 3_600_000;
    return utcOffsetHours * 15;
  } catch {
    return undefined;
  }
}

function calcTrueSolarTime(input: {
  birthDate: string;
  birthTime?: string | null;
  longitude?: number;
  timezone?: string;
}): DetailedBaziChart["trueSolarTime"] {
  const time = parseBirthTimeParts(input.birthTime);
  const meridian = input.birthTime
    ? standardMeridian(input.birthDate, input.birthTime, input.timezone)
    : undefined;
  if (!time || input.longitude == null || meridian == null) return undefined;

  const clockMinutes = time.hour * 60 + time.minute;
  const longitudeCorrectionMinutes = Math.round((input.longitude - meridian) * 4);
  const adjustedMinutes = mod(clockMinutes + longitudeCorrectionMinutes, 24 * 60);
  const adjustedHour = Math.floor(adjustedMinutes / 60);
  const adjustedMinute = adjustedMinutes % 60;

  return {
    clockTime: `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`,
    adjustedTime: `${String(adjustedHour).padStart(2, "0")}:${String(adjustedMinute).padStart(2, "0")}`,
    longitudeCorrectionMinutes,
  };
}

function calcTimePillar(dayStem: HeavenlyStem, birthTime?: string | null, solarTime?: DetailedBaziChart["trueSolarTime"]): Pillar | undefined {
  const time = parseBirthTimeParts(solarTime?.adjustedTime ?? birthTime);
  if (!time) return undefined;

  const decimalHour = time.hour + time.minute / 60;
  const branchIndex = Math.floor(((decimalHour + 1) % 24) / 2);
  const dayStemIndex = STEMS.indexOf(dayStem);
  const startByDayStem: Record<number, number> = {
    0: 0,
    1: 2,
    2: 4,
    3: 6,
    4: 8,
    5: 0,
    6: 2,
    7: 4,
    8: 6,
    9: 8,
  };

  return pillarFromIndexes(startByDayStem[dayStemIndex] + branchIndex, branchIndex);
}

function pillarFromGanZhi(ganZhi: string): Pillar {
  const stem = ganZhi[0] as HeavenlyStem;
  const branch = ganZhi[1] as EarthlyBranch;
  if (!STEMS.includes(stem) || !BRANCHES.includes(branch)) {
    throw new Error(`Invalid GanZhi returned by calendar engine: ${ganZhi}`);
  }
  return { stem, branch, element: STEM_ELEMENT[stem] };
}

function solarTermNameJa(name: string): string {
  const names: Record<string, string> = { 惊蛰: "啓蟄", 芒种: "芒種" };
  return names[name] ?? name;
}

function exactCalendar(
  input: {
    birthDate: string;
    birthTime?: string | null;
    longitude?: number;
    timezone?: string;
    gender?: "male" | "female" | "other";
  },
  trueSolarTime?: DetailedBaziChart["trueSolarTime"],
  targetDate: Date | string = new Date(),
): {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  timePillar?: Pillar;
  solarMonth: DetailedBaziChart["solarMonth"];
  luckCycles: LuckCycleCandidate[];
  timing: BaziAnnualTiming;
} {
  const parts = parseBirthDateParts(input.birthDate);
  const rawTime = parseBirthTimeParts(trueSolarTime?.adjustedTime ?? input.birthTime);
  const clockTime = parseBirthTimeParts(input.birthTime);
  const baseMinutes = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    rawTime?.hour ?? 12,
    rawTime?.minute ?? 0,
  );
  const rolloverMinutes =
    rawTime && clockTime
      ? rawTime.hour * 60 + rawTime.minute - (clockTime.hour * 60 + clockTime.minute)
      : 0;
  const normalized = new Date(
    Math.abs(rolloverMinutes) > 12 * 60
      ? baseMinutes + (rolloverMinutes > 0 ? -24 : 24) * 60 * 60 * 1000
      : baseMinutes,
  );
  const solar = Solar.fromYmdHms(
    normalized.getUTCFullYear(),
    normalized.getUTCMonth() + 1,
    normalized.getUTCDate(),
    normalized.getUTCHours(),
    normalized.getUTCMinutes(),
    0,
  );
  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();
  const termSolar = input.timezone
    ? solarAtSameInstant(
        input.birthDate,
        input.birthTime ?? "12:00",
        input.timezone,
        "Asia/Shanghai",
      )
    : solar;
  const termLunar = termSolar.getLunar();
  const termEightChar = termLunar.getEightChar();
  const yearPillar = pillarFromGanZhi(termEightChar.getYear());
  const monthPillar = pillarFromGanZhi(termEightChar.getMonth());
  const dayPillar = pillarFromGanZhi(eightChar.getDay());
  const timePillar = input.birthTime ? pillarFromGanZhi(eightChar.getTime()) : undefined;
  const previousJie = termLunar.getPrevJie(false);
  const branchIndex = BRANCHES.indexOf(monthPillar.branch);
  const monthOrdinal = mod(branchIndex - BRANCHES.indexOf("寅"), 12) + 1;
  const currentYearPillar = calcYearPillar(parts.year);
  const solarYear =
    currentYearPillar.stem === yearPillar.stem && currentYearPillar.branch === yearPillar.branch
      ? parts.year
      : parts.year - 1;
  const yuns = [
    { gender: "female" as const, yun: termEightChar.getYun(0, 2) },
    { gender: "male" as const, yun: termEightChar.getYun(1, 2) },
  ];
  const luckCycles = yuns.map(({ gender, yun }): LuckCycleCandidate => {
    const direction = yun.isForward() ? "forward" : "reverse";
    const startAge = Number(
      (
        yun.getStartYear() +
        yun.getStartMonth() / 12 +
        yun.getStartDay() / 360 +
        yun.getStartHour() / 8_640
      ).toFixed(2),
    );

    return {
      direction,
      startAge,
      startDateTime: chinaSolarToTimezone(yun.getStartSolar(), input.timezone),
      selected: input.gender === gender,
      reason: `${direction === "forward" ? "次" : "前"}の節入りまでの分単位差を三日一年法で換算。`,
      cycles: yun
        .getDaYun(9)
        .filter((cycle) => cycle.getIndex() > 0)
        .map((cycle) => {
          const pillar = pillarFromGanZhi(cycle.getGanZhi());
          return { age: cycle.getStartAge(), pillar, focus: cycleFocus(pillar, dayPillar.stem) };
        }),
    };
  });

  const normalizedTargetDate = formatTargetDate(targetDate, input.timezone);
  const targetParts = parseBirthDateParts(normalizedTargetDate);
  const targetSolar = input.timezone
    ? solarAtSameInstant(normalizedTargetDate, "12:00", input.timezone)
    : Solar.fromYmdHms(
        targetParts.year,
        targetParts.month,
        targetParts.day,
        12,
        0,
        0,
      );
  const annualPillar = pillarFromGanZhi(targetSolar.getLunar().getEightChar().getYear());
  const annualTenGod = tenGodFor(dayPillar.stem, annualPillar.stem);
  const monthlyPillar = pillarFromGanZhi(targetSolar.getLunar().getEightChar().getMonth());
  const monthlyOrdinal = mod(BRANCHES.indexOf(monthlyPillar.branch) - BRANCHES.indexOf("寅"), 12) + 1;
  const selectedYun = yuns.find(({ gender }) => input.gender === gender)?.yun;
  const activeDaYun = selectedYun
    ?.getDaYun(12)
    .find(
      (cycle) =>
        cycle.getIndex() > 0 &&
        targetParts.year >= cycle.getStartYear() &&
        targetParts.year <= cycle.getEndYear(),
    );
  const natalPillars = [
    buildDetailedPillar("年柱", yearPillar, dayPillar.stem),
    buildDetailedPillar("月柱", monthPillar, dayPillar.stem),
    buildDetailedPillar("日柱", dayPillar, dayPillar.stem),
    ...(input.birthTime && timePillar
      ? [buildDetailedPillar("時柱", timePillar, dayPillar.stem)]
      : []),
  ];
  const timingRelations = transitRelations(annualPillar, "流年", natalPillars);
  const months = Array.from({ length: 12 }, (_, index) => {
    const pillar = calcMonthPillar(annualPillar.stem, index + 1);
    return {
      monthOrdinal: index + 1,
      label: `${pillar.branch}月`,
      pillar,
      tenGod: tenGodFor(dayPillar.stem, pillar.stem),
      elementRole: "neutral" as const,
      focus: cycleFocus(pillar, dayPillar.stem),
      relations: transitRelations(pillar, "流月", natalPillars),
    };
  });

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    timePillar,
    solarMonth: {
      solarYear,
      termName: solarTermNameJa(previousJie.getName()),
      termDateTime: chinaSolarToTimezone(previousJie.getSolar(), input.timezone),
      branch: monthPillar.branch,
      monthOrdinal,
      approximate: false,
    },
    luckCycles,
    timing: {
      targetDate: normalizedTargetDate,
      annualPillar,
      annualTenGod,
      annualElementRole: "neutral",
      focus: cycleFocus(annualPillar, dayPillar.stem),
      relations: timingRelations,
      monthly: {
        monthOrdinal: monthlyOrdinal,
        pillar: monthlyPillar,
        tenGod: tenGodFor(dayPillar.stem, monthlyPillar.stem),
        elementRole: "neutral",
        focus: cycleFocus(monthlyPillar, dayPillar.stem),
        relations: transitRelations(monthlyPillar, "流月", natalPillars),
      },
      months,
      activeLuckCycle: activeDaYun
        ? (() => {
            const pillar = pillarFromGanZhi(activeDaYun.getGanZhi());
            return {
              startYear: activeDaYun.getStartYear(),
              endYear: activeDaYun.getEndYear(),
              startAge: activeDaYun.getStartAge(),
              endAge: activeDaYun.getEndAge(),
              pillar,
              tenGod: tenGodFor(dayPillar.stem, pillar.stem),
              focus: cycleFocus(pillar, dayPillar.stem),
            };
          })()
        : undefined,
    },
  };
}

function pillarText(pillar?: Pillar): string {
  return pillar ? `${pillar.stem}${pillar.branch}` : "未算出";
}

export function tenGodFor(dayStem: HeavenlyStem, targetStem: HeavenlyStem): TenGod {
  const dayElement = STEM_ELEMENT[dayStem];
  const targetElement = STEM_ELEMENT[targetStem];
  const samePolarity = STEM_YINYANG[dayStem] === STEM_YINYANG[targetStem];

  if (dayElement === targetElement) return samePolarity ? "比肩" : "劫財";
  if (GENERATES[dayElement] === targetElement) return samePolarity ? "食神" : "傷官";
  if (CONTROLS[dayElement] === targetElement) return samePolarity ? "偏財" : "正財";
  if (CONTROLLED_BY[dayElement] === targetElement) return samePolarity ? "偏官" : "正官";
  return samePolarity ? "偏印" : "印綬";
}

function buildDetailedPillar(
  label: DetailedPillar["label"],
  pillar: Pillar,
  dayStem: HeavenlyStem,
): DetailedPillar {
  const hiddenStems = HIDDEN_STEMS[pillar.branch].map((hidden) => ({
    ...hidden,
    element: STEM_ELEMENT[hidden.stem],
    tenGod: tenGodFor(dayStem, hidden.stem),
  }));

  return {
    ...pillar,
    label,
    stemTenGod: label === "日柱" ? undefined : tenGodFor(dayStem, pillar.stem),
    hiddenStems,
    twelveStage: TWELVE_STAGE_TABLE[dayStem][pillar.branch],
  };
}

function calcElementBalance(pillars: DetailedPillar[]): ElementBalance {
  const balance: ElementBalance = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const pillar of pillars) {
    balance[pillar.element] += 1;
    balance[BRANCH_MAIN_ELEMENT[pillar.branch]] += 0.7;
    for (const hidden of pillar.hiddenStems) {
      balance[hidden.element] += hidden.weight;
    }
  }
  return balance;
}

function calcTenGodBalance(pillars: DetailedPillar[]): Record<TenGod, number> {
  const balance: Record<TenGod, number> = {
    比肩: 0,
    劫財: 0,
    食神: 0,
    傷官: 0,
    偏財: 0,
    正財: 0,
    偏官: 0,
    正官: 0,
    偏印: 0,
    印綬: 0,
  };

  for (const pillar of pillars) {
    if (pillar.stemTenGod) balance[pillar.stemTenGod] += 1;
    for (const hidden of pillar.hiddenStems) {
      balance[hidden.tenGod] += hidden.weight;
    }
  }

  return balance;
}

function calcDayMasterStrength(params: {
  dayMaster: HeavenlyStem;
  monthBranch: EarthlyBranch;
  pillars: DetailedPillar[];
  elementBalance: ElementBalance;
}): DetailedBaziChart["dayMasterStrength"] {
  const dayElement = STEM_ELEMENT[params.dayMaster];
  const resourceElement = GENERATED_BY[dayElement];
  let score = 45;

  score += params.elementBalance[dayElement] * 6;
  score += params.elementBalance[resourceElement] * 4;

  if (BRANCH_MAIN_ELEMENT[params.monthBranch] === dayElement) score += 18;
  if (BRANCH_MAIN_ELEMENT[params.monthBranch] === resourceElement) score += 10;
  if (params.pillars.some((pillar) => pillar.hiddenStems.some((hidden) => hidden.stem === params.dayMaster))) score += 8;

  const outputElement = GENERATES[dayElement];
  const wealthElement = CONTROLS[dayElement];
  const officerElement = CONTROLLED_BY[dayElement];
  score -= params.elementBalance[outputElement] * 3;
  score -= params.elementBalance[wealthElement] * 3;
  score -= params.elementBalance[officerElement] * 3;

  const bounded = Math.max(0, Math.min(100, Math.round(score)));
  const level = bounded >= 67 ? "身強" : bounded <= 43 ? "身弱" : "中和";
  const summary =
    level === "身強"
      ? "日主に根や助けがあり、自分の意志を押し出しやすい命式です。"
      : level === "身弱"
        ? "日主を支える要素が控えめで、環境選びや味方作りが運を左右しやすい命式です。"
        : "日主の強弱は極端ではなく、状況に応じて攻めと守りを切り替えやすい命式です。";

  return { score: bounded, level, summary };
}

function sortedElements(balance: ElementBalance): [FiveElement, number][] {
  return (Object.entries(balance) as [FiveElement, number][]).sort((a, b) => b[1] - a[1]);
}

function calcUsefulElements(dayElement: FiveElement, strength: DetailedBaziChart["dayMasterStrength"]): {
  usefulElements: FiveElement[];
  avoidElements: FiveElement[];
} {
  if (strength.level === "身強") {
    return {
      usefulElements: [GENERATES[dayElement], CONTROLS[dayElement], CONTROLLED_BY[dayElement]],
      avoidElements: [dayElement, GENERATED_BY[dayElement]],
    };
  }

  if (strength.level === "身弱") {
    return {
      usefulElements: [GENERATED_BY[dayElement], dayElement],
      avoidElements: [CONTROLS[dayElement], CONTROLLED_BY[dayElement]],
    };
  }

  return {
    usefulElements: [GENERATES[dayElement], GENERATED_BY[dayElement]],
    avoidElements: [],
  };
}

function pairedLookup<T>(table: Record<string, T>, a: string, b: string): T | undefined {
  return table[`${a}${b}`] ?? table[`${b}${a}`];
}

function calcRelations(pillars: DetailedPillar[]): BaziRelation[] {
  const relations: BaziRelation[] = [];

  for (let i = 0; i < pillars.length; i += 1) {
    for (let j = i + 1; j < pillars.length; j += 1) {
      const source = pillars[i];
      const target = pillars[j];
      const combination = pairedLookup(STEM_COMBINATIONS, source.stem, target.stem);
      if (combination) {
        relations.push({
          kind: "天干合",
          target: `${source.label}${source.stem}・${target.label}${target.stem}`,
          meaning: `${combination.element}へ向かう合。${combination.meaning}`,
        });
      }

      const stemClash = pairedLookup(STEM_CLASHES, source.stem, target.stem);
      if (stemClash) {
        relations.push({
          kind: "天干冲",
          target: `${source.label}${source.stem}・${target.label}${target.stem}`,
          meaning: stemClash,
        });
      }

      const branchCombination = pairedLookup(BRANCH_COMBINATIONS, source.branch, target.branch);
      if (branchCombination) {
        relations.push({
          kind: "支合",
          target: `${source.label}${source.branch}・${target.label}${target.branch}`,
          meaning: branchCombination,
        });
      }

      const branchClash = pairedLookup(BRANCH_CLASHES, source.branch, target.branch);
      if (branchClash) {
        relations.push({
          kind: "支冲",
          target: `${source.label}${source.branch}・${target.label}${target.branch}`,
          meaning: branchClash,
        });
      }
    }
  }

  const branches = new Set(pillars.map((pillar) => pillar.branch));
  for (const group of THREE_HARMONY) {
    const count = group.branches.filter((branch) => branches.has(branch as EarthlyBranch)).length;
    if (count >= 2) {
      relations.push({
        kind: "三合",
        target: group.branches.join("・"),
        meaning: `${group.element}局の気配。${group.meaning}`,
      });
    }
  }

  return relations;
}

function transitRelations(
  transit: Pillar,
  label: "流年" | "流月",
  natalPillars: DetailedPillar[],
): BaziRelation[] {
  const relations: BaziRelation[] = [];

  for (const natal of natalPillars) {
    const stemCombination = pairedLookup(STEM_COMBINATIONS, transit.stem, natal.stem);
    if (stemCombination) {
      relations.push({
        kind: "天干合",
        target: `${label}${transit.stem}・${natal.label}${natal.stem}`,
        meaning: `${stemCombination.element}へ向かう合。${stemCombination.meaning}`,
      });
    }

    const stemClash = pairedLookup(STEM_CLASHES, transit.stem, natal.stem);
    if (stemClash) {
      relations.push({
        kind: "天干冲",
        target: `${label}${transit.stem}・${natal.label}${natal.stem}`,
        meaning: stemClash,
      });
    }

    const branchCombination = pairedLookup(BRANCH_COMBINATIONS, transit.branch, natal.branch);
    if (branchCombination) {
      relations.push({
        kind: "支合",
        target: `${label}${transit.branch}・${natal.label}${natal.branch}`,
        meaning: branchCombination,
      });
    }

    const branchClash = pairedLookup(BRANCH_CLASHES, transit.branch, natal.branch);
    if (branchClash) {
      relations.push({
        kind: "支冲",
        target: `${label}${transit.branch}・${natal.label}${natal.branch}`,
        meaning: branchClash,
      });
    }
  }

  return relations;
}

function daysBetween(a: { year: number; month: number; day: number }, b: { year: number; month: number; day: number }): number {
  return Math.abs(dateKey(a.year, a.month, a.day) - dateKey(b.year, b.month, b.day)) / 86_400_000;
}

function previousAndNextTerms(parts: { year: number; month: number; day: number }): {
  previous: { year: number; month: number; day: number; termName: string };
  next: { year: number; month: number; day: number; termName: string };
} {
  const current = dateKey(parts.year, parts.month, parts.day);
  const terms = [-1, 0, 1].flatMap((yearOffset) =>
    MONTH_TERMS.map((term) => ({
      year: parts.year + yearOffset,
      month: term.month,
      day: term.day,
      termName: term.termName,
      key: dateKey(parts.year + yearOffset, term.month, term.day),
    })),
  );
  const previous = terms.filter((term) => term.key <= current).sort((a, b) => b.key - a.key)[0];
  const next = terms.filter((term) => term.key > current).sort((a, b) => a.key - b.key)[0];
  return { previous, next };
}

function nextPillar(pillar: Pillar, step: number): Pillar {
  return pillarFromIndexes(STEMS.indexOf(pillar.stem) + step, BRANCHES.indexOf(pillar.branch) + step);
}

function cycleFocus(pillar: Pillar, dayMaster: HeavenlyStem): string {
  const god = tenGodFor(dayMaster, pillar.stem);
  const focusByGod: Record<TenGod, string> = {
    比肩: "自立・競争・自分軸",
    劫財: "仲間・勝負・資金管理",
    食神: "表現・安心・継続収入",
    傷官: "発信・改革・専門性",
    偏財: "商機・人脈・流動資産",
    正財: "堅実収入・生活設計・信用",
    偏官: "挑戦・責任・突破力",
    正官: "肩書き・評価・社会的信用",
    偏印: "学び直し・企画・独自性",
    印綬: "資格・保護・知的基盤",
  };
  return focusByGod[god];
}

function calcLuckCycles(parts: { year: number; month: number; day: number }, monthPillar: Pillar, dayMaster: HeavenlyStem): LuckCycleCandidate[] {
  const terms = previousAndNextTerms(parts);
  const daysToNext = daysBetween(parts, terms.next);
  const daysToPrevious = daysBetween(parts, terms.previous);

  return [
    {
      direction: "forward",
      startAge: Number((daysToNext / 3).toFixed(1)),
      selected: false,
      reason: `次の節入り（${terms.next.termName}）までの日数から概算。性別・流派設定後に採用可否を決めます。`,
      cycles: Array.from({ length: 8 }, (_, index) => {
        const pillar = nextPillar(monthPillar, index + 1);
        return { age: Number((daysToNext / 3 + index * 10).toFixed(1)), pillar, focus: cycleFocus(pillar, dayMaster) };
      }),
    },
    {
      direction: "reverse",
      startAge: Number((daysToPrevious / 3).toFixed(1)),
      selected: false,
      reason: `前の節入り（${terms.previous.termName}）までの日数から概算。性別・流派設定後に採用可否を決めます。`,
      cycles: Array.from({ length: 8 }, (_, index) => {
        const pillar = nextPillar(monthPillar, -(index + 1));
        return { age: Number((daysToPrevious / 3 + index * 10).toFixed(1)), pillar, focus: cycleFocus(pillar, dayMaster) };
      }),
    },
  ];
}

export function calcDetailedBazi(
  input: {
    birthDate: string;
    birthTime?: string | null;
    longitude?: number;
    timezone?: string;
    gender?: "male" | "female" | "other";
  },
  targetDate: Date | string = new Date(),
): DetailedBaziChart {
  const parts = parseBirthDateParts(input.birthDate);
  const trueSolarTime = calcTrueSolarTime(input);
  const approximateSolarMonth = calcSolarMonth(parts);
  const approximateYear = calcYearPillar(approximateSolarMonth.solarYear);
  const approximateMonth = calcMonthPillar(approximateYear.stem, approximateSolarMonth.monthOrdinal);
  const approximateDay = calcDayPillar(parts.year, parts.month, parts.day);
  const approximateTime = calcTimePillar(approximateDay.stem, input.birthTime, trueSolarTime);
  const exact = exactCalendar(input, trueSolarTime, targetDate);
  const { yearPillar, monthPillar, dayPillar, timePillar, solarMonth } = exact;

  const detailedYear = buildDetailedPillar("年柱", yearPillar, dayPillar.stem);
  const detailedMonth = buildDetailedPillar("月柱", monthPillar, dayPillar.stem);
  const detailedDay = buildDetailedPillar("日柱", dayPillar, dayPillar.stem);
  const detailedTime = timePillar ? buildDetailedPillar("時柱", timePillar, dayPillar.stem) : undefined;
  const pillars = [detailedYear, detailedMonth, detailedDay, ...(detailedTime ? [detailedTime] : [])];
  const elementBalance = calcElementBalance(pillars);
  const tenGodBalance = calcTenGodBalance(pillars);
  const ranking = sortedElements(elementBalance);
  const strongestElements = ranking.filter(([, value]) => value === ranking[0][1]).map(([element]) => element);
  const missingElements = ranking.filter(([, value]) => value === 0).map(([element]) => element);
  const dayMasterElement = STEM_ELEMENT[dayPillar.stem];
  const dayMasterStrength = calcDayMasterStrength({
    dayMaster: dayPillar.stem,
    monthBranch: monthPillar.branch,
    pillars,
    elementBalance,
  });
  const useful = calcUsefulElements(dayMasterElement, dayMasterStrength);

  return {
    yearPillar: detailedYear,
    monthPillar: detailedMonth,
    dayPillar: detailedDay,
    timePillar: detailedTime,
    pillars,
    dayMaster: dayPillar.stem,
    dayMasterElement,
    dayMasterYinYang: STEM_YINYANG[dayPillar.stem],
    elementBalance,
    dominantElement: strongestElements[0],
    missingElements,
    strongestElements,
    tenGodBalance,
    usefulElements: useful.usefulElements,
    avoidElements: useful.avoidElements,
    dayMasterStrength,
    relations: calcRelations(pillars),
    solarMonth,
    trueSolarTime,
    luckCycles:
      exact.luckCycles.length > 0
        ? exact.luckCycles
        : calcLuckCycles(parts, monthPillar, dayPillar.stem),
    timing: {
      ...exact.timing,
      annualElementRole: useful.usefulElements.includes(exact.timing.annualPillar.element)
        ? "useful"
        : useful.avoidElements.includes(exact.timing.annualPillar.element)
          ? "avoid"
          : "neutral",
      monthly: {
        ...exact.timing.monthly,
        elementRole: useful.usefulElements.includes(exact.timing.monthly.pillar.element)
          ? "useful"
          : useful.avoidElements.includes(exact.timing.monthly.pillar.element)
            ? "avoid"
            : "neutral",
      },
      months: exact.timing.months.map((month) => ({
        ...month,
        elementRole: useful.usefulElements.includes(month.pillar.element)
          ? "useful"
          : useful.avoidElements.includes(month.pillar.element)
            ? "avoid"
            : "neutral",
      })),
    },
    calendarValidation: {
      exactSource: "lunar-typescript-1.8.6",
      approximatePillars: [approximateYear, approximateMonth, approximateDay, approximateTime].map(pillarText),
      exactPillars: [yearPillar, monthPillar, dayPillar, timePillar].map(pillarText),
      allMatched: [
        pillarText(approximateYear) === pillarText(yearPillar),
        pillarText(approximateMonth) === pillarText(monthPillar),
        pillarText(approximateDay) === pillarText(dayPillar),
        pillarText(approximateTime) === pillarText(timePillar),
      ].every(Boolean),
    },
    calculationScope: "bazi-foundation-annual-monthly-v5",
  };
}
