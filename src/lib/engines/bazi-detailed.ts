import { calcDetailedBazi, type DetailedBaziChart, type TenGod } from "../astro/bazi-detail";
import type { FiveElement } from "../astro/bazi-types";
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
  buildBaziSynthesis,
  type BaziSynthesis,
  type BaziTopicSynthesis,
} from "./bazi-synthesis";
import {
  analyzeBaziStructure,
  type BaziStructureAssessment,
} from "./bazi-structure";

type DetailedBaziEngineChart = DetailedBaziChart & {
  structure: BaziStructureAssessment;
  synthesis: BaziSynthesis;
  interpretationScope: "weighted-domain-synthesis-v1";
};

const ELEMENT_KEYWORDS: Record<FiveElement, string[]> = {
  木: ["成長", "企画", "育成"],
  火: ["表現", "情熱", "発信"],
  土: ["安定", "実務", "信頼"],
  金: ["決断", "整理", "専門性"],
  水: ["知性", "柔軟性", "洞察"],
};

const DAY_MASTER_ARCHETYPE: Record<
  DetailedBaziChart["dayMaster"],
  {
    image: string;
    personality: string;
    talent: string;
    love: string;
    career: string;
    money: string;
  }
> = {
  甲: {
    image: "大樹",
    personality: "真っ直ぐで、筋を通しながら大きく育つタイプです。",
    talent: "構想を立て、人や計画を長期的に育てる力があります。",
    love: "誠実で一途ですが、正しさが強い時は相手にも同じ姿勢を求めやすいです。",
    career: "新規事業、教育、企画、リーダー役で力を出しやすいです。",
    money: "短期利益より、育てた信用や仕組みが後から収益になる形が向きます。",
  },
  乙: {
    image: "草花",
    personality: "柔らかく環境に適応しながら、自分の美意識を守るタイプです。",
    talent: "調整力、共感力、細やかな改善で場を良くする才能があります。",
    love: "相手に寄り添う反面、遠慮が積もると本音が見えにくくなります。",
    career: "編集、デザイン、接客、伴走支援、コミュニティ運営に適性があります。",
    money: "人脈や継続的な関係から収入を伸ばしやすいです。",
  },
  丙: {
    image: "太陽",
    personality: "明るく開放的で、周囲を照らす存在感があります。",
    talent: "注目を集め、考えや魅力をわかりやすく伝える才能があります。",
    love: "好きになると勢いが出ますが、熱量の波を整えるほど長続きします。",
    career: "発信、営業、企画、エンタメ、教育など前に出る仕事が向きます。",
    money: "人気、発信力、ブランド性を収益化すると伸びやすいです。",
  },
  丁: {
    image: "灯火",
    personality: "内側に強い情熱を持ち、深く集中して本質を照らすタイプです。",
    talent: "観察力、表現力、研究心を一点に注ぐ才能があります。",
    love: "本命ほど慎重で、安心できる相手に深く尽くします。",
    career: "専門職、創作、分析、教育、相談業など深く向き合う仕事が合います。",
    money: "技能や作品の質を磨くほど、単価や評価が上がりやすいです。",
  },
  戊: {
    image: "山",
    personality: "どっしりしていて、周囲から頼られやすい安定型です。",
    talent: "守る力、まとめる力、長期運用する力があります。",
    love: "信頼を重視し、軽い関係より将来性のある関係を選びやすいです。",
    career: "管理、経営、土地、不動産、組織運営、制度作りに強みがあります。",
    money: "固定資産、積立、長期投資など堅い設計と相性が良いです。",
  },
  己: {
    image: "田畑",
    personality: "実務的で面倒見がよく、人を育てる力があります。",
    talent: "状況を整え、必要なものを現実的に用意する才能があります。",
    love: "生活感や安心感を大切にし、相手の成長を支えます。",
    career: "人材育成、医療福祉、事務、食、教育、運用改善に適性があります。",
    money: "日々の管理と小さな改善が、安定した金運につながります。",
  },
  庚: {
    image: "鋼",
    personality: "決断が速く、困難な状況で力を発揮するタイプです。",
    talent: "問題を切り分け、鍛えて強くする才能があります。",
    love: "不器用でも本気度は高く、守ると決めた相手には強い責任感を持ちます。",
    career: "技術、法律、金融、競争領域、改革、危機対応に向きます。",
    money: "専門性と判断力を武器に、成果報酬や高単価領域で伸びます。",
  },
  辛: {
    image: "宝石",
    personality: "繊細で審美眼があり、質の高さを求めるタイプです。",
    talent: "洗練、選別、精密化、美的価値を高める才能があります。",
    love: "理想が高く、尊敬できる相手や品のある関係を求めやすいです。",
    career: "美容、デザイン、編集、品質管理、ブランド、専門職で輝きます。",
    money: "高品質・高付加価値の提供で金運が伸びやすいです。",
  },
  壬: {
    image: "大海",
    personality: "自由度が高く、大きな流れを読むタイプです。",
    talent: "情報、移動、戦略、ネットワークを扱う才能があります。",
    love: "束縛より信頼を重視し、互いの世界を広げる関係が向きます。",
    career: "IT、貿易、メディア、企画、移動の多い仕事、事業開発に適性があります。",
    money: "情報差や広い人脈を活かすほど収益機会が増えます。",
  },
  癸: {
    image: "雨露",
    personality: "繊細で洞察が深く、静かに本質へ届くタイプです。",
    talent: "分析、直感、言語化、癒やし、研究の才能があります。",
    love: "相手の心をよく読む一方、不安を抱え込まない設計が大切です。",
    career: "研究、文章、心理、データ分析、企画補佐、相談業に向きます。",
    money: "知識や洞察をコンテンツ、助言、仕組みに変えると伸びます。",
  },
};

