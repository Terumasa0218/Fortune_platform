// 12星座
export type ZodiacSign =
  | "おひつじ"
  | "おうし"
  | "ふたご"
  | "かに"
  | "しし"
  | "おとめ"
  | "てんびん"
  | "さそり"
  | "いて"
  | "やぎ"
  | "みずがめ"
  | "うお";

export type PlanetName =
  | "太陽"
  | "月"
  | "水星"
  | "金星"
  | "火星"
  | "木星"
  | "土星"
  | "天王星"
  | "海王星"
  | "冥王星";

// 天体位置
export type Planet = {
  name: PlanetName;
  longitude: number; // 0〜360度
  sign: ZodiacSign;
  degree: number; // 星座内の度数 0〜29
  house?: number;
  retrograde?: boolean;
  role: "self" | "emotion" | "mind" | "love" | "drive" | "growth" | "discipline" | "change" | "dream" | "transformation";
};

export type AnglePoint = {
  name: "ASC" | "MC";
  longitude: number;
  sign: ZodiacSign;
  degree: number;
};

export type LunarNodePoint = {
  name: "ドラゴンヘッド" | "ドラゴンテイル";
  longitude: number;
  sign: ZodiacSign;
  degree: number;
  method: "mean-node";
};

export type AspectName = "合" | "セクスタイル" | "スクエア" | "トライン" | "オポジション";

export type Aspect = {
  from: PlanetName;
  to: PlanetName;
  aspect: AspectName;
  orb: number;
  applying: boolean;
};

export type TransitAspect = {
  transit: PlanetName;
  natal: PlanetName;
  aspect: AspectName;
  orb: number;
  applying: boolean;
  tone: "supportive" | "challenging" | "intense";
};

export type WesternTransitSnapshot = {
  targetDate: string;
  planets: Planet[];
  aspects: TransitAspect[];
};

export type TransitWindow = {
  transit: PlanetName;
  natal: PlanetName;
  aspect: AspectName;
  tone: TransitAspect["tone"];
  startDate: string;
  peakDate: string;
  endDate: string;
  minimumOrb: number;
};

export type WesternTransitForecast = {
  startDate: string;
  endDate: string;
  stepDays: 7;
  planets: PlanetName[];
  windows: TransitWindow[];
};

// 西洋占星術の解釈結果
export type WesternReading = {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  ascendant?: AnglePoint;
  midheaven?: AnglePoint;
  lunarNodes?: [LunarNodePoint, LunarNodePoint];
  planets: Planet[];
  aspects: Aspect[];
  houseSystem: "whole-sign";
  personality: string;
  talent: string;
  destiny: string;
  loveStyle: string;
};
