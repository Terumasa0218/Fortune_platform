import { apparent, base, coord, julian, moonposition, nutation, planetposition, pluto, precess, sidereal, solar } from "astronomia";
import data from "astronomia/data";
import { toUTC } from "../time/parseBirth";
import type {
  AnglePoint,
  Aspect,
  AspectName,
  LunarNodePoint,
  Planet,
  PlanetName,
  TransitAspect,
  TransitWindow,
  WesternReading,
  WesternTransitForecast,
  WesternTransitSnapshot,
  ZodiacSign,
} from "./western-types";

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

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

const PLANET_ROLE: Record<PlanetName, Planet["role"]> = {
  太陽: "self",
  月: "emotion",
  水星: "mind",
  金星: "love",
  火星: "drive",
  木星: "growth",
  土星: "discipline",
  天王星: "change",
  海王星: "dream",
  冥王星: "transformation",
};

const PLANET_DATA: Array<{ name: Exclude<PlanetName, "太陽" | "月">; data: unknown }> = [
  { name: "水星", data: data.vsop87Bmercury },
  { name: "金星", data: data.vsop87Bvenus },
  { name: "火星", data: data.vsop87Bmars },
  { name: "木星", data: data.vsop87Bjupiter },
  { name: "土星", data: data.vsop87Bsaturn },
  { name: "天王星", data: data.vsop87Buranus },
  { name: "海王星", data: data.vsop87Bneptune },
];

const ASPECTS: Array<{ aspect: AspectName; angle: number; orb: number }> = [
  { aspect: "合", angle: 0, orb: 8 },
  { aspect: "セクスタイル", angle: 60, orb: 4 },
  { aspect: "スクエア", angle: 90, orb: 6 },
  { aspect: "トライン", angle: 120, orb: 6 },
  { aspect: "オポジション", angle: 180, orb: 8 },
];

const SIGN_INTERPRETATION: Record<ZodiacSign, { personality: string; talent: string; destiny: string; loveStyle: string }> = {
  おひつじ: {
    personality: "直感的に動き、勝負所で先陣を切るタイプです。",
    talent: "行動力、突破力、ゼロから始める力。",
    destiny: "自分から火をつけることで人生の展開が速くなります。",
    loveStyle: "好きになると早く、率直な愛情表現を好みます。",
  },
  おうし: {
    personality: "安定感があり、五感や価値あるものを大切にします。",
    talent: "継続力、美意識、資源を育てる力。",
    destiny: "焦らず積み上げたものが大きな財産になります。",
    loveStyle: "安心感、誠実さ、身体感覚の相性を重視します。",
  },
  ふたご: {
    personality: "好奇心が強く、情報や会話から可能性を広げます。",
    talent: "言語化、編集、学習速度、軽やかな接続力。",
    destiny: "複数の世界をつなぐことで道が開きます。",
    loveStyle: "会話のテンポと知的刺激が恋の入口になります。",
  },
  かに: {
    personality: "共感力が高く、守りたいものへの愛情が深いです。",
    talent: "居場所作り、ケア、記憶力、身内をまとめる力。",
    destiny: "安心できる拠点を持つほど外でも力を出せます。",
    loveStyle: "信頼と安心を重ねながら、深い関係を育てます。",
  },
  しし: {
    personality: "存在感があり、自分らしい表現で場を明るくします。",
    talent: "創造性、演出力、リーダーシップ。",
    destiny: "誇りを持てる舞台に立つことで運が伸びます。",
    loveStyle: "尊敬と称賛が愛情を温め、ドラマ性も大切にします。",
  },
  おとめ: {
    personality: "観察力が鋭く、物事を整え改善する力があります。",
    talent: "分析、実務、調整、品質を高める力。",
    destiny: "小さな改善を積み上げることで信頼を得ます。",
    loveStyle: "誠実さ、清潔感、日々の気遣いを重視します。",
  },
  てんびん: {
    personality: "バランス感覚があり、人や価値観をつなぐタイプです。",
    talent: "交渉、デザイン、審美眼、関係調整。",
    destiny: "良い相手や場を選ぶことで可能性が広がります。",
    loveStyle: "対等さ、品の良さ、会話の美しさを求めます。",
  },
  さそり: {
    personality: "集中力が深く、表面ではなく本質へ潜るタイプです。",
    talent: "洞察、研究、心理理解、変容力。",
    destiny: "深く関わるテーマを持つほど人生が強く動きます。",
    loveStyle: "浅い関係より、信頼で深く結ばれる関係を求めます。",
  },
  いて: {
    personality: "自由を愛し、学びや遠い世界へ心が向かいます。",
    talent: "探求、教育、発信、越境する力。",
    destiny: "未知の世界に触れるほど運が拡張します。",
    loveStyle: "束縛より成長を共有できる関係に惹かれます。",
  },
  やぎ: {
    personality: "責任感が強く、現実を積み上げる力があります。",
    talent: "構築、管理、達成、長期戦の強さ。",
    destiny: "時間を味方につけ、社会的な信用を築きます。",
    loveStyle: "誠実さ、将来性、責任感を重視します。",
  },
  みずがめ: {
    personality: "独自の視点を持ち、未来や仕組みを考えるタイプです。",
    talent: "改革、ネットワーク、技術、客観性。",
    destiny: "既存の枠から少し離れた場所で才能が開きます。",
    loveStyle: "友情と自由が土台にある関係を好みます。",
  },
  うお: {
    personality: "感受性が豊かで、境界を越えて共感するタイプです。",
    talent: "想像力、癒し、芸術性、直感。",
    destiny: "目に見えない価値を形にすることで人を助けます。",
    loveStyle: "ロマンや優しさを大切にし、心のつながりを求めます。",
  },
};