const TEN_GOD_KEYWORDS: Record<TenGod, string[]> = {
  比肩: ["自立", "競争", "自己決定"],
  劫財: ["仲間", "勝負", "資金管理"],
  食神: ["表現", "安心感", "継続"],
  傷官: ["発信", "改革", "鋭さ"],
  偏財: ["商機", "人脈", "行動量"],
  正財: ["堅実", "信用", "生活設計"],
  偏官: ["挑戦", "責任", "突破"],
  正官: ["評価", "秩序", "肩書き"],
  偏印: ["独自性", "学び直し", "企画"],
  印綬: ["知識", "保護", "資格"],
};

function pillarEvidence(chart: DetailedBaziChart): string[] {
  return [
    `年柱: ${chart.yearPillar.stem}${chart.yearPillar.branch}（${chart.yearPillar.stemTenGod ?? "日主"} / ${chart.yearPillar.twelveStage}）`,
    `月柱: ${chart.monthPillar.stem}${chart.monthPillar.branch}（${chart.monthPillar.stemTenGod ?? "日主"} / ${chart.monthPillar.twelveStage}）`,
    `日柱: ${chart.dayPillar.stem}${chart.dayPillar.branch}（日主 ${chart.dayMaster} / ${chart.dayPillar.twelveStage}）`,
    chart.timePillar
      ? `時柱: ${chart.timePillar.stem}${chart.timePillar.branch}（${chart.timePillar.stemTenGod ?? "日主"} / ${chart.timePillar.twelveStage}）`
      : "時柱: 出生時刻不明のため未算出",
    `節入り: ${chart.solarMonth.termName} ${chart.solarMonth.termDateTime}、${chart.solarMonth.solarYear}年扱い`,
    `五行: 木${chart.elementBalance.木.toFixed(1)} 火${chart.elementBalance.火.toFixed(1)} 土${chart.elementBalance.土.toFixed(1)} 金${chart.elementBalance.金.toFixed(1)} 水${chart.elementBalance.水.toFixed(1)}`,
  ];
}

