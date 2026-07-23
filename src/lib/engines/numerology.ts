import {
  BirthProfileInput,
  DetailedFortuneResult,
  FortuneSection,
  FortuneSignal,
  confidenceFromScore,
  parseBirthParts,
  sectionsToDomainReadings,
} from "./types";
import { dateInTimezone } from "../time/chineseCalendarTime";
import {
  buildNumerologySynthesis,
  type NumerologySynthesis,
  type NumerologyTopicSynthesis,
} from "./numerology-synthesis";

export type NumerologyNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 11 | 22 | 33;

export type NumerologyBaseChart = {
  lifePathNumber: NumerologyNumber;
  birthDayNumber: NumerologyNumber;
  attitudeNumber: NumerologyNumber;
  personalYearNumber: number;
  personalMonthNumber: number;
  personalDayNumber: number;
  monthlyCycles: Array<{
    month: number;
    number: number;
    current: boolean;
  }>;
  pinnacles: Array<{
    index: 1 | 2 | 3 | 4;
    number: NumerologyNumber;
    startAge: number;
    endAge?: number;
    current: boolean;
  }>;
  challenges: Array<{
    index: 1 | 2 | 3 | 4;
    number: number;
    startAge: number;
    endAge?: number;
    current: boolean;
  }>;
  currentAge: number;
  raw: {
    dateDigits: number[];
    birthDay: number;
    targetYear: number;
    targetMonth: number;
    targetDay: number;
    method: "modern-pythagorean-date-only";
  };
};

export type NumerologyChart = NumerologyBaseChart & {
  synthesis: NumerologySynthesis;
  interpretationScope: "weighted-domain-synthesis-v1";
};

const NUMBER_MEANING: Record<NumerologyNumber, {
  title: string;
  keywords: string[];
  strength: string;
  challenge: string;
  advice: string;
}> = {
  1: {
    title: "開拓者",
    keywords: ["自立", "決断", "突破力"],
    strength: "自分で道を切り開き、停滞した場に最初の一歩を作る力があります。",
    challenge: "一人で背負いすぎると、協力関係を狭めやすくなります。",
    advice: "主導権を持ちながら、早めに味方を巻き込むと才能が伸びます。",
  },
  2: {
    title: "調停者",
    keywords: ["共感", "協調", "観察力"],
    strength: "相手の感情や場の空気を読み、関係を整える力があります。",
    challenge: "相手を優先しすぎると、自分の望みが見えにくくなります。",
    advice: "感じ取ったことを言葉にして、自分の境界線も守りましょう。",
  },
  3: {
    title: "表現者",
    keywords: ["創造", "言語化", "明るさ"],
    strength: "考えや感情を魅力的に表現し、人の心を軽くする才能があります。",
    challenge: "興味が散ると、成果になる前に次へ移りやすいです。",
    advice: "表現の場を定期的に持つと、才能が仕事や評価につながります。",
  },
  4: {
    title: "構築者",
    keywords: ["継続", "安定", "実務力"],
    strength: "物事を現実的に組み立て、長く使える土台を作れます。",
    challenge: "慎重さが強い時は、変化への反応が遅れやすくなります。",
    advice: "計画に小さな実験枠を入れると、安定と成長を両立できます。",
  },
  5: {
    title: "変革者",
    keywords: ["自由", "適応", "情報感度"],
    strength: "変化の中でチャンスを見つけ、新しい体験から学ぶ力があります。",
    challenge: "自由を求めすぎると、継続が必要な成果を逃しやすいです。",
    advice: "自由度の高い環境で、短いサイクルの目標を置くと力を出せます。",
  },
  6: {
    title: "育成者",
    keywords: ["愛情", "責任", "美意識"],
    strength: "人や場を育て、安心できる関係と美しい秩序を作れます。",
    challenge: "責任感が強すぎると、相手の課題まで抱え込みやすいです。",
    advice: "支える範囲を決めることで、愛情が重荷ではなく才能になります。",
  },
  7: {
    title: "探究者",
    keywords: ["分析", "洞察", "専門性"],
    strength: "表面の奥にある仕組みを読み解き、深い専門性を育てられます。",
    challenge: "納得できるまで動けず、機会を逃すことがあります。",
    advice: "仮説のまま小さく試す癖を持つと、洞察が現実に活きます。",
  },
  8: {
    title: "実現者",
    keywords: ["達成", "影響力", "経営感覚"],
    strength: "目標を形にし、人・お金・資源を動かす力があります。",
    challenge: "成果への意識が強い時ほど、無理や支配に傾きやすいです。",
    advice: "成果と信頼を同時に積み上げる設計が、長期的な成功を呼びます。",
  },
  9: {
    title: "統合者",
    keywords: ["包容", "理想", "完成"],
    strength: "多様な価値観を受け止め、広い視点で物事をまとめられます。",
    challenge: "理想が大きすぎると、現実の一歩が曖昧になります。",
    advice: "理想を具体的な行動に分解すると、人を導く力になります。",
  },
  11: {
    title: "直感の伝達者",
    keywords: ["霊感", "感受性", "啓発"],
    strength: "強い直感と感受性で、人がまだ言葉にできないテーマを掴めます。",
    challenge: "刺激を受けすぎると、心身が不安定になりやすいです。",
    advice: "静かな回復時間を確保すると、直感が信頼できる判断になります。",
  },
  22: {
    title: "大きな構築者",
    keywords: ["理想の実装", "組織化", "社会性"],
    strength: "大きな理想を現実の仕組みへ落とし込む力があります。",
    challenge: "責任の規模が大きく、プレッシャーを抱え込みやすいです。",
    advice: "長期計画を小さな工程に分けるほど、器の大きさが活きます。",
  },
  33: {
    title: "奉仕の表現者",
    keywords: ["無条件の愛", "癒し", "創造的奉仕"],
    strength: "人を癒し、励まし、創造性で周囲を温める力があります。",
    challenge: "尽くしすぎると、自分の回復を後回しにしがちです。",
    advice: "自分も満たす仕組みを持つことで、奉仕が長く続きます。",
  },
};

