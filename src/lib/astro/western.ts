import { julian, moonposition, solar } from "astronomia";
import type { Planet, WesternReading, ZodiacSign } from "@/lib/astro/western-types";

const SIGNS: ZodiacSign[] = [
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

export function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);

  return {
    sign: SIGNS[index],
    degree: Math.floor(normalized % 30),
  };
}

function toJulianDay(birthDate: string, birthTime?: string): number {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = (birthTime ?? "12:00").split(":").map(Number);

  const jstDecimalHour = hour + minute / 60;
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  utcDate.setUTCHours(utcDate.getUTCHours() + jstDecimalHour - 9);

  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth() + 1;
  const utcDay = utcDate.getUTCDate();
  const utcHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60;

  return julian.CalendarGregorianToJD(utcYear, utcMonth, utcDay + utcHour / 24);
}

export function calcWesternChart(params: {
  birthDate: string;
  birthTime?: string;
}): WesternReading {
  const jde = toJulianDay(params.birthDate, params.birthTime);

  const sunLonDeg = (solar.apparentLongitude(jde) * 180) / Math.PI;
  const moonLonDeg = (moonposition.position(jde).lon * 180) / Math.PI;

  const sun = longitudeToSign(sunLonDeg);
  const moon = longitudeToSign(moonLonDeg);

  const planets: Planet[] = [
    {
      name: "太陽",
      longitude: ((sunLonDeg % 360) + 360) % 360,
      sign: sun.sign,
      degree: sun.degree,
    },
    {
      name: "月",
      longitude: ((moonLonDeg % 360) + 360) % 360,
      sign: moon.sign,
      degree: moon.degree,
    },
  ];

  return {
    sunSign: sun.sign,
    moonSign: moon.sign,
    planets,
    personality: "",
    talent: "",
    destiny: "",
    loveStyle: "",
  };
}
