import type {
  AnglePoint,
  Aspect,
  LunarNodePoint,
  Planet,
  PlanetName,
  ZodiacSign,
} from "../astro/western-types";

export type WesternSynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  interpretation: string;
};

export type WesternTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: WesternSynthesisFactor[];
};

export type WesternSynthesis = {
  love: WesternTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: WesternTopicSynthesis;
  career: WesternTopicSynthesis;
  money: WesternTopicSynthesis;
  talent: WesternTopicSynthesis;
};

type SynthesisInput = {
  planets: Planet[];
  aspects: Aspect[];
  ascendant?: AnglePoint;
  midheaven?: AnglePoint;
  lunarNodes: [LunarNodePoint, LunarNodePoint];
};

const SIGNS: ZodiacSign[] = [
  "おひつじ", "おうし", "ふたご", "かに", "しし", "おとめ",
  "てんびん", "さそり", "いて", "やぎ", "みずがめ", "うお",
];

const SIGN_QUALITY: Record<ZodiacSign, string> = {
  おひつじ: "率直さと行動の速さ",
  おうし: "安定感と五感の確かさ",
  ふたご: "会話と情報交換",
  かに: "安心感と身近な人への配慮",
  しし: "誇りと創造的な自己表現",
  おとめ: "分析と具体的な改善",
  てんびん: "対話と公平な関係",
  さそり: "深い信頼と集中力",
  いて: "自由と視野の広がり",
  やぎ: "責任感と長期的な構築",
  みずがめ: "独立性と新しい発想",
  うお: "共感と想像力",
};

const VENUS_STYLE: Record<ZodiacSign, { entry: string; need: string; risk: string }> = {
  おひつじ: { entry: "直感的に惹かれ、自分から関係を動かす", need: "率直な反応と新鮮さ", risk: "結論を急いで相手の歩幅を置き去りにする" },
  おうし: { entry: "時間をかけて信頼と心地よさを確かめる", need: "安定した愛情と身体感覚の相性", risk: "変化を避けて関係を固定しすぎる" },
  ふたご: { entry: "会話と知的な刺激から惹かれる", need: "話題の広がりと軽やかな交流", risk: "気持ちを考えすぎて深さへ入るのが遅れる" },
  かに: { entry: "親しさと安心感が育つほど惹かれる", need: "感情的な安全と居場所", risk: "不安から相手の反応を確かめすぎる" },
  しし: { entry: "尊敬と華やかな魅力に惹かれる", need: "愛情表現と互いへの誇り", risk: "承認不足を愛情不足と受け取りやすい" },
  おとめ: { entry: "誠実さや細かな気遣いを見て惹かれる", need: "信頼できる生活運用", risk: "欠点を確認しすぎて恋の余白を失う" },
  てんびん: { entry: "品のよさと対話の相性から惹かれる", need: "対等で調和したパートナーシップ", risk: "衝突を避けて本音を後回しにする" },
  さそり: { entry: "表面的でない強い結びつきに惹かれる", need: "排他的な信頼と感情の深さ", risk: "疑いと執着で関係を閉じる" },
  いて: { entry: "新しい世界を見せる相手に惹かれる", need: "自由と成長を共有できる関係", risk: "重さを感じると説明前に距離を取る" },
  やぎ: { entry: "実績と責任感を確認して惹かれる", need: "将来性と継続できる約束", risk: "恋愛を評価や条件だけで管理する" },
  みずがめ: { entry: "友人としての理解や独自性に惹かれる", need: "自由と精神的な対等さ", risk: "感情を客観視しすぎて距離が生まれる" },
  うお: { entry: "雰囲気と共感から境界を越えて惹かれる", need: "優しさと想像力を共有すること", risk: "理想化して確認すべき現実を見落とす" },
};

const PLANET_FUNCTION: Record<PlanetName, string> = {
  太陽: "自己表現", 月: "安心感", 水星: "思考と言葉", 金星: "愛情と価値観", 火星: "行動と欲求",
  木星: "拡大と機会", 土星: "責任と制約", 天王星: "独立と刷新", 海王星: "理想と想像", 冥王星: "集中と変容",
};

