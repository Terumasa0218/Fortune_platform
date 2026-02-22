import "server-only";
import swisseph from "swisseph";
import type { Aspect, Planet, WesternReading, ZodiacSign } from "@/lib/astro/types";

type CalcParams = {
  birthDate: string;
  birthTime?: string;
  latitude?: number;
  longitude?: number;
};

const ZODIAC_SIGNS: ZodiacSign[] = [
  "おひつじ",
  "おうし",
  "ふたご",
  "かに",
  "しし",
  "おとめ",
  "てんびん",
  "さそり",
  "いて",
  "やぎ",
  "みずがめ",
  "うお",
];

const PLANETS = [
  { id: 0, name: "太陽" },
  { id: 1, name: "月" },
  { id: 2, name: "水星" },
  { id: 3, name: "金星" },
  { id: 4, name: "火星" },
  { id: 5, name: "木星" },
  { id: 6, name: "土星" },
  { id: 7, name: "天王星" },
  { id: 8, name: "海王星" },
  { id: 9, name: "冥王星" },
] as const;

const swe = swisseph as unknown as {
  SE_GREG_CAL: number;
  SEFLG_SWIEPH: number;
  SEFLG_SPEED: number;
  swe_set_ephe_path: (path: string) => void;
  swe_julday: (year: number, month: number, day: number, hour: number, cal: number) => number;
  swe_calc_ut: (jd: number, planet: number, flags: number) => { flag: number; longitude: number };
  swe_houses: (jd: number, lat: number, lon: number, system: string) => { ascendant: number };
};

swe.swe_set_ephe_path("");

export function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const signIndex = Math.floor(normalized / 30);
  return {
    sign: ZODIAC_SIGNS[signIndex],
    degree: Number((normalized % 30).toFixed(1)),
  };
}

export function calcAspects(planets: Planet[]): Aspect[] {
  const defs = [
    { type: "conjunction", angle: 0, orb: 8 },
    { type: "opposition", angle: 180, orb: 8 },
    { type: "trine", angle: 120, orb: 8 },
    { type: "square", angle: 90, orb: 7 },
    { type: "sextile", angle: 60, orb: 6 },
  ] as const;

  const aspects: Aspect[] = [];
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const p1 = planets[i];
      const p2 = planets[j];
      const rawDiff = Math.abs(p1.longitude - p2.longitude);
      const diff = rawDiff > 180 ? 360 - rawDiff : rawDiff;

      for (const def of defs) {
        const orb = Math.abs(diff - def.angle);
        if (orb <= def.orb) {
          aspects.push({
            planet1: p1.name,
            planet2: p2.name,
            type: def.type,
            orb: Number(orb.toFixed(2)),
          });
          break;
        }
      }
    }
  }

  return aspects;
}

function toJulianDay({ birthDate, birthTime }: Pick<CalcParams, "birthDate" | "birthTime">): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = (birthTime ?? "12:00").split(":").map(Number);
  const decimalHour = hour + minute / 60;
  return swe.swe_julday(year, month, day, decimalHour, swe.SE_GREG_CAL);
}

export function calcWesternChart(params: CalcParams): WesternReading {
  const jd = toJulianDay(params);

  const planets: Planet[] = PLANETS.map((planet) => {
    const result = swe.swe_calc_ut(jd, planet.id, swe.SEFLG_SWIEPH | swe.SEFLG_SPEED);
    const { sign, degree } = longitudeToSign(result.longitude);
    return {
      name: planet.name,
      longitude: Number((((result.longitude % 360) + 360) % 360).toFixed(6)),
      sign,
      degree,
    };
  });

  const sunSign = planets[0].sign;
  const moonSign = planets[1].sign;

  let ascendant: ZodiacSign | undefined;
  if (params.birthTime && typeof params.latitude === "number" && typeof params.longitude === "number") {
    const houses = swe.swe_houses(jd, params.latitude, params.longitude, "P");
    ascendant = longitudeToSign(houses.ascendant).sign;
  }

  return {
    sunSign,
    moonSign,
    ascendant,
    planets,
    aspects: calcAspects(planets),
    personality: "",
    talent: "",
    destiny: "",
    loveStyle: "",
  };
}