function topTenGods(chart: DetailedBaziChart, count = 3): TenGod[] {
  return (Object.entries(chart.tenGodBalance) as [TenGod, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([god]) => god);
}

function dominantGodText(chart: DetailedBaziChart): string {
  return topTenGods(chart)
    .map((god) => `${god}（${TEN_GOD_KEYWORDS[god].join("・")}）`)
    .join("、");
}

function usefulElementAdvice(chart: DetailedBaziChart): string {
  if (chart.usefulElements.length === 0) return "命式の偏りは強すぎないため、時期ごとに必要な要素を選ぶ柔軟さが大切です。";
  return `用神候補は ${chart.usefulElements.join("・")}。${chart.usefulElements
    .flatMap((element) => ELEMENT_KEYWORDS[element])
    .slice(0, 4)
    .join("・")} を生活や仕事に増やすと運が整いやすいです。`;
}

function cycleSummary(chart: DetailedBaziChart): string {
  const selected = chart.luckCycles.find((cycle) => cycle.selected);
  if (selected) {
    return `${selected.direction === "forward" ? "順行" : "逆行"}で、約${selected.startAge}歳（${selected.startDateTime ?? "起運日時未確定"}）から大運が始まります。`;
  }
  const forward = chart.luckCycles.find((cycle) => cycle.direction === "forward");
  const reverse = chart.luckCycles.find((cycle) => cycle.direction === "reverse");
  if (!forward || !reverse) return "大運は性別・流派設定後に本採用します。";
  return `順行なら約${forward.startAge}歳、逆行なら約${reverse.startAge}歳から大運が始まる概算です。`;
}

function makeSignal(methodTrait: string, theme: FortuneSection["theme"], evidence: string, confidence: number): FortuneSignal {
  return {
    method: "bazi",
    theme,
    trait: methodTrait,
    polarity: "strength",
    score: 74,
    confidence,
    evidence,
  };
}

function synthesisEvidence(synthesis: BaziTopicSynthesis): string[] {
  return synthesis.factors.map(
    (factor) => `${factor.source} / 重み ${factor.weight.toFixed(2)}: ${factor.interpretation}`,
  );
}

export function calcBaziDetailed(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<DetailedBaziEngineChart> {
  const confidence = defaultConfidence(input);
  const baseChart = calcDetailedBazi(
    {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      longitude: input.longitude,
      timezone: input.timezone,
      gender: input.gender,
    },
    targetDate,
  );
  const structure = analyzeBaziStructure(baseChart);
  const chart: DetailedBaziEngineChart = {
    ...baseChart,
    structure,
    synthesis: buildBaziSynthesis(baseChart, input.gender, structure),
    interpretationScope: "weighted-domain-synthesis-v1",
  };
  const archetype = DAY_MASTER_ARCHETYPE[chart.dayMaster];
  const evidence = pillarEvidence(chart);
  const keywords = [
    archetype.image,
    chart.dayMasterStrength.level,
    ...chart.strongestElements.flatMap((element) => ELEMENT_KEYWORDS[element]).slice(0, 4),
    ...topTenGods(chart, 2),
  ];
  const elementAdvice = usefulElementAdvice(chart);
  const annual = chart.timing;
  const annualPillarText = `${annual.annualPillar.stem}${annual.annualPillar.branch}`;
  const monthlyPillarText = `${annual.monthly.pillar.stem}${annual.monthly.pillar.branch}`;
  const annualRelationsText = annual.relations.length
    ? annual.relations.map((relation) => `${relation.kind} ${relation.target}`).join("、")
    : "出生命式との強い合冲なし";
  const activeLuckText = annual.activeLuckCycle
    ? `大運 ${annual.activeLuckCycle.pillar.stem}${annual.activeLuckCycle.pillar.branch}（${annual.activeLuckCycle.startYear}〜${annual.activeLuckCycle.endYear}年・${annual.activeLuckCycle.tenGod}）`
    : "性別区分未設定のため該当大運は未確定";
  const engineConfidence = confidence.time === "unknown" ? 0.58 : chart.trueSolarTime ? 0.72 : 0.66;

  const sections: FortuneSection[] = [
    {
      theme: "personality",
      topic: "coreTalent",
      title: "命式の核",
      summary: `日主は ${chart.dayMaster}（${archetype.image}）。${archetype.personality} ${chart.dayMasterStrength.summary}`,
      keywords,
      strengths: [
        `命式で目立つ通変星は ${dominantGodText(chart)} です。`,
        `強い五行は ${chart.strongestElements.join("・")} で、${chart.strongestElements
          .flatMap((element) => ELEMENT_KEYWORDS[element])
          .slice(0, 4)
          .join("・")} が出やすいです。`,
      ],
      challenges: [
        chart.avoidElements.length
          ? `${chart.avoidElements.join("・")} に偏る時は、強みが過剰に出て判断が硬くなりやすいです。`
          : "偏りは極端ではないため、環境によって強みも弱みも出方が変わります。",
      ],
      advice: [elementAdvice],
      evidence,
    },
    {
      theme: "career",
      topic: "careerStyle",
      title: "月令格局と社会的な役割",
      summary: chart.structure.summary,
      keywords: [
        chart.structure.primary.name,
        chart.structure.primary.category,
        chart.structure.statusLabel,
      ],
      strengths: chart.structure.supports,
      challenges: chart.structure.disruptions,
      advice: chart.structure.adjustments,
      evidence: chart.structure.evidence,
    },
    {
      theme: "talent",
      topic: "hiddenPotential",
      title: "才能とポテンシャル",
      summary: chart.synthesis.talent.conclusion,
      keywords: ["才能", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 5)],
      strengths: chart.synthesis.talent.strengths,
      challenges: chart.synthesis.talent.challenges,
      advice: chart.synthesis.talent.advice,
      evidence: synthesisEvidence(chart.synthesis.talent),
    },
    {
      theme: "love",
      topic: "loveStyle",
      title: "恋愛の傾向",
      summary: chart.synthesis.love.conclusion,
      keywords: ["恋愛", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 4)],
      strengths: chart.synthesis.love.strengths,
      challenges: chart.synthesis.love.challenges,
      advice: chart.synthesis.love.advice,
      evidence: synthesisEvidence(chart.synthesis.love),
    },
    {
      theme: "love",
      topic: "compatiblePartner",
      title: "相性が良い相手",
      summary: chart.synthesis.love.compatiblePartner,
      keywords: ["相性", "補完", ...chart.usefulElements],
      strengths: [chart.synthesis.love.compatiblePartner],
      challenges: [],
      advice: ["実際の相性では、相手命式の五行と日支を重ね、補完と合冲を確認します。"],
      evidence: synthesisEvidence(chart.synthesis.love),
    },
    {
      theme: "love",
      topic: "difficultPartner",
      title: "関係が難しくなりやすい相手",
      summary: chart.synthesis.love.difficultPartner,
      keywords: ["相性", "注意", "境界線", ...chart.avoidElements],
      strengths: ["苦手な型を知ると、惹かれる相手と長期運用できる相手を分けて判断できます。"],
      challenges: chart.synthesis.love.challenges,
      advice: chart.synthesis.love.advice,
      evidence: synthesisEvidence(chart.synthesis.love),
    },
    {
      theme: "marriage",
      topic: "marriage",
      title: "結婚で安定する条件",
      summary: chart.synthesis.marriage.conclusion,
      keywords: ["結婚", "生活", "責任", chart.dayPillar.twelveStage],
      strengths: chart.synthesis.marriage.strengths,
      challenges: chart.synthesis.marriage.challenges,
      advice: chart.synthesis.marriage.advice,
      evidence: synthesisEvidence(chart.synthesis.marriage),
    },
    {
      theme: "career",
      topic: "careerStrengths",
      title: "仕事で活きる力",
      summary: chart.synthesis.career.conclusion,
      keywords: ["仕事", ...ELEMENT_KEYWORDS[chart.dominantElement], ...topTenGods(chart, 2)],
      strengths: chart.synthesis.career.strengths,
      challenges: chart.synthesis.career.challenges,
      advice: chart.synthesis.career.advice,
      evidence: synthesisEvidence(chart.synthesis.career),
    },
    {
      theme: "career",
      topic: "careerWeaknesses",
      title: "仕事面の弱点と詰まり方",
      summary: "強い通変星が長所として働く条件と、過剰になった時の摩擦を分けて読みます。",
      keywords: ["仕事", "弱点", ...topTenGods(chart, 2)],
      strengths: ["弱点を性格の欠陥ではなく、強みの過剰として調整できます。"],
      challenges: chart.synthesis.career.challenges,
      advice: chart.synthesis.career.advice,
      evidence: synthesisEvidence(chart.synthesis.career),
    },
    {
      theme: "career",
      topic: "successKeys",
      title: "成功のために必要なこと",
      summary: chart.synthesis.career.advice.join(" "),
      keywords: ["成功条件", ...chart.usefulElements, ...topTenGods(chart, 2)],
      strengths: chart.synthesis.career.strengths,
      challenges: chart.synthesis.career.challenges,
      advice: chart.synthesis.career.advice,
      evidence: synthesisEvidence(chart.synthesis.career),
    },
    {
      theme: "career",
      topic: "goodTiming",
      title: `${annual.targetDate.slice(0, 4)}年に伸ばしやすい領域`,
      summary: `流年は ${annualPillarText}（${annual.annualTenGod}）。${annual.focus}が年の中心テーマです。`,
      keywords: ["流年", annualPillarText, annual.annualTenGod, annual.annualPillar.element],
      strengths: [
        annual.annualElementRole === "useful"
          ? `${annual.annualPillar.element}は用神候補に重なり、命式の偏りを整えやすい年です。`
          : `${annual.annualTenGod}の働きを、${annual.focus}として具体的な行動へ落とし込めます。`,
        activeLuckText,
      ],
      challenges: [],
      advice: [
        `対象日の流月は ${monthlyPillarText}（${annual.monthly.tenGod}）。${annual.monthly.focus}を今月の行動へ落とし込みます。`,
        "流年だけで断定せず、大運・流月・出生命式に共通して現れるテーマを優先します。",
      ],
      evidence: [
        `対象日 ${annual.targetDate} / 流年 ${annualPillarText} / 通変星 ${annual.annualTenGod}`,
        `流月 ${monthlyPillarText} / 第${annual.monthly.monthOrdinal}節月 / 通変星 ${annual.monthly.tenGod}`,
        activeLuckText,
        annualRelationsText,
      ],
    },
    {
      theme: "career",
      topic: "badTiming",
      title: `${annual.targetDate.slice(0, 4)}年に丁寧に扱う領域`,
      summary:
        annual.relations.some((relation) => relation.kind.includes("冲"))
          ? `流年 ${annualPillarText} が出生命式へ冲を作ります。変化・移動・役割調整が強まりやすい年です。`
          : `流年 ${annualPillarText} と出生命式の強い冲は目立ちません。${annual.annualTenGod}の過剰な出方を主な注意点とします。`,
      keywords: ["流年", "注意", annual.annualTenGod, ...chart.avoidElements],
      strengths: ["悪い波は避けるだけでなく、環境整理・役割変更・学び直しのタイミングとして使えます。"],
      challenges: [
        annual.annualElementRole === "avoid"
          ? `${annual.annualPillar.element}は忌神候補に重なります。強みの過剰、疲労、判断の偏りを点検する年です。`
          : `${annual.annualTenGod}の性質を急ぎすぎると、判断や対人関係に偏りが出る可能性があります。`,
        ...annual.relations
          .filter((relation) => relation.kind.includes("冲"))
          .map((relation) => `${relation.target}: ${relation.meaning}`),
      ],
      advice: ["冲は一律の凶ではなく、止まっていた事柄を動かす作用として、準備と確認を増やして使います。"],
      evidence: [
        `対象日 ${annual.targetDate} / 流年 ${annualPillarText} / ${annualRelationsText}`,
        activeLuckText,
      ],
    },
    {
      theme: "money",
      topic: "earningStyle",
      title: "金運と稼ぎ方",
      summary: chart.synthesis.money.conclusion,
      keywords: ["金運", "収益化", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 4)],
      strengths: chart.synthesis.money.strengths,
      challenges: chart.synthesis.money.challenges,
      advice: chart.synthesis.money.advice,
      evidence: synthesisEvidence(chart.synthesis.money),
    },
    {
      theme: "money",
      topic: "moneyRisk",
      title: "金運を崩しやすいパターン",
      summary: chart.synthesis.money.challenges.join(" "),
      keywords: ["金運", "リスク", "資金管理", "共同資金"],
      strengths: ["財星、食傷、比劫を分けて見ると、稼ぐ力と失いやすい経路を区別できます。"],
      challenges: chart.synthesis.money.challenges,
      advice: chart.synthesis.money.advice,
      evidence: synthesisEvidence(chart.synthesis.money),
    },
    {
      theme: "money",
      topic: "assetBuilding",
      title: "資産を残すための型",
      summary: chart.synthesis.money.advice.join(" "),
      keywords: ["資産形成", "契約", "価格設定", ...chart.usefulElements],
      strengths: chart.synthesis.money.strengths,
      challenges: chart.synthesis.money.challenges,
      advice: chart.synthesis.money.advice,
      evidence: synthesisEvidence(chart.synthesis.money),
    },
    {
      theme: "growth",
      topic: "growthAdvice",
      title: "運を伸ばす行動",
      summary: `${chart.dayMasterStrength.level} の命式なので、まずは ${chart.usefulElements.join("・") || "得意五行"} を日常に増やすのが開運の起点です。`,
      keywords: ["成長", "開運", ...chart.usefulElements],
      strengths: ["四柱推命は、性格診断だけでなく、どの五行を補うと運が整うかまで読めます。"],
      challenges: ["用神は本来、季節・格局・大運まで見て精査するため、現段階では候補として扱います。"],
      advice: [elementAdvice, `対象年の流年 ${annualPillarText} と ${activeLuckText} を重ね、努力・守り・切り替えの優先度を決めます。`],
      evidence,
    },
  ];

  const signals: FortuneSignal[] = [
    makeSignal(`${chart.dayMaster}日主`, "personality", evidence.join(" / "), engineConfidence),
    makeSignal(chart.dayMasterStrength.level, "talent", evidence.join(" / "), engineConfidence),
    makeSignal(
      `${chart.structure.primary.name}・${chart.structure.statusLabel}`,
      "career",
      chart.structure.evidence.join(" / "),
      Math.max(0.5, engineConfidence - 0.05),
    ),
    ...topTenGods(chart).map((god) => makeSignal(god, "career", `通変星バランス: ${dominantGodText(chart)}`, engineConfidence)),
    ...chart.usefulElements.map((element) => makeSignal(`${element}が用神候補`, "growth", elementAdvice, engineConfidence)),
    makeSignal(`大運概算 ${cycleSummary(chart)}`, "timing", cycleSummary(chart), Math.max(0.45, engineConfidence - 0.15)),
  ];

  return {
    method: "bazi",
    displayName: "四柱推命",
    version: "bazi-structure-synthesis-v7",
    inputRequirement: {
      birthDate: "required",
      birthTime: "recommended",
      birthPlace: "recommended",
    },
    confidence: confidenceFromScore(engineConfidence, [
      confidence.time === "unknown" ? "出生時刻がないため時柱・晩年/子女宮的な読みは未確定です。" : "出生時刻から時柱を算出しています。",
      chart.trueSolarTime
        ? "出生地の経度と標準時子午線から簡易真太陽時補正を行っています。"
        : "対応するタイムゾーンと出生地経度が揃わないため、真太陽時補正は未適用です。",
      input.gender === "male" || input.gender === "female"
        ? "年干の陰陽と伝統上の男女区分から大運の順逆を確定し、節入りまでの分単位差から起運日時を算出しています。"
        : "性別区分が未確定のため、大運は順行・逆行の両候補を表示しています。",
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "v7では命式、月令格局、身強弱、通変星、合冲、大運、流年、流月を分野ごとに重み付けして合成します。",
      "格局は子平真詮系の月令格局法で、月支本気、透干、順用・逆用、成立条件、破格・混雑候補を分けて返します。",
      input.gender === "male" || input.gender === "female"
        ? "大運は入力された伝統上の男女区分に対応する候補を selected として返します。"
        : "大運は順行・逆行の両方を候補として返します。",
      "神煞と相性の相手命式比較は、格局・五行・日支より優先度を下げた補助層として追加します。",
    ],
  };
}