export function longitudeToSign(longitude: number): { sign: ZodiacSign; degree: number } {
  const normalized = normalizeDegrees(longitude);
  const index = Math.floor(normalized / 30);

  return {
    sign: SIGNS[index],
    degree: Math.floor(normalized % 30),
  };
}

function normalizeDegrees(value: number): number {
  return ((value % 360) + 360) % 360;
}

function signedDelta(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

function toJulianDay(birthDate: string, birthTime?: string | null, timezone = "Asia/Tokyo"): number {
  const utcDate = toUTC(birthDate, birthTime ?? "12:00", timezone);
  const utcYear = utcDate.getUTCFullYear();
  const utcMonth = utcDate.getUTCMonth() + 1;
  const utcDay = utcDate.getUTCDate();
  const utcHour = utcDate.getUTCHours() + utcDate.getUTCMinutes() / 60 + utcDate.getUTCSeconds() / 3600;

  return julian.CalendarGregorianToJD(utcYear, utcMonth, utcDay + utcHour / 24);
}

function planetEclipticLongitude(planetData: unknown, jde: number): number {
  const planet = new planetposition.Planet(planetData);
  const earth = new planetposition.Planet(data.vsop87Bearth);
  const earthPosition = earth.position(jde);
  const [sinEarthLat, cosEarthLat] = base.sincos(earthPosition.lat);
  const [sinEarthLon, cosEarthLon] = base.sincos(earthPosition.lon);
  let x = 0;
  let y = 0;
  let z = 0;

  function calculate(lightTime = 0): void {
    const position = planet.position(jde - lightTime);
    const [sinLat, cosLat] = base.sincos(position.lat);
    const [sinLon, cosLon] = base.sincos(position.lon);
    x = position.range * cosLat * cosLon - earthPosition.range * cosEarthLat * cosEarthLon;
    y = position.range * cosLat * sinLon - earthPosition.range * cosEarthLat * sinEarthLon;
    z = position.range * sinLat - earthPosition.range * sinEarthLat;
  }

  calculate();
  calculate(base.lightTime(Math.sqrt(x * x + y * y + z * z)));

  let longitude = Math.atan2(y, x);
  let latitude = Math.atan2(z, Math.hypot(x, y));
  const [aberrationLon, aberrationLat] = apparent.eclipticAberration(longitude, latitude, jde);
  const fk5 = planetposition.toFK5(longitude + aberrationLon, latitude + aberrationLat, jde);
  const [nutationLon] = nutation.nutation(jde);
  longitude = fk5.lon + nutationLon;
  latitude = fk5.lat;

  return normalizeDegrees(longitude * DEG);
}

function sunLongitude(jde: number): number {
  return normalizeDegrees(solar.apparentLongitude(base.J2000Century(jde)) * DEG);
}

function moonLongitude(jde: number): number {
  const [nutationLon] = nutation.nutation(jde);
  return normalizeDegrees((moonposition.position(jde).lon + nutationLon) * DEG);
}

function meanLunarNodes(jde: number): [LunarNodePoint, LunarNodePoint] {
  const t = base.J2000Century(jde);
  const headLongitude = normalizeDegrees(
    125.04452 - 1934.136261 * t + 0.0020708 * t * t + (t * t * t) / 450_000,
  );
  const tailLongitude = normalizeDegrees(headLongitude + 180);
  const head = longitudeToSign(headLongitude);
  const tail = longitudeToSign(tailLongitude);
  return [
    {
      name: "ドラゴンヘッド",
      longitude: headLongitude,
      sign: head.sign,
      degree: head.degree,
      method: "mean-node",
    },
    {
      name: "ドラゴンテイル",
      longitude: tailLongitude,
      sign: tail.sign,
      degree: tail.degree,
      method: "mean-node",
    },
  ];
}

function plutoLongitude(jde: number): number {
  const earth = new planetposition.Planet(data.vsop87Bearth);
  const j2000 = pluto.astrometric(jde, earth);
  const ofDate = precess.position(j2000, 2000, base.JDEToJulianYear(jde), 0, 0);
  const ecliptic = new coord.Equatorial(ofDate.ra, ofDate.dec).toEcliptic(nutation.meanObliquity(jde));
  const [aberrationLon] = apparent.eclipticAberration(ecliptic.lon, ecliptic.lat, jde);
  const [nutationLon] = nutation.nutation(jde);
  return normalizeDegrees((ecliptic.lon + aberrationLon + nutationLon) * DEG);
}

function makePlanet(name: PlanetName, longitude: number, jde: number, ascendantSignIndex?: number): Planet {
  const sign = longitudeToSign(longitude);
  const previous = name === "太陽" ? sunLongitude(jde - 0.5) : name === "月" ? moonLongitude(jde - 0.5) : undefined;
  const next = name === "太陽" ? sunLongitude(jde + 0.5) : name === "月" ? moonLongitude(jde + 0.5) : undefined;
  const signIndex = SIGNS.indexOf(sign.sign);

  return {
    name,
    longitude,
    sign: sign.sign,
    degree: sign.degree,
    role: PLANET_ROLE[name],
    house: ascendantSignIndex == null ? undefined : ((signIndex - ascendantSignIndex + 12) % 12) + 1,
    retrograde: previous == null || next == null ? undefined : signedDelta(previous, next) < 0,
  };
}

function makeVsopPlanet(
  name: Exclude<PlanetName, "太陽" | "月">,
  planetData: unknown,
  jde: number,
  ascendantSignIndex?: number,
): Planet {
  const longitude = planetEclipticLongitude(planetData, jde);
  const previous = planetEclipticLongitude(planetData, jde - 0.5);
  const next = planetEclipticLongitude(planetData, jde + 0.5);
  const sign = longitudeToSign(longitude);
  const signIndex = SIGNS.indexOf(sign.sign);

  return {
    name,
    longitude,
    sign: sign.sign,
    degree: sign.degree,
    role: PLANET_ROLE[name],
    house: ascendantSignIndex == null ? undefined : ((signIndex - ascendantSignIndex + 12) % 12) + 1,
    retrograde: signedDelta(previous, next) < 0,
  };
}

function makePluto(jde: number, ascendantSignIndex?: number): Planet {
  const longitude = plutoLongitude(jde);
  const previous = plutoLongitude(jde - 0.5);
  const next = plutoLongitude(jde + 0.5);
  const sign = longitudeToSign(longitude);
  const signIndex = SIGNS.indexOf(sign.sign);

  return {
    name: "冥王星",
    longitude,
    sign: sign.sign,
    degree: sign.degree,
    role: PLANET_ROLE.冥王星,
    house: ascendantSignIndex == null ? undefined : ((signIndex - ascendantSignIndex + 12) % 12) + 1,
    retrograde: signedDelta(previous, next) < 0,
  };
}

function calcAngles(jde: number, latitude?: number, longitude?: number): { ascendant?: AnglePoint; midheaven?: AnglePoint } {
  if (latitude == null || longitude == null) return {};

  const localSidereal = normalizeDegrees((sidereal.apparent(jde) / 86400) * 360 + longitude) * RAD;
  const obliquity = nutation.meanObliquity(jde);
  const latitudeRad = latitude * RAD;
  const ascLongitude = normalizeDegrees(
    Math.atan2(-Math.cos(localSidereal), Math.sin(localSidereal) * Math.cos(obliquity) + Math.tan(latitudeRad) * Math.sin(obliquity)) *
      DEG +
      180,
  );
  const mcLongitude = normalizeDegrees(Math.atan2(Math.sin(localSidereal), Math.cos(localSidereal) * Math.cos(obliquity)) * DEG);
  const asc = longitudeToSign(ascLongitude);
  const mc = longitudeToSign(mcLongitude);

  return {
    ascendant: { name: "ASC", longitude: ascLongitude, sign: asc.sign, degree: asc.degree },
    midheaven: { name: "MC", longitude: mcLongitude, sign: mc.sign, degree: mc.degree },
  };
}

function calcAspects(planets: Planet[]): Aspect[] {
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      const from = planets[i];
      const to = planets[j];
      const distance = Math.abs(signedDelta(from.longitude, to.longitude));
      const matched = ASPECTS.find((aspect) => Math.abs(distance - aspect.angle) <= aspect.orb);

      if (matched) {
        aspects.push({
          from: from.name,
          to: to.name,
          aspect: matched.aspect,
          orb: Number(Math.abs(distance - matched.angle).toFixed(2)),
          applying: signedDelta(from.longitude, to.longitude) > 0,
        });
      }
    }
  }

  return aspects.sort((a, b) => a.orb - b.orb);
}