function reduceNumber(value: number): NumerologyNumber {
  if (value === 11 || value === 22 || value === 33) return value;
  let current = value;
  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
    if (current === 11 || current === 22 || current === 33) return current;
  }
  return current as NumerologyNumber;
}

function reduceCycleNumber(value: number): number {
  let current = Math.abs(value);
  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((sum, digit) => sum + Number(digit), 0);
  }
  return current;
}

function digitsOf(value: string): number[] {
  return value.replace(/\D/g, "").split("").map(Number);
}

function section(
  theme: FortuneSection["theme"],
  title: string,
  number: NumerologyNumber,
  evidence: string,
  topic?: FortuneSection["topic"],
): FortuneSection {
  const meaning = NUMBER_MEANING[number];
  return {
    theme,
    topic,
    title,
    summary: `${number}「${meaning.title}」の性質が出ています。${meaning.strength}`,
    keywords: meaning.keywords,
    strengths: [meaning.strength],
    challenges: [meaning.challenge],
    advice: [meaning.advice],
    evidence: [evidence],
  };
}

function targetParts(
  targetDate: Date | string,
  timezone: string,
): { year: number; month: number; day: number } {
  if (typeof targetDate === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(targetDate);
    if (!match) throw new Error("Invalid targetDate. Expected YYYY-MM-DD.");
    return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  }
  return targetParts(dateInTimezone(targetDate, timezone), timezone);
}

function ageAt(
  birth: { year: number; month: number; day: number },
  target: { year: number; month: number; day: number },
): number {
  const beforeBirthday =
    target.month < birth.month || (target.month === birth.month && target.day < birth.day);
  return Math.max(0, target.year - birth.year - (beforeBirthday ? 1 : 0));
}

