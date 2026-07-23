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

function relationAdvice(chart: DetailedBaziChart): string {
  if (chart.relations.length === 0) return "命式内の合冲は強く出すぎず、外部環境や大運・流年で動きが出やすいタイプです。";
  return chart.relations
    .slice(0, 2)
    .map((relation) => `${relation.kind} ${relation.target}: ${relation.meaning}`)
    .join(" ");
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

export function calcBaziDetailed(
  input: BirthProfileInput,
  targetDate: Date | string = new Date(),
): DetailedFortuneResult<DetailedBaziChart> {
  const confidence = defaultConfidence(input);
  const chart = calcDetailedBazi(
    {
      birthDate: input.birthDate,
      birthTime: input.birthTime,
      longitude: input.longitude,
      timezone: input.timezone,
      gender: input.gender,
    },
    targetDate,
  );
  const archetype = DAY_MASTER_ARCHETYPE[chart.dayMaster];
  const evidence = pillarEvidence(chart);
  const keywords = [
    archetype.image,
    chart.dayMasterStrength.level,
    ...chart.strongestElements.flatMap((element) => ELEMENT_KEYWORDS[element]).slice(0, 4),
    ...topTenGods(chart, 2),
  ];
  const relationText = relationAdvice(chart);
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
      theme: "talent",
      topic: "hiddenPotential",
      title: "才能とポテンシャル",
      summary: archetype.talent,
      keywords: ["才能", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 5)],
      strengths: [
        `${chart.dayMasterStrength.level}のため、才能の出し方は「${chart.dayMasterStrength.level === "身弱" ? "支援と環境を選ぶ" : chart.dayMasterStrength.level === "身強" ? "自分から場を動かす" : "状況に合わせて切り替える"}」形が合います。`,
        relationText,
      ],
      challenges: [
        chart.missingElements.length
          ? `不足しやすい五行は ${chart.missingElements.join("・")}。ここは人・習慣・環境で補うと伸びます。`
          : "五行の欠落は目立たないため、得意分野を意図的に尖らせることが重要です。",
      ],
      advice: [
        "才能は一つに決め打ちするより、日主の性質、通変星、五行の偏りを組み合わせて職能化すると強くなります。",
      ],
      evidence,
    },
    {
      theme: "love",
      topic: "loveStyle",
      title: "恋愛の傾向",
      summary: archetype.love,
      keywords: ["恋愛", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 4)],
      strengths: [
        chart.tenGodBalance.正財 + chart.tenGodBalance.正官 > chart.tenGodBalance.偏財 + chart.tenGodBalance.偏官
          ? "安定・誠実・責任感を重視しやすく、長期関係に向きます。"
          : "刺激・行動量・変化から恋が動きやすく、出会いの幅を広げるほど縁が増えます。",
        relationText,
      ],
      challenges: [
        chart.dayMasterStrength.level === "身強"
          ? "自分のペースが強く出る時は、相手の事情を待つ余白が関係を守ります。"
          : "相手に合わせすぎる時は、境界線と言葉での確認が必要です。",
      ],
      advice: [
        "相性は相手の命式で足りない五行を補えるか、日支同士が合・冲・害でどう動くかを見ると精度が上がります。",
      ],
      evidence,
    },
    {
      theme: "marriage",
      topic: "marriage",
      title: "結婚で安定する条件",
      summary: `日支 ${chart.dayPillar.branch} と日主 ${chart.dayMaster} から、自然体でいられる生活設計が結婚運の土台になります。`,
      keywords: ["結婚", "生活", "責任", chart.dayPillar.twelveStage],
      strengths: [
        `日柱の十二運は ${chart.dayPillar.twelveStage}。関係の成熟には、この段階の性質が出ます。`,
        chart.timePillar ? "時柱があるため、将来像や家庭運の読みを追加できます。" : "出生時刻を入れると、将来像や家庭運の読みが深まります。",
      ],
      challenges: [
        "結婚時期は、大運と流年に財星・官星が重なるか、日支へ合冲が生じるかを複合して判断します。",
      ],
      advice: [
        "相手選びでは、恋の勢いだけでなく、お金・仕事・家族観を早めに確認すると命式の弱点を補いやすいです。",
      ],
      evidence,
    },
    {
      theme: "career",
      topic: "careerStrengths",
      title: "仕事で活きる力",
      summary: archetype.career,
      keywords: ["仕事", ...ELEMENT_KEYWORDS[chart.dominantElement], ...topTenGods(chart, 2)],
      strengths: [
        `${dominantGodText(chart)} が仕事の出方を決める重要サインです。`,
        chart.dayMasterStrength.level === "身強"
          ? "裁量が大きい環境、責任を持って動ける環境で伸びやすいです。"
          : chart.dayMasterStrength.level === "身弱"
            ? "上司・制度・専門知識など支えがある環境で実力が安定します。"
            : "専門性と協調性のバランスを取れる環境で伸びやすいです。",
      ],
      challenges: [
        chart.tenGodBalance.傷官 > 1.5 ? "傷官が目立つため、正しさを出すほど目上や組織との摩擦に注意です。" : "成果を急ぐより、命式の得意な勝ち筋を繰り返す方が安定します。",
      ],
      advice: [
        elementAdvice,
        `${cycleSummary(chart)} 対象年は ${annualPillarText}（${annual.annualTenGod}）で、${annual.focus}が中心テーマです。`,
      ],
      evidence,
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
      summary: archetype.money,
      keywords: ["金運", "収益化", ...topTenGods(chart).flatMap((god) => TEN_GOD_KEYWORDS[god]).slice(0, 4)],
      strengths: [
        chart.tenGodBalance.偏財 + chart.tenGodBalance.正財 > 1
          ? "財星が命式に出ているため、お金・商売・現実成果への意識を形にしやすいです。"
          : "財星が強すぎないため、直接のお金より先に技能・信用・発信を育てる方が金運につながります。",
        `強い五行 ${chart.strongestElements.join("・")} を商品価値に変えることが収益化の近道です。`,
      ],
      challenges: [
        chart.tenGodBalance.劫財 > 1
          ? "劫財が目立つ時は、仲間・交際費・勝負勘でお金が動きやすいため上限管理が必要です。"
          : "収入源を一つに固定しすぎず、得意領域の横展開を作ると安定します。",
      ],
      advice: ["金運の良い時期は、財星が巡る年と用神候補の五行が巡る年を重ねて判断します。"],
      evidence,
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
    ...topTenGods(chart).map((god) => makeSignal(god, "career", `通変星バランス: ${dominantGodText(chart)}`, engineConfidence)),
    ...chart.usefulElements.map((element) => makeSignal(`${element}が用神候補`, "growth", elementAdvice, engineConfidence)),
    makeSignal(`大運概算 ${cycleSummary(chart)}`, "timing", cycleSummary(chart), Math.max(0.45, engineConfidence - 0.15)),
  ];

  return {
    method: "bazi",
    displayName: "四柱推命",
    version: "bazi-detailed-v5",
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
      "v5では正確な節入り時刻、蔵干、通変星、十二運、五行強弱、合冲、用神候補、大運、流年、12流月を返します。",
      input.gender === "male" || input.gender === "female"
        ? "大運は入力された伝統上の男女区分に対応する候補を selected として返します。"
        : "大運は順行・逆行の両方を候補として返します。",
      "次段階で格局判定、神煞、相性の相手命式比較を追加します。",
    ],
  };
}
