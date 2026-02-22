import swisseph from 'swisseph';

import { AstroPlanet, AstroZodiacSign, BirthChart, PlanetPosition } from './types';

type SweCalcUtResult = {
  flag: number;
  longitude: number;
  latitude: number;
  distance: number;
  longitudeSpeed: number;
};

type SweHousesResult = {
  ascendant: number;
  mc: number;
  house: number[];
};

type SwissephModule = {
  SE_GREG_CAL: number;
  SEFLG_SWIEPH: number;
  SEFLG_SPEED: number;
  swe_set_ephe_path: (path: string) => void;
  swe_julday: (
    year: number,
    month: number,
    day: number,
    hour: number,
    calendar: number,
  ) => number;
  swe_calc_ut: (julianDay: number, planet: number, flags: number) => SweCalcUtResult;
  swe_houses: (
    julianDay: number,
    latitude: number,
    longitude: number,
    houseSystem: string,
  ) => SweHousesResult;
};

const swe = swisseph as unknown as SwissephModule;

// Swiss Ephemeris の初期化
// エフェメリスファイルのパスを設定（デフォルトは内蔵データ使用）
swe.swe_set_ephe_path('');

export function toJulianDay(date: Date): number {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();
  const hour = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  const jd = swe.swe_julday(year, month, day, hour, swe.SE_GREG_CAL);

  return jd;
}

export function calculatePlanetPosition(
  planet: AstroPlanet,
  julianDay: number,
): PlanetPosition {
  const result = swe.swe_calc_ut(
    julianDay,
    planet,
    swe.SEFLG_SWIEPH | swe.SEFLG_SPEED,
  );

  if (result.flag < 0) {
    throw new Error(`Failed to calculate position for planet ${planet}`);
  }

  const longitude = result.longitude;
  const sign = Math.floor(longitude / 30) as AstroZodiacSign;
  const degree = longitude % 30;

  return {
    planet,
    longitude,
    latitude: result.latitude,
    distance: result.distance,
    speed: result.longitudeSpeed,
    sign,
    degree,
  };
}

export function calculateAllPlanets(julianDay: number): PlanetPosition[] {
  const planets = [
    AstroPlanet.Sun,
    AstroPlanet.Moon,
    AstroPlanet.Mercury,
    AstroPlanet.Venus,
    AstroPlanet.Mars,
    AstroPlanet.Jupiter,
    AstroPlanet.Saturn,
    AstroPlanet.Uranus,
    AstroPlanet.Neptune,
    AstroPlanet.Pluto,
  ];

  return planets.map((planet) => calculatePlanetPosition(planet, julianDay));
}

export function calculateAscMc(
  julianDay: number,
  latitude: number,
  longitude: number,
): { asc: number; mc: number } {
  const houses = swe.swe_houses(
    julianDay,
    latitude,
    longitude,
    'P',
  );

  return {
    asc: houses.ascendant,
    mc: houses.mc,
  };
}

export function calculateHouses(
  julianDay: number,
  latitude: number,
  longitude: number,
): number[] {
  const houses = swe.swe_houses(
    julianDay,
    latitude,
    longitude,
    'P',
  );

  return houses.house;
}

export function calculateBirthChart(
  birthDate: Date,
  latitude: number,
  longitude: number,
): BirthChart {
  const jd = toJulianDay(birthDate);
  const planets = calculateAllPlanets(jd);
  const { asc, mc } = calculateAscMc(jd, latitude, longitude);
  const houses = calculateHouses(jd, latitude, longitude);

  return { planets, asc, mc, houses };
}
