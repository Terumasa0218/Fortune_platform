import {
  calcWesternChart,
  calcWesternTransitForecast,
  calcWesternTransitSnapshot,
} from "../astro/western";
import type {
  Planet,
  PlanetName,
  LunarNodePoint,
  TransitAspect,
  TransitWindow,
  WesternReading,
  WesternTransitForecast,
  WesternTransitSnapshot,
  ZodiacSign,
} from "../astro/western-types";
import {
  BirthProfileInput,
  DetailedFortuneResult,
  FortuneSection,
  FortuneSignal,
  confidenceFromScore,
  defaultConfidence,
  sectionsToDomainReadings,
} from "./types";
import {
  buildWesternSynthesis,
  type WesternSynthesis,
  type WesternTopicSynthesis,
} from "./western-synthesis";

type WesternDetailedChart = Omit<WesternReading, "lunarNodes"> & {
  calculationScope: "natal-synthesis-and-forecast-v6";
  lunarNodes: [LunarNodePoint, LunarNodePoint];
  timing: WesternTransitSnapshot;
  forecast: WesternTransitForecast;
  synthesis: WesternSynthesis;
  missingForFullChart: string[];
};

const SIGN_KEYWORDS: Record<ZodiacSign, string[]> = {
  おひつじ: ["行動力", "突破力", "直感"],
  おうし: ["安定", "美意識", "継続"],
  ふたご: ["言語化", "好奇心", "情報"],
  かに: ["共感", "保護", "居場所"],
  しし: ["表現", "誇り", "創造"],
  おとめ: ["分析", "改善", "実務"],
  てんびん: ["調和", "美", "対話"],
  さそり: ["集中", "洞察", "変容"],
  いて: ["探求", "自由", "学び"],
  やぎ: ["責任", "構築", "達成"],
  みずがめ: ["独創性", "未来", "改革"],
  うお: ["感受性", "想像力", "癒し"],
};

function planet(chart: WesternDetailedChart, name: PlanetName): Planet {
  const found = chart.planets.find((item) => item.name === name);
  if (!found) throw new Error(`${name} is missing from western chart.`);
  return found;
}

function planetText(item: Planet): string {
  const retrograde = item.retrograde ? " 逆行" : "";
  const house = item.house ? ` / ${item.house}ハウス` : "";
  return `${item.name}: ${item.sign}座${item.degree}度${house}${retrograde}`;
}

function aspectEvidence(chart: WesternDetailedChart): string[] {
  if (chart.aspects.length === 0) return ["主要アスペクト: タイトな主要アスペクトは少なめ"];
  return chart.aspects
    .slice(0, 5)
    .map((aspect) => `${aspect.from}-${aspect.to} ${aspect.aspect}（orb ${aspect.orb}度）`);
}

function baseEvidence(chart: WesternDetailedChart): string[] {
  return [
    planetText(planet(chart, "太陽")),
    planetText(planet(chart, "月")),
    planetText(planet(chart, "水星")),
    planetText(planet(chart, "金星")),
    planetText(planet(chart, "火星")),
    planetText(planet(chart, "木星")),
    planetText(planet(chart, "土星")),
    chart.ascendant ? `ASC: ${chart.ascendant.sign}座${chart.ascendant.degree}度` : "ASC: 出生地または出生時刻不足のため未算出",
    chart.midheaven ? `MC: ${chart.midheaven.sign}座${chart.midheaven.degree}度` : "MC: 出生地または出生時刻不足のため未算出",
    `${chart.lunarNodes[0].name}: ${chart.lunarNodes[0].sign}座${chart.lunarNodes[0].degree}度（平均交点）`,
    `${chart.lunarNodes[1].name}: ${chart.lunarNodes[1].sign}座${chart.lunarNodes[1].degree}度（平均交点）`,
    ...aspectEvidence(chart),
  ];
}

function keywordsFrom(...signs: ZodiacSign[]): string[] {
  return Array.from(new Set(signs.flatMap((sign) => SIGN_KEYWORDS[sign]))).slice(0, 6);
}

function section(params: {
  theme: FortuneSection["theme"];
  topic?: FortuneSection["topic"];
  title: string;
  summary: string;
  keywords: string[];
  strengths: string[];
  challenges: string[];
  advice: string[];
  evidence: string[];
}): FortuneSection {
  return params;
}

function transitText(aspect: TransitAspect): string {
  return `トランジット${aspect.transit} - ネイタル${aspect.natal} ${aspect.aspect}（orb ${aspect.orb}度${aspect.applying ? "・接近中" : "・分離中"}）`;
}

