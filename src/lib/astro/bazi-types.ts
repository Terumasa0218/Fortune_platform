// 十干
export type HeavenlyStem =
  | "甲"
  | "乙"
  | "丙"
  | "丁"
  | "戊"
  | "己"
  | "庚"
  | "辛"
  | "壬"
  | "癸";

// 十二支
export type EarthlyBranch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

// 五行
export type FiveElement = "木" | "火" | "土" | "金" | "水";

// 柱
export type Pillar = {
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  element: FiveElement;
};

// 五行バランス
export type ElementBalance = Record<FiveElement, number>;

// 四柱推命の解釈結果
export type BaziReading = {
  yearPillar: Pillar;
  monthPillar: Pillar;
  dayPillar: Pillar;
  timePillar?: Pillar;
  elementBalance: ElementBalance;
  dominantElement: FiveElement;
  personality: string;
  talent: string;
  destiny: string;
  loveStyle: string;
};
