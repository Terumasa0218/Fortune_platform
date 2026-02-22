import { julian, moonposition, solar } from "astronomia";
import { interpretVedicChart } from "./vedic-interpretation";
import type { Nakshatra, Rashi, VedicReading } from "./vedic-types";

const RASHIS: Rashi[] = [
  "メーシャ",
  "ヴリシャバ",
  "ミトゥナ",
  "カルカタ",
  "シンハ",
  "カンニャ",
  "トゥラー",
  "ヴリシュチカ",
  "ダヌ",
  "マカラ",
  "クンバ",
  "ミーナ",
];

const NAKSHATRAS: Nakshatra[] = [
  "アシュヴィニー",
  "バラニー",
  "クリッティカー",
  "ローヒニー",
  "ムリガシラー",
  "アールドラー",
  "プナルヴァス",
  "プシュヤ",
  "アーシュレーシャー",
  "マガー",
  "プールヴァ・パールグニー",
  "ウッタラ・パールグニー",
  "ハスタ",
  "チトラー",
  "スヴァーティー",
  "ヴィシャーカー",
  "アヌラーダー",
  "ジェーシュター",
  "ムーラ",
  "プールヴァ・アーシャーダー",
  "ウッタラ・アーシャーダー",
  "シュラヴァナ",
  "ダニシュター",
  "シャタビシャジュ",
  "プールヴァ・バードラパダー",
  "ウッタラ・バードラパダー",
  "レーヴァティー",
];

function getLahiriAyanamsha(jd: number): number {
  const t = (jd - 2415020.5) / 36524.25;
  return 22.46047 + 1.396042 * t + 0.000308 * t * t;
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

function toSiderealLongitude(longitude: number, ayanamsha: number): number {
  const corrected = longitude - ayanamsha;
  return ((corrected % 360) + 360) % 360;
}

function longitudeToRashi(longitude: number): { rashi: Rashi; degree: number } {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / 30);
  return {
    rashi: RASHIS[index],
    degree: Math.floor(normalized % 30),
  };
}

function longitudeToNakshatra(longitude: number): Nakshatra {
  const normalized = ((longitude % 360) + 360) % 360;
  const index = Math.floor(normalized / (360 / 27));
  return NAKSHATRAS[index];
}

export function calcVedicChart(params: { birthDate: string; birthTime?: string }): VedicReading {
  const jd = toJulianDay(params.birthDate, params.birthTime);
  const sunLonDeg = (solar.apparentLongitude(jd) * 180) / Math.PI;
  const moonLonDeg = (moonposition.position(jd).lon * 180) / Math.PI;

  const ayanamsha = getLahiriAyanamsha(jd);
  const siderealSunLon = toSiderealLongitude(sunLonDeg, ayanamsha);
  const siderealMoonLon = toSiderealLongitude(moonLonDeg, ayanamsha);

  const sun = longitudeToRashi(siderealSunLon);
  const moon = longitudeToRashi(siderealMoonLon);
  const moonNakshatra = longitudeToNakshatra(siderealMoonLon);

  return interpretVedicChart({
    sunRashi: sun.rashi,
    moonRashi: moon.rashi,
    moonNakshatra,
  });
}