export function calcNumerology(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<NumerologyChart> {
  const birth = parseBirthParts(input.birthDate);
  const { year, month, day } = birth;
  const target = targetParts(targetDate, input.timezone ?? "Asia/Tokyo");
  const dateDigits = digitsOf(input.birthDate);
  const lifePathNumber = reduceNumber(dateDigits.reduce((sum, digit) => sum + digit, 0));
  const birthDayNumber = reduceNumber(day);
  const attitudeNumber = reduceNumber(month + day);
  const personalYearNumber = reduceCycleNumber(
    digitsOf(`${target.year}${String(month).padStart(2, "0")}${String(day).padStart(2, "0")}`).reduce(
      (sum, digit) => sum + digit,
      0,
    ),
  );
  const personalMonthNumber = reduceCycleNumber(personalYearNumber + target.month);
  const personalDayNumber = reduceCycleNumber(personalMonthNumber + target.day);
  const monthlyCycles = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    number: reduceCycleNumber(personalYearNumber + index + 1),
    current: target.month === index + 1,
  }));
  const reducedMonth = reduceNumber(month);
  const reducedDay = reduceNumber(day);
  const reducedYear = reduceNumber(year);
  const pinnacleNumbers: NumerologyNumber[] = [
    reduceNumber(reducedMonth + reducedDay),
    reduceNumber(reducedDay + reducedYear),
    reduceNumber(reduceNumber(reducedMonth + reducedDay) + reduceNumber(reducedDay + reducedYear)),
    reduceNumber(reducedMonth + reducedYear),
  ];
  const challengeNumbers = [
    Math.abs(reduceCycleNumber(day) - reduceCycleNumber(month)),
    Math.abs(reduceCycleNumber(day) - reduceCycleNumber(year)),
    0,
    Math.abs(reduceCycleNumber(month) - reduceCycleNumber(year)),
  ];
  challengeNumbers[2] = Math.abs(challengeNumbers[0] - challengeNumbers[1]);
  const lifePathForTiming = reduceCycleNumber(lifePathNumber);
  const firstEnd = 36 - lifePathForTiming;
  const ranges = [
    { startAge: 0, endAge: firstEnd },
    { startAge: firstEnd + 1, endAge: firstEnd + 9 },
    { startAge: firstEnd + 10, endAge: firstEnd + 18 },
    { startAge: firstEnd + 19, endAge: undefined },
  ];
  const currentAge = ageAt(birth, target);
  const pinnacles = ranges.map((range, index) => ({
    index: (index + 1) as 1 | 2 | 3 | 4,
    number: pinnacleNumbers[index],
    ...range,
    current: currentAge >= range.startAge && (range.endAge == null || currentAge <= range.endAge),
  }));
  const challenges = ranges.map((range, index) => ({
    index: (index + 1) as 1 | 2 | 3 | 4,
    number: challengeNumbers[index],
    ...range,
    current: currentAge >= range.startAge && (range.endAge == null || currentAge <= range.endAge),
  }));

  const baseChart: NumerologyBaseChart = {
    lifePathNumber,
    birthDayNumber,
    attitudeNumber,
    personalYearNumber,
    personalMonthNumber,
    personalDayNumber,
    monthlyCycles,
    pinnacles,
    challenges,
    currentAge,
    raw: {
      dateDigits,
      birthDay: day,
      targetYear: target.year,
      targetMonth: target.month,
      targetDay: target.day,
      method: "modern-pythagorean-date-only",
    },
  };
  const chart: NumerologyChart = {
    ...baseChart,
    synthesis: buildNumerologySynthesis(baseChart),
    interpretationScope: "weighted-domain-synthesis-v1",
  };

  const currentPinnacle = pinnacles.find((item) => item.current) ?? pinnacles[3];
  const currentChallenge = challenges.find((item) => item.current) ?? challenges[3];

  const foundationalSections: FortuneSection[] = [
    section("personality", "ライフパス", lifePathNumber, `生年月日の全桁合計から ${lifePathNumber} を算出`, "coreTalent"),
    section("talent", "生まれ持った才能", birthDayNumber, `誕生日 ${day} 日から ${birthDayNumber} を算出`, "hiddenPotential"),
    section("growth", "第一印象と伸ばし方", attitudeNumber, `月 ${month} + 日 ${day} から ${attitudeNumber} を算出`, "growthAdvice"),
    section("timing", `${target.year}年のテーマ`, personalYearNumber as NumerologyNumber, `${target.year}年 + 誕生月日から ${personalYearNumber} を算出`, "goodTiming"),
    section("timing", `${target.year}年${target.month}月のテーマ`, personalMonthNumber as NumerologyNumber, `個人年 ${personalYearNumber} + ${target.month}月から ${personalMonthNumber} を算出`, "overallFlow"),
    section(
      "timing",
      `${target.year}年${target.month}月${target.day}日のテーマ`,
      personalDayNumber as NumerologyNumber,
      `個人月 ${personalMonthNumber} + ${target.day}日から ${personalDayNumber} を算出`,
      "lifeTurningPoint",
    ),
    section(
      "growth",
      `第${currentPinnacle.index}ピナクル`,
      currentPinnacle.number,
      `${currentPinnacle.startAge}歳から${currentPinnacle.endAge ?? "生涯"}までの長期周期`,
      "lifeTurningPoint",
    ),
    {
      theme: "growth",
      topic: "growthAdvice",
      title: `現在のチャレンジ数 ${currentChallenge.number}`,
      summary:
        currentChallenge.number === 0
          ? "一つの課題に限定されず、状況ごとに自分でテーマを選ぶことが課題になる周期です。"
          : `${currentChallenge.number}の性質を、避ける問題ではなく繰り返し調整する学習テーマとして扱います。`,
      keywords: ["チャレンジ", String(currentChallenge.number), "長期課題"],
      strengths: ["課題を意識化すると、同じ反応を別の選択へ変えやすくなります。"],
      challenges: [`第${currentChallenge.index}チャレンジ ${currentChallenge.number}`],
      advice: ["ピナクルが示す機会と、チャレンジが示す調整点を同時に見ます。"],
      evidence: [`${currentChallenge.startAge}歳から${currentChallenge.endAge ?? "生涯"}まで`],
    },
  ];

  const fromSynthesis = (
    theme: FortuneSection["theme"],
    topic: FortuneSection["topic"],
    title: string,
    number: NumerologyNumber,
    synthesis: NumerologyTopicSynthesis,
  ): FortuneSection => ({
    ...section(theme, title, number, `複数の生年月日数と現在周期を${title}向けに合成`, topic),
    summary: synthesis.conclusion,
    strengths: [...new Set(synthesis.strengths)],
    challenges: [...new Set(synthesis.challenges)],
    advice: [...new Set(synthesis.advice)],
    evidence: [...synthesis.factors]
      .sort((left, right) => right.weight - left.weight)
      .map((item) => `${item.source} / weight ${item.weight.toFixed(2)} / ${item.interpretation}`),
  });
  const love = fromSynthesis("love", "loveStyle", "恋愛の傾向", lifePathNumber, chart.synthesis.love);
  const marriage = fromSynthesis("marriage", "marriage", "結婚と長期関係", lifePathNumber, chart.synthesis.marriage);
  const career = fromSynthesis("career", "careerStyle", "仕事の型", lifePathNumber, chart.synthesis.career);
  const money = fromSynthesis("money", "earningStyle", "稼ぎ方と金銭感覚", lifePathNumber, chart.synthesis.money);
  const talent = fromSynthesis("talent", "coreTalent", "中核の才能", lifePathNumber, chart.synthesis.talent);
  const sections: FortuneSection[] = [
    ...foundationalSections,
    love,
    marriage,
    {
      ...love,
      topic: "compatiblePartner",
      title: "相性の良い相手像",
      summary: chart.synthesis.love.compatiblePartner,
    },
    {
      ...love,
      topic: "difficultPartner",
      title: "摩擦が生じやすい相手像",
      summary: chart.synthesis.love.difficultPartner,
      strengths: [],
    },
    career,
    {
      ...career,
      topic: "careerStrengths",
      title: "仕事面の長所",
      summary: career.strengths.join(""),
      challenges: [],
    },
    {
      ...career,
      topic: "careerWeaknesses",
      title: "仕事面の注意点",
      summary: career.challenges.join(""),
      strengths: [],
    },
    {
      ...career,
      topic: "successKeys",
      title: "成功のために必要なこと",
      summary: career.advice.join(""),
    },
    money,
    {
      ...money,
      topic: "moneyRisk",
      title: "金運の注意点",
      summary: money.challenges.join(""),
      strengths: [],
    },
    {
      ...money,
      topic: "assetBuilding",
      title: "蓄積と資産形成",
      summary: money.advice.join(""),
    },
    talent,
    {
      ...talent,
      topic: "hiddenPotential",
      title: "潜在力の育て方",
      summary: `誕生日数${birthDayNumber}と現在のピナクル${currentPinnacle.number}を重ねると、${chart.synthesis.talent.conclusion}`,
    },
  ];

  const signals: FortuneSignal[] = sections.flatMap((item) => [
    ...item.strengths.map((trait) => ({
      method: "numerology" as const,
      theme: item.theme,
      trait,
      polarity: "strength" as const,
      score: 70,
      confidence: 0.88,
      evidence: item.evidence.join(" / "),
    })),
    ...item.challenges.map((trait) => ({
      method: "numerology" as const,
      theme: item.theme,
      trait,
      polarity: "challenge" as const,
      score: 62,
      confidence: 0.88,
      evidence: item.evidence.join(" / "),
    })),
  ]);

  return {
    method: "numerology",
    displayName: "数秘術",
    version: "numerology-pythagorean-synthesis-v4",
    inputRequirement: {
      birthDate: "required",
      birthTime: "unused",
      birthPlace: "unused",
    },
    confidence: confidenceFromScore(0.9, [
      "生年月日のみで基本数・ピナクル・チャレンジ・個人年・12個人月・個人日を再現可能に算出できます。",
      "時間周期は1〜9へ還元し、ピナクルでは11・22・33を保持する方式です。",
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "現代ピタゴラス式の生年月日計算に限定しています。",
      "名前数秘は姓名判断と同様に表記・流派差があるため、方針どおり採用していません。",
      "個人年は1月1日切替、時間周期ではマスターナンバーを残さない方式を採用しています。",
      "チャレンジの期間配置には異説があるため、本実装はピナクルと同じ四期間に対応させています。",
      "ライフパス、誕生日数、態度数、現在のピナクルとチャレンジ、個人年・月・日を領域別の重み付き根拠として統合しています。",
    ],
  };
}
