import type { PalaceName } from "../ziwei";

type EarthlyBranch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";
type PalaceFixture = Readonly<Record<EarthlyBranch, readonly [PalaceName, ...string[]]>>;

export const ZIWEI_INDEPENDENT_SOURCE = {
  repository: "https://github.com/online-sile-projects/ZiWeiDouShu",
  commit: "9bf1aefe1e94904f434b03b3930fbf828a6352e5",
  method: "独自の旧暦換算・五行局表・十四主星表によるブラウザ実装",
  comparedFields: ["命宮", "身宮", "五行局", "十二宮名", "十四主星配置"],
} as const;

export type ZiweiIndependentFixture = {
  id: string;
  birthDate: string;
  birthTime: string;
  gender: "male" | "female";
  fiveElementsClass: string;
  mingBranch: EarthlyBranch;
  shenBranch: EarthlyBranch;
  palaces: PalaceFixture;
};

export const ZIWEI_INDEPENDENT_FIXTURES: readonly ZiweiIndependentFixture[] = [
  {
    id: "2004-02-18-未時-男性",
    birthDate: "2004-02-18",
    birthTime: "13:03",
    gender: "male",
    fiveElementsClass: "土五局",
    mingBranch: "未",
    shenBranch: "酉",
    palaces: {
      子: ["交友宮", "天梁"], 丑: ["遷移宮", "廉貞", "七殺"], 寅: ["疾厄宮"],
      卯: ["財帛宮"], 辰: ["子女宮", "天同"], 巳: ["夫妻宮", "武曲", "破軍"],
      午: ["兄弟宮", "太陽"], 未: ["命宮", "天府"], 申: ["父母宮", "天機", "太陰"],
      酉: ["福徳宮", "紫微", "貪狼"], 戌: ["田宅宮", "巨門"], 亥: ["官禄宮", "天相"],
    },
  },
  {
    id: "2000-08-16-寅時-男性",
    birthDate: "2000-08-16",
    birthTime: "04:00",
    gender: "male",
    fiveElementsClass: "木三局",
    mingBranch: "午",
    shenBranch: "戌",
    palaces: {
      子: ["遷移宮", "貪狼"], 丑: ["疾厄宮", "天同", "巨門"], 寅: ["財帛宮", "武曲", "天相"],
      卯: ["子女宮", "太陽", "天梁"], 辰: ["夫妻宮", "七殺"], 巳: ["兄弟宮", "天機"],
      午: ["命宮", "紫微"], 未: ["父母宮"], 申: ["福徳宮", "破軍"],
      酉: ["田宅宮"], 戌: ["官禄宮", "廉貞", "天府"], 亥: ["交友宮", "太陰"],
    },
  },
  {
    id: "1988-11-05-子時-女性",
    birthDate: "1988-11-05",
    birthTime: "00:30",
    gender: "female",
    fiveElementsClass: "水二局",
    mingBranch: "戌",
    shenBranch: "戌",
    palaces: {
      子: ["福徳宮", "破軍"], 丑: ["田宅宮", "天機"], 寅: ["官禄宮", "紫微", "天府"],
      卯: ["交友宮", "太陰"], 辰: ["遷移宮", "貪狼"], 巳: ["疾厄宮", "巨門"],
      午: ["財帛宮", "廉貞", "天相"], 未: ["子女宮", "天梁"], 申: ["夫妻宮", "七殺"],
      酉: ["兄弟宮", "天同"], 戌: ["命宮", "武曲"], 亥: ["父母宮", "太陽"],
    },
  },
  {
    id: "1995-06-30-午時-男性",
    birthDate: "1995-06-30",
    birthTime: "12:00",
    gender: "male",
    fiveElementsClass: "火六局",
    mingBranch: "丑",
    shenBranch: "丑",
    palaces: {
      子: ["兄弟宮"], 丑: ["命宮"], 寅: ["父母宮"],
      卯: ["福徳宮", "廉貞", "破軍"], 辰: ["田宅宮"], 巳: ["官禄宮", "天府"],
      午: ["交友宮", "天同", "太陰"], 未: ["遷移宮", "武曲", "貪狼"], 申: ["疾厄宮", "太陽", "巨門"],
      酉: ["財帛宮", "天相"], 戌: ["子女宮", "天機", "天梁"], 亥: ["夫妻宮", "紫微", "七殺"],
    },
  },
  {
    id: "2012-08-23-酉時-女性",
    birthDate: "2012-08-23",
    birthTime: "18:00",
    gender: "female",
    fiveElementsClass: "金四局",
    mingBranch: "亥",
    shenBranch: "巳",
    palaces: {
      子: ["父母宮", "破軍"], 丑: ["福徳宮", "天機"], 寅: ["田宅宮", "紫微", "天府"],
      卯: ["官禄宮", "太陰"], 辰: ["交友宮", "貪狼"], 巳: ["遷移宮", "巨門"],
      午: ["疾厄宮", "廉貞", "天相"], 未: ["財帛宮", "天梁"], 申: ["子女宮", "七殺"],
      酉: ["夫妻宮", "天同"], 戌: ["兄弟宮", "武曲"], 亥: ["命宮", "太陽"],
    },
  },
  {
    id: "2024-10-01-亥時-女性",
    birthDate: "2024-10-01",
    birthTime: "22:00",
    gender: "female",
    fiveElementsClass: "火六局",
    mingBranch: "戌",
    shenBranch: "申",
    palaces: {
      子: ["福徳宮", "天同", "太陰"], 丑: ["田宅宮", "武曲", "貪狼"], 寅: ["官禄宮", "太陽", "巨門"],
      卯: ["交友宮", "天相"], 辰: ["遷移宮", "天機", "天梁"], 巳: ["疾厄宮", "紫微", "七殺"],
      午: ["財帛宮"], 未: ["子女宮"], 申: ["夫妻宮"],
      酉: ["兄弟宮", "廉貞", "破軍"], 戌: ["命宮"], 亥: ["父母宮", "天府"],
    },
  },
];