function getPlanet(input: SynthesisInput, name: PlanetName): Planet {
  const found = input.planets.find((item) => item.name === name);
  if (!found) throw new Error(`Missing western planet for synthesis: ${name}`);
  return found;
}

function oppositeSign(sign: ZodiacSign): ZodiacSign {
  return SIGNS[(SIGNS.indexOf(sign) + 6) % 12];
}

function signForHouse(ascendant: ZodiacSign | undefined, house: number): ZodiacSign | undefined {
  if (!ascendant) return undefined;
  return SIGNS[(SIGNS.indexOf(ascendant) + house - 1) % 12];
}

function aspectBetween(input: SynthesisInput, a: PlanetName, b: PlanetName): Aspect | undefined {
  return input.aspects.find(
    (item) => (item.from === a && item.to === b) || (item.from === b && item.to === a),
  );
}

function aspectSource(aspect: Aspect): string {
  return `${aspect.from}-${aspect.to} ${aspect.aspect}（orb ${aspect.orb}度）`;
}

function aspectWeight(aspect: Aspect): number {
  return Number(Math.max(0.45, 1 - aspect.orb / 10).toFixed(2));
}

function aspectFactor(
  code: string,
  aspect: Aspect,
  polarity: WesternSynthesisFactor["polarity"],
  interpretation: string,
): WesternSynthesisFactor {
  return { code, source: aspectSource(aspect), weight: aspectWeight(aspect), polarity, interpretation };
}

function placementFactor(
  code: string,
  source: string,
  weight: number,
  interpretation: string,
  polarity: WesternSynthesisFactor["polarity"] = "neutral",
): WesternSynthesisFactor {
  return { code, source, weight, polarity, interpretation };
}

function genericAspectFactor(aspect: Aspect): WesternSynthesisFactor {
  const hard = aspect.aspect === "スクエア" || aspect.aspect === "オポジション";
  const conjunction = aspect.aspect === "合";
  const from = PLANET_FUNCTION[aspect.from];
  const to = PLANET_FUNCTION[aspect.to];
  const interpretation = hard
    ? `${from}と${to}が緊張し、両方を満たすための調整が才能を鍛えます。`
    : conjunction
      ? `${from}と${to}が強く混ざり、一方を使うともう一方も同時に動きます。`
      : `${from}と${to}が協力し、意識的に使うほど安定した強みになります。`;
  return aspectFactor(
    `${aspect.from}-${aspect.to}-${aspect.aspect}`,
    aspect,
    hard ? "challenge" : "strength",
    interpretation,
  );
}

function loveAspectFactors(input: SynthesisInput): WesternSynthesisFactor[] {
  const factors: WesternSynthesisFactor[] = [];
  const venusSaturn = aspectBetween(input, "金星", "土星");
  if (venusSaturn) {
    const hard = venusSaturn.aspect === "スクエア" || venusSaturn.aspect === "オポジション";
    factors.push(aspectFactor(
      hard ? "venus-saturn-hard" : "venus-saturn-supportive",
      venusSaturn,
      hard ? "challenge" : "strength",
      hard
        ? "好きになる勢いがあっても、本命ほど拒絶や失敗を警戒し、関係が進むほど慎重さと責任感が強まります。"
        : "愛情と責任を結び付け、時間をかけて信頼を育てる力があります。",
    ));
  }
  const venusNeptune = aspectBetween(input, "金星", "海王星");
  if (venusNeptune) {
    const hard = venusNeptune.aspect === "スクエア" || venusNeptune.aspect === "オポジション";
    factors.push(aspectFactor(
      hard ? "venus-neptune-hard" : "venus-neptune-soft",
      venusNeptune,
      hard ? "challenge" : "strength",
      hard
        ? "恋愛で相手や未来を理想化しやすく、曖昧な約束を事実として扱わない確認が必要です。"
        : "ロマン、共感、想像力が愛情表現を豊かにしますが、好意的な想像と確認できた事実は分ける必要があります。",
    ));
  }
  const moonSaturn = aspectBetween(input, "月", "土星");
  if (moonSaturn) factors.push(genericAspectFactor(moonSaturn));
  const marsNeptune = aspectBetween(input, "火星", "海王星");
  if (marsNeptune) {
    const hard = marsNeptune.aspect === "スクエア" || marsNeptune.aspect === "オポジション";
    factors.push(aspectFactor(
      hard ? "mars-neptune-hard" : "mars-neptune-soft",
      marsNeptune,
      hard ? "challenge" : "strength",
      hard
        ? "欲求や行動の方向が曖昧になると、期待の読み違いが起きやすいため、関係の前提を言葉にする必要があります。"
        : "直感と行動が協力し、言葉だけでは届かない気遣いや創造的な愛情表現ができます。",
    ));
  }
  return factors;
}