function buildPlanets(jde: number, ascendantSignIndex?: number): Planet[] {
  return [
    makePlanet("太陽", sunLongitude(jde), jde, ascendantSignIndex),
    makePlanet("月", moonLongitude(jde), jde, ascendantSignIndex),
    ...PLANET_DATA.map((planet) => makeVsopPlanet(planet.name, planet.data, jde, ascendantSignIndex)),
    makePluto(jde, ascendantSignIndex),
  ];
}

function targetDateString(targetDate: Date | string, timezone: string): string {
  if (typeof targetDate === "string") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
      throw new Error("Invalid targetDate. Expected YYYY-MM-DD.");
    }
    return targetDate;
  }

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);
  const value = (type: "year" | "month" | "day") =>
    parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + days));
  return [
    value.getUTCFullYear(),
    String(value.getUTCMonth() + 1).padStart(2, "0"),
    String(value.getUTCDate()).padStart(2, "0"),
  ].join("-");
}

function transitTone(transit: PlanetName, aspect: AspectName): TransitAspect["tone"] {
  if (aspect === "トライン" || aspect === "セクスタイル") return "supportive";
  if (aspect === "スクエア" || aspect === "オポジション") return "challenging";
  if (transit === "木星" || transit === "金星") return "supportive";
  if (transit === "土星" || transit === "火星") return "challenging";
  return "intense";
}

