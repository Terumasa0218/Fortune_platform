import { interpretBaziChart } from "./bazi-interpretation";
import type {
  BaziReading,
  EarthlyBranch,
  ElementBalance,
  FiveElement,
  HeavenlyStem,
  Pillar,
} from "./bazi-types";

const STEMS: HeavenlyStem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const BRANCHES: EarthlyBranch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
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

const BRANCH_ELEMENT: Record<EarthlyBranch, FiveElement> = {
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

function calcYearPillar(year: number): Pillar {
  const stemIndex = ((year - 4) % 10 + 10) % 10;
  const branchIndex = ((year - 4) % 12 + 12) % 12;
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENT[stem] };
}

const MONTH_STEM_OFFSET: Record<number, number> = {
  0: 2,
  1: 4,
  2: 6,
  3: 8,
  4: 0,
};

const MONTH_BRANCH_INDEX: number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1];

function calcMonthPillar(year: number, month: number): Pillar {
  const yearStemIndex = ((year - 4) % 10 + 10) % 10;
  const offsetKey = yearStemIndex % 5;
  const stemStartIndex = MONTH_STEM_OFFSET[offsetKey];
  const stemIndex = (stemStartIndex + (month - 1)) % 10;
  const branchIndex = MONTH_BRANCH_INDEX[month - 1];
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENT[stem] };
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
  const stemIndex = ((diff % 10) + 10) % 10;
  const branchIndex = ((diff % 12) + 12) % 12;
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENT[stem] };
}

function calcTimePillar(dayStem: HeavenlyStem, hour: number): Pillar {
  const branchIndex = Math.floor(((hour + 1) % 24) / 2);
  const dayStemHourOffset: Record<number, number> = {
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

  const dayStemIndex = STEMS.indexOf(dayStem);
  const stemStartIndex = dayStemHourOffset[dayStemIndex];
  const stemIndex = (stemStartIndex + branchIndex) % 10;
  const stem = STEMS[stemIndex];
  const branch = BRANCHES[branchIndex];
  return { stem, branch, element: STEM_ELEMENT[stem] };
}

function calcElementBalance(pillars: Pillar[]): ElementBalance {
  const balance: ElementBalance = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const pillar of pillars) {
    balance[pillar.element] += 1;
    balance[BRANCH_ELEMENT[pillar.branch]] += 1;
  }
  return balance;
}

export function calcBaziChart(params: { birthDate: string; birthTime?: string }): BaziReading {
  const [year, month, day] = params.birthDate.split("-").map(Number);
  const hour = params.birthTime ? parseInt(params.birthTime.split(":")[0], 10) : undefined;

  const yearPillar = calcYearPillar(year);
  const monthPillar = calcMonthPillar(year, month);
  const dayPillar = calcDayPillar(year, month, day);
  const timePillar = hour !== undefined ? calcTimePillar(dayPillar.stem, hour) : undefined;

  const pillars = [yearPillar, monthPillar, dayPillar, ...(timePillar ? [timePillar] : [])];
  const elementBalance = calcElementBalance(pillars);
  const dominantElement = (Object.entries(elementBalance) as [FiveElement, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0][0];

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    timePillar,
    elementBalance,
    dominantElement,
    ...interpretBaziChart({
      yearPillar,
      monthPillar,
      dayPillar,
      elementBalance,
      dominantElement,
    }),
  };
}