function buildLove(input: SynthesisInput): WesternSynthesis["love"] {
  const venus = getPlanet(input, "金星");
  const mars = getPlanet(input, "火星");
  const moon = getPlanet(input, "月");
  const style = VENUS_STYLE[venus.sign];
  const descendant = input.ascendant ? oppositeSign(input.ascendant.sign) : undefined;
  const factors: WesternSynthesisFactor[] = [
    placementFactor("venus-sign", `金星 ${venus.sign}座`, 0.95, `恋の入り口は、${style.entry}形です。`, "strength"),
    placementFactor("mars-sign", `火星 ${mars.sign}座`, 0.78, `関係を動かす時は、${SIGN_QUALITY[mars.sign]}を行動に使います。`, "strength"),
    placementFactor("moon-sign", `月 ${moon.sign}座`, 0.9, `親密になるほど、${SIGN_QUALITY[moon.sign]}が安心条件になります。`, "neutral"),
    ...(descendant
      ? [placementFactor("descendant-sign", `7室 ${descendant}座（ホールサイン）`, 0.86, `長期関係では、${SIGN_QUALITY[descendant]}を持つ相手や関係運用を求めます。`, "neutral")]
      : []),
    ...loveAspectFactors(input),
  ];
  const aspectStrengths = factors.filter((factor) => factor.polarity === "strength" && factor.code.includes("-")).map((factor) => factor.interpretation);
  const challenges = [style.risk, ...factors.filter((factor) => factor.polarity === "challenge").map((factor) => factor.interpretation)];
  const saturnTension = factors.some((factor) => factor.code === "venus-saturn-hard");
  return {
    conclusion: `恋の入り口は${style.entry}一方、親密になるほど${SIGN_QUALITY[moon.sign]}を求めます。${saturnTension ? "そのため、惹かれる速さと、交際後の慎重さが同居します。" : "好みと安心条件を両方満たせる関係ほど長続きします。"}`,
    strengths: [`${style.need}を関係の魅力として育てられます。`, ...aspectStrengths],
    challenges,
    advice: [
      "交際初期に、連絡頻度、自由時間、金銭感覚、将来像を確認すると、想像と現実のずれを減らせます。",
      saturnTension ? "慎重さを無関心として見せず、迷っている理由と大切にしたい条件を言葉にしましょう。" : "好みを察してもらうだけでなく、安心条件を具体的に共有しましょう。",
    ],
    factors,
    compatiblePartner: `${style.need}を尊重し、${descendant ? SIGN_QUALITY[descendant] : SIGN_QUALITY[moon.sign]}を安定して行動で示す人。互いの自由と約束を同時に扱える相手が合います。`,
    difficultPartner: `${style.risk}傾向を強める人や、曖昧な約束のまま相手に察することを求める人とは、期待のずれが大きくなりやすいです。`,
  };
}

function buildMarriage(input: SynthesisInput, love: WesternSynthesis["love"]): WesternTopicSynthesis {
  const moon = getPlanet(input, "月");
  const saturn = getPlanet(input, "土星");
  const descendant = input.ascendant ? oppositeSign(input.ascendant.sign) : undefined;
  const factors = love.factors.filter((factor) => ["moon-sign", "descendant-sign", "venus-saturn-hard", "venus-saturn-supportive"].includes(factor.code));
  factors.push(placementFactor("saturn-house", `土星 ${saturn.sign}座・${saturn.house ?? "不明"}室`, 0.82, `長期関係では${SIGN_QUALITY[saturn.sign]}を責任として身につけます。`, saturn.retrograde ? "challenge" : "neutral"));
  return {
    conclusion: `結婚では、月${moon.sign}座の${SIGN_QUALITY[moon.sign]}と、${descendant ? `7室${descendant}座の${SIGN_QUALITY[descendant]}` : "相手との具体的な役割分担"}が中心になります。恋愛感情だけでなく、生活を共同運営できることが継続条件です。`,
    strengths: ["約束を実行し、時間をかけて信用を積む関係ほど安定します。"],
    challenges: love.challenges.filter((item) => item.includes("慎重") || item.includes("理想") || item.includes("期待")),
    advice: ["結婚前に、仕事、住居、家計、家族との距離、ひとりの時間を具体的に話し合いましょう。"],
    factors,
  };
}