function transitWindowText(window: TransitWindow): string {
  return `${window.startDate}〜${window.endDate}（ピーク ${window.peakDate}） トランジット${window.transit} - ネイタル${window.natal} ${window.aspect}（最小orb ${window.minimumOrb}度）`;
}

function synthesisEvidence(synthesis: WesternTopicSynthesis): string[] {
  return synthesis.factors.map(
    (factor) => `${factor.source} / 重み ${factor.weight.toFixed(2)}: ${factor.interpretation}`,
  );
}

export function calcWesternDetailed(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<WesternDetailedChart> {
  const confidence = defaultConfidence(input);
  const base = calcWesternChart({
    birthDate: input.birthDate,
    birthTime: input.birthTime ?? undefined,
    latitude: input.latitude,
    longitude: input.longitude,
    timezone: input.timezone,
  });

  const timing = calcWesternTransitSnapshot({
    natalPlanets: base.planets,
    targetDate,
    timezone: input.timezone,
  });
  const forecast = calcWesternTransitForecast({
    natalPlanets: base.planets,
    startDate: targetDate,
    timezone: input.timezone,
  });
  if (!base.lunarNodes) throw new Error("Lunar node calculation failed.");
  const synthesis = buildWesternSynthesis({
    planets: base.planets,
    aspects: base.aspects,
    ascendant: base.ascendant,
    midheaven: base.midheaven,
    lunarNodes: base.lunarNodes,
  });
  const chart: WesternDetailedChart = {
    ...base,
    calculationScope: "natal-synthesis-and-forecast-v6",
    lunarNodes: base.lunarNodes,
    timing,
    forecast,
    synthesis,
    missingForFullChart: ["Placidus等の別ハウス方式", "プログレス", "シナストリー"],
  };
  const sun = planet(chart, "太陽");
  const moon = planet(chart, "月");
  const mercury = planet(chart, "水星");
  const venus = planet(chart, "金星");
  const mars = planet(chart, "火星");
  const jupiter = planet(chart, "木星");
  const saturn = planet(chart, "土星");
  const evidence = baseEvidence(chart);
  const supportiveTransits = timing.aspects.filter((aspect) => aspect.tone === "supportive").slice(0, 6);
  const challengingTransits = timing.aspects.filter((aspect) => aspect.tone === "challenging").slice(0, 6);
  const supportiveWindows = forecast.windows.filter((window) => window.tone === "supportive").slice(0, 6);
  const challengingWindows = forecast.windows.filter((window) => window.tone === "challenging").slice(0, 6);
  const chartConfidence = confidence.time === "unknown" || confidence.place === "unknown" ? 0.58 : 0.76;

  const sections: FortuneSection[] = [
    section({
      theme: "personality",
      topic: "coreTalent",
      title: "ネイタルの核",
      summary: `太陽は${sun.sign}座、月は${moon.sign}座。外に出す自己像と内側の安心感を両方見ることで、性格の出方が立体的になります。`,
      keywords: keywordsFrom(sun.sign, moon.sign, chart.ascendant?.sign ?? sun.sign),
      strengths: [
        `${sun.sign}座の太陽は、${SIGN_KEYWORDS[sun.sign].join("・")}を人生の中心に置きやすいです。`,
        `${moon.sign}座の月は、安心感や無意識の反応に${SIGN_KEYWORDS[moon.sign].join("・")}を求めます。`,
      ],
      challenges: [
        sun.sign === moon.sign
          ? "太陽と月が同じ星座なので方向性はまとまりやすい一方、同じ癖が強調されます。"
          : "太陽と月の星座が違うため、外向きの目標と内側の安心条件を分けて扱う必要があります。",
      ],
      advice: [
        chart.ascendant
          ? `ASCは${chart.ascendant.sign}座。第一印象や行動の入口には${SIGN_KEYWORDS[chart.ascendant.sign].join("・")}が出ます。`
          : "出生地と出生時刻を入れると、ASCから第一印象・行動様式まで読めます。",
      ],
      evidence,
    }),
    section({
      theme: "talent",
      topic: "hiddenPotential",
      title: "才能とポテンシャル",
      summary: synthesis.talent.conclusion,
      keywords: keywordsFrom(mercury.sign, jupiter.sign, chart.midheaven?.sign ?? sun.sign),
      strengths: synthesis.talent.strengths,
      challenges: synthesis.talent.challenges,
      advice: synthesis.talent.advice,
      evidence: synthesisEvidence(synthesis.talent),
    }),
    section({
      theme: "love",
      topic: "loveStyle",
      title: "恋愛傾向",
      summary: synthesis.love.conclusion,
      keywords: keywordsFrom(venus.sign, mars.sign),
      strengths: synthesis.love.strengths,
      challenges: synthesis.love.challenges,
      advice: synthesis.love.advice,
      evidence: synthesisEvidence(synthesis.love),
    }),
    section({
      theme: "love",
      topic: "compatiblePartner",
      title: "相性が良い相手",
      summary: synthesis.love.compatiblePartner,
      keywords: ["相性", "安心", "長期関係", ...keywordsFrom(moon.sign).slice(0, 3)],
      strengths: [synthesis.love.compatiblePartner],
      challenges: [],
      advice: ["言葉の印象だけでなく、忙しい時の態度、約束の守り方、自由時間の扱いを観察しましょう。"],
      evidence: synthesisEvidence(synthesis.love),
    }),
    section({
      theme: "love",
      topic: "difficultPartner",
      title: "関係が難しくなりやすい相手",
      summary: synthesis.love.difficultPartner,
      keywords: ["相性", "注意", "境界線", "期待調整"],
      strengths: ["苦手な型を先に把握すると、惹かれることと長期相性を分けて判断できます。"],
      challenges: synthesis.love.challenges,
      advice: synthesis.love.advice,
      evidence: synthesisEvidence(synthesis.love),
    }),
    section({
      theme: "marriage",
      topic: "marriage",
      title: "結婚・長期関係",
      summary: synthesis.marriage.conclusion,
      keywords: ["結婚", "安心", "責任", ...keywordsFrom(moon.sign, saturn.sign).slice(0, 3)],
      strengths: synthesis.marriage.strengths,
      challenges: synthesis.marriage.challenges,
      advice: synthesis.marriage.advice,
      evidence: synthesisEvidence(synthesis.marriage),
    }),
    section({
      theme: "career",
      topic: "careerStrengths",
      title: "仕事面の長所",
      summary: synthesis.career.conclusion,
      keywords: keywordsFrom(sun.sign, mercury.sign, jupiter.sign, saturn.sign),
      strengths: synthesis.career.strengths,
      challenges: synthesis.career.challenges,
      advice: synthesis.career.advice,
      evidence: synthesisEvidence(synthesis.career),
    }),
    section({
      theme: "career",
      topic: "careerWeaknesses",
      title: "仕事面の弱点と詰まり方",
      summary: synthesis.career.challenges.length
        ? "仕事上の弱点は能力不足ではなく、強い性質同士を同時に扱う時の摩擦として現れます。"
        : "強い緊張配置は少なめですが、得意な方法への固定化には注意が必要です。",
      keywords: ["仕事", "弱点", "調整", "再現性"],
      strengths: ["摩擦の原因を構造として捉えると、訓練項目へ変えられます。"],
      challenges: synthesis.career.challenges,
      advice: synthesis.career.advice,
      evidence: synthesisEvidence(synthesis.career),
    }),
    section({
      theme: "career",
      topic: "successKeys",
      title: "成功のために必要なこと",
      summary: synthesis.career.advice.join(" "),
      keywords: ["成功条件", "専門性", "成果物", "継続"],
      strengths: synthesis.career.strengths.slice(0, 4),
      challenges: synthesis.career.challenges,
      advice: synthesis.career.advice,
      evidence: synthesisEvidence(synthesis.career),
    }),
    section({
      theme: "money",
      topic: "earningStyle",
      title: "金運の作り方",
      summary: synthesis.money.conclusion,
      keywords: ["金運", "価値", "収益化", ...keywordsFrom(venus.sign, jupiter.sign).slice(0, 3)],
      strengths: synthesis.money.strengths,
      challenges: synthesis.money.challenges,
      advice: synthesis.money.advice,
      evidence: synthesisEvidence(synthesis.money),
    }),
    section({
      theme: "money",
      topic: "moneyRisk",
      title: "金運を崩しやすいパターン",
      summary: synthesis.money.challenges.join(" "),
      keywords: ["金運", "リスク", "契約", "支出管理"],
      strengths: ["収益力と管理力を分けて評価すると、お金の弱点を具体的に直せます。"],
      challenges: synthesis.money.challenges,
      advice: synthesis.money.advice,
      evidence: synthesisEvidence(synthesis.money),
    }),
    section({
      theme: "money",
      topic: "assetBuilding",
      title: "資産を残すための型",
      summary: synthesis.money.advice.join(" "),
      keywords: ["資産形成", "固定費", "予算", "長期管理"],
      strengths: synthesis.money.strengths.slice(0, 4),
      challenges: synthesis.money.challenges,
      advice: synthesis.money.advice,
      evidence: synthesisEvidence(synthesis.money),
    }),
    section({
      theme: "timing",
      topic: "goodTiming",
      title: `${timing.targetDate}の追い風`,
      summary: supportiveTransits.length || supportiveWindows.length
        ? "対象日のアスペクトと今後約1年の長期天体を走査し、動かしやすいテーマとピークを抽出しています。"
        : "3度以内の強い追い風アスペクトは少なめです。無理に拡大せず、出生図の得意分野を整える日に向きます。",
      keywords: ["時期", "トランジット", "木星", "土星"],
      strengths: [
        ...supportiveTransits.map(transitText),
        ...supportiveWindows.map(transitWindowText),
      ],
      challenges: [],
      advice: ["短期天体は日単位、木星以遠は月単位の流れとして重みを分けて使います。"],
      evidence: [
        ...supportiveTransits.map(transitText),
        ...supportiveWindows.map(transitWindowText),
      ],
    }),
    section({
      theme: "timing",
      topic: "badTiming",
      title: `${timing.targetDate}の注意波`,
      summary: challengingTransits.length || challengingWindows.length
        ? "対象日の緊張アスペクトと今後約1年の長期波から、負荷や再調整が出やすいテーマとピークを抽出しています。"
        : "3度以内の強い緊張アスペクトは少なめです。通常の確認を保てば、過度に警戒する必要はありません。",
      keywords: ["注意期", "再調整", "土星", "火星"],
      strengths: ["緊張アスペクトは、弱点の発見・訓練・方向修正にも使えます。"],
      challenges: [
        ...challengingTransits.map(transitText),
        ...challengingWindows.map(transitWindowText),
      ],
      advice: ["一つのトランジットだけで吉凶を断定せず、出生図のハウスと複数天体の重なりを確認します。"],
      evidence: [
        ...challengingTransits.map(transitText),
        ...challengingWindows.map(transitWindowText),
      ],
    }),
  ];

  const signals: FortuneSignal[] = [
    ...chart.planets.map((item) => ({
      method: "western" as const,
      theme: item.name === "金星" || item.name === "火星" ? ("love" as const) : item.name === "木星" || item.name === "土星" ? ("career" as const) : ("talent" as const),
      trait: `${item.name}${item.sign}座`,
      polarity: "strength" as const,
      score: 70,
      confidence: chartConfidence,
      evidence: planetText(item),
    })),
    ...chart.aspects.slice(0, 6).map((aspect) => ({
      method: "western" as const,
      theme: "growth" as const,
      trait: `${aspect.from}-${aspect.to} ${aspect.aspect}`,
      polarity: "neutral" as const,
      score: 62,
      confidence: chartConfidence,
      evidence: `${aspect.from}-${aspect.to} ${aspect.aspect} orb ${aspect.orb}度`,
    })),
    ...chart.timing.aspects.slice(0, 8).map((aspect) => ({
      method: "western" as const,
      theme: "timing" as const,
      trait: `${aspect.transit}-${aspect.natal} ${aspect.aspect}`,
      polarity: aspect.tone === "supportive" ? ("strength" as const) : aspect.tone === "challenging" ? ("challenge" as const) : ("neutral" as const),
      score: Math.max(50, Math.round(80 - aspect.orb * 8)),
      confidence: chartConfidence,
      evidence: transitText(aspect),
    })),
  ];

  return {
    method: "western",
    displayName: "西洋占星術",
    version: "western-natal-synthesis-v6",
    inputRequirement: {
      birthDate: "required",
      birthTime: "recommended",
      birthPlace: "recommended",
    },
    confidence: confidenceFromScore(chartConfidence, [
      "主要10天体と平均月交点によるドラゴンヘッド／テイルを計算しています。",
      chart.ascendant ? "出生地と出生時刻からASC/MCとホールサインハウスを算出しています。" : "ASC/MCには出生時刻と出生地が必要です。",
      `対象日 ${timing.targetDate} のトランジットを出生天体へ重ねています。`,
      `${forecast.startDate}から${forecast.endDate}まで、木星以遠を7日刻みで走査しています。`,
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "v6では主要配置を分野ごとに重み付けし、強み、緊張、発動条件、対策を合成して返します。",
      "ハウスは採用方式としてホールサインを使います。Placidusは精度差ではなく別方式として、将来切り替え可能にします。",
      "対象日のトランジットに加え、木星・土星・天王星・海王星・冥王星を約1年走査し、波の開始・ピーク・終了を返します。",
      "長期波は7日刻みのため、表示する開始日・終了日は最大約1週間の幅を持ちます。",
    ],
  };
}