function calcTransitAspects(
  natalPlanets: Planet[],
  transitPlanets: Planet[],
  nextTransitPlanets: Planet[],
): TransitAspect[] {
  const result: TransitAspect[] = [];

  for (const transit of transitPlanets) {
    const next = nextTransitPlanets.find((planet) => planet.name === transit.name);
    if (!next) continue;

    for (const natal of natalPlanets) {
      const distance = Math.abs(signedDelta(natal.longitude, transit.longitude));
      const matched = ASPECTS.find((aspect) => Math.abs(distance - aspect.angle) <= Math.min(aspect.orb, 3));
      if (!matched) continue;

      const orb = Math.abs(distance - matched.angle);
      const nextDistance = Math.abs(signedDelta(natal.longitude, next.longitude));
      const nextOrb = Math.abs(nextDistance - matched.angle);
      result.push({
        transit: transit.name,
        natal: natal.name,
        aspect: matched.aspect,
        orb: Number(orb.toFixed(2)),
        applying: nextOrb < orb,
        tone: transitTone(transit.name, matched.aspect),
      });
    }
  }

  return result.sort((a, b) => a.orb - b.orb);
}

export function calcWesternTransitSnapshot(params: {
  natalPlanets: Planet[];
  targetDate: Date | string;
  timezone?: string;
}): WesternTransitSnapshot {
  const timezone = params.timezone ?? "Asia/Tokyo";
  const targetDate = targetDateString(params.targetDate, timezone);
  const jde = toJulianDay(targetDate, "12:00", timezone);
  const planets = buildPlanets(jde);
  const nextPlanets = buildPlanets(jde + 1);

  return {
    targetDate,
    planets,
    aspects: calcTransitAspects(params.natalPlanets, planets, nextPlanets),
  };
}