function buildCareer(input: SynthesisInput): WesternTopicSynthesis {
  const sun = getPlanet(input, "太陽");
  const mercury = getPlanet(input, "水星");
  const jupiter = getPlanet(input, "木星");
  const saturn = getPlanet(input, "土星");
  const factors: WesternSynthesisFactor[] = [
    placementFactor("sun-career", `太陽 ${sun.sign}座・${sun.house ?? "不明"}室`, 0.9, `${SIGN_QUALITY[sun.sign]}を、${sun.house ? `${sun.house}室領域` : "仕事"}で自分の看板にできます。`, "strength"),
    placementFactor("mercury-career", `水星 ${mercury.sign}座・${mercury.house ?? "不明"}室`, 0.86, `${SIGN_QUALITY[mercury.sign]}を使って情報を処理し、説明や企画へ変えます。`, "strength"),
    placementFactor("jupiter-career", `木星 ${jupiter.sign}座・${jupiter.house ?? "不明"}室`, 0.72, `${SIGN_QUALITY[jupiter.sign]}を広げるほど、機会と学びが増えます。`, "strength"),
    placementFactor("saturn-career", `土星 ${saturn.sign}座・${saturn.house ?? "不明"}室${saturn.retrograde ? "・逆行" : ""}`, 0.8, `${SIGN_QUALITY[saturn.sign]}は、苦手意識を越えて専門性に変える長期課題です。`, saturn.retrograde ? "challenge" : "neutral"),
    ...(input.midheaven ? [placementFactor("mc-career", `MC ${input.midheaven.sign}座`, 0.94, `社会的には${SIGN_QUALITY[input.midheaven.sign]}を期待されやすいです。`, "strength")] : []),
  ];
  for (const pair of [["太陽", "天王星"], ["水星", "海王星"], ["火星", "土星"], ["土星", "天王星"]] as const) {
    const aspect = aspectBetween(input, pair[0], pair[1]);
    if (aspect) factors.push(genericAspectFactor(aspect));
  }
  const strengths = factors.filter((factor) => factor.polarity === "strength").map((factor) => factor.interpretation);
  const challenges = factors.filter((factor) => factor.polarity === "challenge").map((factor) => factor.interpretation);
  return {
    conclusion: `仕事では、${SIGN_QUALITY[sun.sign]}を軸に、${SIGN_QUALITY[mercury.sign]}で考え、${input.midheaven ? SIGN_QUALITY[input.midheaven.sign] : SIGN_QUALITY[jupiter.sign]}として社会へ見せる型が合います。単純な職業名より、この三段階を満たす役割を選ぶ方が適性を活かせます。`,
    strengths,
    challenges,
    advice: ["独創性と直感は、期限、検証手順、成果物の形を決めると職業上の評価へつながります。"],
    factors,
  };
}

