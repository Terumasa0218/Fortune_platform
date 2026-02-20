// 天体の列挙
export enum Planet {
  Sun = 0,
  Moon = 1,
  Mercury = 2,
  Venus = 3,
  Mars = 4,
  Jupiter = 5,
  Saturn = 6,
  Uranus = 7,
  Neptune = 8,
  Pluto = 9,
}

// 星座の列挙
export enum ZodiacSign {
  Aries = 0,
  Taurus = 1,
  Gemini = 2,
  Cancer = 3,
  Leo = 4,
  Virgo = 5,
  Libra = 6,
  Scorpio = 7,
  Sagittarius = 8,
  Capricorn = 9,
  Aquarius = 10,
  Pisces = 11,
}

// 天体の位置情報
export type PlanetPosition = {
  planet: Planet;
  longitude: number; // 黄経（0-360度）
  latitude: number; // 黄緯
  distance: number; // 地球からの距離（AU）
  speed: number; // 日周運動（度/日）
  sign: ZodiacSign; // 所在星座
  degree: number; // 星座内の度数（0-30度）
};

// 出生図データ
export type BirthChart = {
  planets: PlanetPosition[];
  asc: number; // Ascendant（黄経）
  mc: number; // Medium Coeli（黄経）
  houses: number[]; // 12ハウスのカスプ（黄経）
};