const FORECAST_PLANETS: PlanetName[] = ["木星", "土星", "天王星", "海王星", "冥王星"];

function buildForecastPlanets(jde: number): Planet[] {
  return [
    ...PLANET_DATA.filter((planet) => FORECAST_PLANETS.includes(planet.name)).map((planet) =>
      makeVsopPlanet(planet.name, planet.data, jde),
    ),
    makePluto(jde),
  ];
}

export function calcWesternTransitForecast(params: {
  natalPlanets: Planet[];
  startDate: Date | string;
  timezone?: string;
  days?: number;
}): WesternTransitForecast {
  const timezone = params.timezone ?? "Asia/Tokyo";
  const startDate = targetDateString(params.startDate, timezone);
  const days = Math.max(7, Math.min(params.days ?? 365, 730));
  const samples: Array<{ date: string; aspects: TransitAspect[] }> = [];

  for (let offset = 0; offset <= days; offset += 7) {
    const date = addDays(startDate, offset);
    const jde = toJulianDay(date, "12:00", timezone);
    const planets = buildForecastPlanets(jde);
    const nextPlanets = buildForecastPlanets(jde + 1);
    samples.push({
      date,
      aspects: calcTransitAspects(params.natalPlanets, planets, nextPlanets),
    });
  }

  type OpenWindow = TransitWindow & { lastSeenDate: string };
  const open = new Map<string, OpenWindow>();
  const windows: TransitWindow[] = [];
  const closeWindow = (current: OpenWindow): TransitWindow => ({
    transit: current.transit,
    natal: current.natal,
    aspect: current.aspect,
    tone: current.tone,
    startDate: current.startDate,
    peakDate: current.peakDate,
    endDate: current.endDate,
    minimumOrb: current.minimumOrb,
  });

  for (const sample of samples) {
    const seen = new Set<string>();
    for (const aspect of sample.aspects) {
      const key = `${aspect.transit}|${aspect.natal}|${aspect.aspect}`;
      seen.add(key);
      const current = open.get(key);
      if (!current) {
        open.set(key, {
          transit: aspect.transit,
          natal: aspect.natal,
          aspect: aspect.aspect,
          tone: aspect.tone,
          startDate: sample.date,
          peakDate: sample.date,
          endDate: sample.date,
          minimumOrb: aspect.orb,
          lastSeenDate: sample.date,
        });
        continue;
      }

      current.endDate = sample.date;
      current.lastSeenDate = sample.date;
      if (aspect.orb < current.minimumOrb) {
        current.minimumOrb = aspect.orb;
        current.peakDate = sample.date;
      }
    }

    for (const [key, current] of open) {
      if (seen.has(key)) continue;
      if (addDays(current.lastSeenDate, 7) < sample.date) {
        windows.push(closeWindow(current));
        open.delete(key);
      }
    }
  }

  for (const current of open.values()) {
    windows.push(closeWindow(current));
  }

  return {
    startDate,
    endDate: addDays(startDate, days),
    stepDays: 7,
    planets: FORECAST_PLANETS,
    windows: windows.sort((a, b) =>
      a.peakDate === b.peakDate
        ? a.minimumOrb - b.minimumOrb
        : a.peakDate.localeCompare(b.peakDate),
    ),
  };
}

export function calcWesternChart(params: {
  birthDate: string;
  birthTime?: string | null;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}): WesternReading {
  const timezone = params.timezone ?? "Asia/Tokyo";
  const jde = toJulianDay(params.birthDate, params.birthTime, timezone);
  const angles = calcAngles(jde, params.latitude, params.longitude);
  const ascSignIndex = angles.ascendant ? SIGNS.indexOf(angles.ascendant.sign) : undefined;
  const planets = buildPlanets(jde, ascSignIndex);
  const sun = planets.find((planet) => planet.name === "太陽");
  const moon = planets.find((planet) => planet.name === "月");

  if (!sun || !moon) throw new Error("Western chart calculation failed.");

  const sunText = SIGN_INTERPRETATION[sun.sign];

  return {
    sunSign: sun.sign,
    moonSign: moon.sign,
    ascendant: angles.ascendant,
    midheaven: angles.midheaven,
    lunarNodes: meanLunarNodes(jde),
    planets,
    aspects: calcAspects(planets),
    houseSystem: "whole-sign",
    personality: sunText.personality,
    talent: sunText.talent,
    destiny: sunText.destiny,
    loveStyle: sunText.loveStyle,
  };
}