function buildMoney(input: SynthesisInput): WesternTopicSynthesis {
  const venus = getPlanet(input, "金星");
  const jupiter = getPlanet(input, "木星");
  const saturn = getPlanet(input, "土星");
  const secondSign = signForHouse(input.ascendant?.sign, 2);
  const eighthSign = signForHouse(input.ascendant?.sign, 8);
  const eighthPlanets = input.planets.filter((item) => item.house === 8);
  const factors: WesternSynthesisFactor[] = [
    placementFactor("venus-money", `金星 ${venus.sign}座・${venus.house ?? "不明"}室`, 0.78, `${SIGN_QUALITY[venus.sign]}を魅力や商品価値へ変えると収益化しやすいです。`, "strength"),
    placementFactor("jupiter-money", `木星 ${jupiter.sign}座・${jupiter.house ?? "不明"}室`, 0.7, `${SIGN_QUALITY[jupiter.sign]}への投資は、長期的な機会を増やします。`, "strength"),
    placementFactor("saturn-money", `土星 ${saturn.sign}座・${saturn.house ?? "不明"}室`, 0.72, `資産形成では${SIGN_QUALITY[saturn.sign]}をルール化する必要があります。`, "neutral"),
    ...(secondSign ? [placementFactor("second-house", `2室 ${secondSign}座`, 0.9, `自力収入では${SIGN_QUALITY[secondSign]}が稼ぎ方の軸になります。`, "strength")] : []),
    ...(eighthSign ? [placementFactor("eighth-house", `8室 ${eighthSign}座 / 天体 ${eighthPlanets.map((item) => item.name).join("・") || "なし"}`, 0.82, `共同資産、契約、深い専門知識では${SIGN_QUALITY[eighthSign]}が重要です。`, eighthPlanets.length >= 3 ? "neutral" : "strength")] : []),
  ];
  return {
    conclusion: `${secondSign ? `自力収入は${SIGN_QUALITY[secondSign]}` : "金星の価値観"}を軸にし、${eighthSign ? `契約や共同資産では${SIGN_QUALITY[eighthSign]}` : "共同資産では境界線"}を重視する形です。稼ぐ力と守る仕組みを別々に設計すると安定します。`,
    strengths: factors.filter((factor) => factor.polarity === "strength").map((factor) => factor.interpretation),
    challenges: [
      ...(eighthPlanets.length >= 3 ? ["8室に天体が集中するため、共有資金、借入、契約、心理的な損得を一人で抱え込まない確認が必要です。"] : []),
      "金星が示す満足への支出と、土星が求める長期管理を別口座・別予算で運用すると偏りを防げます。",
    ],
    advice: ["収入、固定費、自由支出、共同資産の四つを分け、拡大期でも守る金額を先に確保しましょう。"],
    factors,
  };
}

function buildTalent(input: SynthesisInput): WesternTopicSynthesis {
  const sun = getPlanet(input, "太陽");
  const mercury = getPlanet(input, "水星");
  const jupiter = getPlanet(input, "木星");
  const node = input.lunarNodes[0];
  const factors: WesternSynthesisFactor[] = [
    placementFactor("sun-talent", `太陽 ${sun.sign}座・${sun.house ?? "不明"}室`, 0.92, `${SIGN_QUALITY[sun.sign]}を自分の専門テーマとして打ち出せます。`, "strength"),
    placementFactor("mercury-talent", `水星 ${mercury.sign}座・${mercury.house ?? "不明"}室`, 0.9, `${SIGN_QUALITY[mercury.sign]}を、学習、分析、説明に使えます。`, "strength"),
    placementFactor("jupiter-talent", `木星 ${jupiter.sign}座・${jupiter.house ?? "不明"}室`, 0.76, `${SIGN_QUALITY[jupiter.sign]}を繰り返し広げるほど才能が育ちます。`, "strength"),
    placementFactor("node-talent", `ドラゴンヘッド ${node.sign}座`, 0.62, `${SIGN_QUALITY[node.sign]}は、慣れていなくても伸ばす価値のある方向です。`, "neutral"),
  ];
  input.aspects.filter((aspect) => aspect.orb <= 4.1).slice(0, 6).forEach((aspect) => factors.push(genericAspectFactor(aspect)));
  return {
    conclusion: `核となる才能は${SIGN_QUALITY[sun.sign]}、思考上の武器は${SIGN_QUALITY[mercury.sign]}、伸びしろは${SIGN_QUALITY[jupiter.sign]}です。三つを同じ活動に載せると、単発の得意を再現可能な専門性へ変えられます。`,
    strengths: factors.filter((factor) => factor.polarity === "strength").map((factor) => factor.interpretation),
    challenges: factors.filter((factor) => factor.polarity === "challenge").map((factor) => factor.interpretation),
    advice: ["直感や独自性を、検証できる成果物と反復可能な手順に変えることが才能の職能化につながります。"],
    factors,
  };
}

export function buildWesternSynthesis(input: SynthesisInput): WesternSynthesis {
  const love = buildLove(input);
  return {
    love,
    marriage: buildMarriage(input, love),
    career: buildCareer(input),
    money: buildMoney(input),
    talent: buildTalent(input),
  };
}
