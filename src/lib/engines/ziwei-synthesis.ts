import type {
  PalaceName,
  ZiweiBaseChart,
  ZiweiPalace,
  ZiweiStar,
  ZiweiTransformation,
} from "./ziwei";

export type ZiweiSynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  interpretation: string;
};

export type ZiweiTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: ZiweiSynthesisFactor[];
};

export type ZiweiSynthesis = {
  love: ZiweiTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: ZiweiTopicSynthesis;
  career: ZiweiTopicSynthesis;
  money: ZiweiTopicSynthesis;
  talent: ZiweiTopicSynthesis;
};

const STAR_PROFILE: Record<string, { strength: string; risk: string; action: string }> = {
  紫微: { strength: "大局を見て人と資源をまとめる力", risk: "理想と自尊心が先行して周囲との距離が生まれること", action: "構想を役割分担と期限へ落とす" },
  天機: { strength: "変化を読み、複数の改善策を組み立てる力", risk: "選択肢が増えて決断と継続が遅れること", action: "仮説を期限付きの実験へ変える" },
  太陽: { strength: "人前で方向を示し、価値を広く伝える力", risk: "善意と主導性が相手への圧力になること", action: "相手の裁量を残して方向を示す" },
  武曲: { strength: "数字、資源、実務を成果へ変える力", risk: "結論を急ぎ、一人で責任を抱えること", action: "判断前に数字と第三者の視点を確認する" },
  天同: { strength: "人を安心させ、居心地のよい環境を作る力", risk: "衝突を避けて必要な決断を遅らせること", action: "守りたい快適さのための責任を選ぶ" },
  廉貞: { strength: "複雑な利害と規則を読み、戦略へ変える力", risk: "評価や勝敗へ執着して関係を緊張させること", action: "原則と交渉可能な条件を分ける" },
  天府: { strength: "人と資源を管理し、長く続く基盤を作る力", risk: "安定を守ろうとして変化への着手が遅れること", action: "蓄える基準と使う基準を両方決める" },
  太陰: { strength: "細部と感情の変化を捉え、静かな計画へ変える力", risk: "不安を内側で反復して慎重さが消極性になること", action: "事実と想像を分けて記録する" },
  貪狼: { strength: "好奇心と社交性で新しい機会を増やす力", risk: "興味や欲求が広がり、集中と節度が崩れること", action: "探索する期間と仕上げる期間を分ける" },
  巨門: { strength: "疑問を言語化し、調査で論点を明らかにする力", risk: "疑念と批判が対立や自己防衛へ偏ること", action: "問題提起に根拠と改善案を添える" },
  天相: { strength: "立場の違う人を調整し、運用と品質を整える力", risk: "期待を優先して自分の判断軸が曖昧になること", action: "公平さの基準と自分の結論を明文化する" },
  天梁: { strength: "経験と原則を使い、人を守って助言する力", risk: "正しさと保護意識が過干渉になること", action: "求められている支援量を先に確認する" },
  七殺: { strength: "不確実な状況で決断し、難所を突破する力", risk: "速度と独立性を優先して調整が不足すること", action: "撤退条件と確認役を先に置く" },
  破軍: { strength: "古い仕組みを壊し、より良い形へ再編する力", risk: "変化そのものが目的になり、蓄積まで失うこと", action: "残す資産と変える対象を分ける" },
};

const TRANSFORMATION_MEANING: Record<ZiweiTransformation["kind"], { polarity: ZiweiSynthesisFactor["polarity"]; text: string }> = {
  禄: { polarity: "strength", text: "機会、資源、人の流れが生まれやすい" },
  権: { polarity: "neutral", text: "責任、決定権、主導性が強まりやすい" },
  科: { polarity: "strength", text: "評価、整理、説明可能性が高まりやすい" },
  忌: { polarity: "challenge", text: "執着、摩擦、再検討が生じやすい" },
};

const BRIGHTNESS_WEIGHT: Record<string, number> = {
  廟: 1,
  旺: 0.95,
  得: 0.9,
  利: 0.84,
  平: 0.74,
  不: 0.66,
  陷: 0.58,
};

function factor(
  code: string,
  source: string,
  weight: number,
  polarity: ZiweiSynthesisFactor["polarity"],
  interpretation: string,
): ZiweiSynthesisFactor {
  return { code, source, weight, polarity, interpretation };
}

function palace(chart: ZiweiBaseChart, name: PalaceName): ZiweiPalace {
  const found = chart.palaces.find((item) => item.name === name);
  if (!found) throw new Error(`Zi Wei synthesis palace missing: ${name}`);
  return found;
}

function effectiveStars(item: ZiweiPalace): ZiweiStar[] {
  return item.majorStars.length ? item.majorStars : item.borrowedMajorStars;
}

function starSource(item: ZiweiPalace, star: ZiweiStar, prefix = "主星"): string {
  return `${item.name}${item.earthlyBranch} ${prefix}${star.name}${star.brightness ? `（${star.brightness}）` : ""}${star.mutagen ? `・化${star.mutagen}` : ""}`;
}

function starFactor(
  code: string,
  item: ZiweiPalace,
  star: ZiweiStar,
  role: "target" | "opposite" | "wealth" | "career" | "borrowed",
): ZiweiSynthesisFactor {
  const profile = STAR_PROFILE[star.name];
  const roleWeight = { target: 0.96, borrowed: 0.76, opposite: 0.72, wealth: 0.66, career: 0.66 }[role];
  const brightness = star.brightness ? BRIGHTNESS_WEIGHT[star.brightness] ?? 0.72 : 0.72;
  const weight = Number((roleWeight * (0.75 + brightness * 0.25)).toFixed(2));
  const label = role === "target" ? "主星" : role === "borrowed" ? "借星" : `三方四正${role === "opposite" ? "対宮" : role === "wealth" ? "財帛位" : "官禄位"}`;
  return factor(
    code,
    starSource(item, star, label),
    weight,
    "strength",
    profile?.strength ?? `${star.name}の性質がこの領域の判断と行動に影響します。`,
  );
}

function transformationFactor(
  scope: "natal" | "decadal" | "yearly" | "monthly" | "daily",
  transformation: ZiweiTransformation,
): ZiweiSynthesisFactor {
  const meaning = TRANSFORMATION_MEANING[transformation.kind];
  const scopeLabel = { natal: "生年", decadal: "大限", yearly: "流年", monthly: "流月", daily: "流日" }[scope];
  const scopeWeight = { natal: 0.92, decadal: 0.96, yearly: 0.84, monthly: 0.68, daily: 0.52 }[scope];
  return factor(
    `${scope}-transform-${transformation.kind}-${transformation.star}`,
    `${scopeLabel}${transformation.star}化${transformation.kind} -> ${transformation.natalPalace ?? "所在宮不明"}`,
    scopeWeight,
    meaning.polarity,
    `${transformation.natalPalace ?? "出生命盤"}では、${meaning.text}状態です。`,
  );
}

function palaceFactors(chart: ZiweiBaseChart, palaceName: PalaceName): ZiweiSynthesisFactor[] {
  const target = palace(chart, palaceName);
  const direct = target.majorStars.length > 0;
  const factors = effectiveStars(target).map((star, index) =>
    starFactor(`${palaceName}-star-${index}-${star.name}`, target, star, direct ? "target" : "borrowed"),
  );
  const related = target.surroundedPalaces;
  const relatedSets = [
    { role: "opposite" as const, item: related.opposite },
    { role: "wealth" as const, item: related.wealth },
    { role: "career" as const, item: related.career },
  ];
  for (const set of relatedSets) {
    const relatedPalace = palace(chart, set.item.name);
    set.item.majorStars.forEach((star, index) => {
      factors.push(starFactor(`${palaceName}-${set.role}-${index}-${star.name}`, relatedPalace, star, set.role));
    });
  }
  if (target.isBodyPalace) {
    factors.push(factor(`${palaceName}-body`, `身宮が${palaceName}に重なる`, 0.9, "neutral", `${palaceName}のテーマは、考えるだけでなく実際の行動と生活へ強く現れます。`));
  }
  return factors;
}

function domainTimingFactors(chart: ZiweiBaseChart, palaces: PalaceName[]): ZiweiSynthesisFactor[] {
  if (!chart.timing) return [];
  const layers = [
    { scope: "decadal" as const, value: chart.timing.decadal },
    { scope: "yearly" as const, value: chart.timing.yearly },
    { scope: "monthly" as const, value: chart.timing.monthly },
    { scope: "daily" as const, value: chart.timing.daily },
  ];
  return layers.flatMap(({ scope, value }) => {
    const transformations = value.transformations.filter(
      (item) => item.natalPalace && palaces.includes(item.natalPalace),
    );
    const palaceFactor = palaces.includes(value.palace)
      ? [factor(`${scope}-palace-${value.palace}`, `${scope}命宮 ${value.palace} ${value.heavenlyStem}${value.earthlyBranch}`, scope === "decadal" ? 0.9 : scope === "yearly" ? 0.78 : scope === "monthly" ? 0.62 : 0.48, "neutral", `${value.palace}のテーマが${scope === "decadal" ? "10年周期" : scope === "yearly" ? "対象年" : scope === "monthly" ? "対象月" : "対象日"}の前面に出ます。`)]
      : [];
    return [...palaceFactor, ...transformations.map((item) => transformationFactor(scope, item))];
  });
}

function natalTransformationFactors(chart: ZiweiBaseChart, palaces: PalaceName[]): ZiweiSynthesisFactor[] {
  return chart.natalTransformations
    .filter((item) => item.natalPalace && palaces.includes(item.natalPalace))
    .map((item) => transformationFactor("natal", item));
}

function synthesize(
  factors: ZiweiSynthesisFactor[],
  conclusion: string,
  advice: string[],
): ZiweiTopicSynthesis {
  const starChallenges = factors
    .filter((item) => item.code.includes("-star-") || item.code.includes("-opposite-") || item.code.includes("-wealth-") || item.code.includes("-career-"))
    .map((item) => {
      const starName = Object.keys(STAR_PROFILE).find((name) => item.source.includes(name));
      return starName ? STAR_PROFILE[starName].risk : undefined;
    })
    .filter((item): item is string => Boolean(item));
  return {
    conclusion,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: [
      ...new Set(starChallenges),
      ...factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    ],
    advice,
    factors,
  };
}

function starNames(chart: ZiweiBaseChart, palaceName: PalaceName): string {
  return effectiveStars(palace(chart, palaceName)).map((star) => star.name).join("・") || "主星なし";
}

function buildLove(chart: ZiweiBaseChart): ZiweiSynthesis["love"] {
  const names: PalaceName[] = ["夫妻宮", "福徳宮", "命宮"];
  const factors = [
    ...palaceFactors(chart, "夫妻宮"),
    ...natalTransformationFactors(chart, names),
    ...domainTimingFactors(chart, names),
  ];
  const result = synthesize(
    factors,
    `夫妻宮の主星は${starNames(chart, "夫妻宮")}。恋愛ではこの主星の性質に加え、三方四正の官禄・遷移・福徳領域が、相手選び、役割分担、感情的な満足を同時に動かします。四化が重なる星は、強みと負荷の両方を時期別に分けて読みます。`,
    ["感情だけでなく、意思決定、仕事との両立、生活上の役割を具体的に話し合いましょう。"],
  );
  return {
    ...result,
    compatiblePartner: `夫妻宮${starNames(chart, "夫妻宮")}の決断力を尊重しつつ、三方四正の${palace(chart, "夫妻宮").surroundedPalaces.career.name}・${palace(chart, "夫妻宮").surroundedPalaces.wealth.name}が示す社会性と変化へ、対話と確認を持ち込める相手が合います。`,
    difficultPartner: "変化や強い決断だけを求め、蓄積、説明、役割調整を軽視する相手とは、関係が極端に動きやすくなります。",
  };
}

function buildMarriage(chart: ZiweiBaseChart, love: ZiweiSynthesis["love"]): ZiweiTopicSynthesis {
  const decadalCaution = love.factors.find((item) => item.code.startsWith("decadal-transform-忌"));
  return synthesize(
    love.factors,
    `結婚では夫妻宮${starNames(chart, "夫妻宮")}の関係運用が中心です。${decadalCaution ? `現在の大限では${decadalCaution.source}があり、責任、お金、実務の扱いを曖昧にしないことが重要です。` : "大限と流年の四化を重ね、関係の強みと負荷が同じ宮へ集まる時期を確認します。"}`,
    ["家計、仕事、住居、自由時間、家族との距離を、愛情とは別の運用項目として合意しましょう。"],
  );
}

function buildCareer(chart: ZiweiBaseChart): ZiweiTopicSynthesis {
  const names: PalaceName[] = ["官禄宮", "遷移宮", "命宮", "交友宮"];
  const factors = [
    ...palaceFactors(chart, "官禄宮"),
    ...palaceFactors(chart, "命宮").filter((item) => item.code.includes("-star-") || item.code.endsWith("-body")),
    ...natalTransformationFactors(chart, names),
    ...domainTimingFactors(chart, names),
  ];
  return synthesize(
    factors,
    `官禄宮${starNames(chart, "官禄宮")}が仕事の実務、命宮${starNames(chart, "命宮")}が本人の判断、遷移宮${starNames(chart, "遷移宮")}が外部評価を示します。三つを合わせると、得意な仕事名ではなく、どの役割で成果を出しやすいかまで具体化できます。`,
    ["調整力、管理力、突破力のうち、自分が最終責任を持つ範囲を明確にすると評価が安定します。"],
  );
}

function buildMoney(chart: ZiweiBaseChart): ZiweiTopicSynthesis {
  const names: PalaceName[] = ["財帛宮", "田宅宮", "官禄宮", "福徳宮"];
  const factors = [
    ...palaceFactors(chart, "財帛宮"),
    ...palaceFactors(chart, "田宅宮").filter((item) => item.code.includes("-star-") || item.code.includes("-borrowed-")),
    ...natalTransformationFactors(chart, names),
    ...domainTimingFactors(chart, names),
  ];
  const wealth = palace(chart, "財帛宮");
  const borrowed = wealth.majorStars.length === 0;
  return synthesize(
    factors,
    `財帛宮は${borrowed ? `空宮のため対宮${wealth.surroundedPalaces.opposite.name}の${starNames(chart, wealth.surroundedPalaces.opposite.name)}を借りて` : `${starNames(chart, "財帛宮")}を中心に`}読みます。官禄宮は稼ぐ役割、田宅宮は残す仕組み、福徳宮は満足のための支出を補足します。`,
    ["収入、事業資金、生活資産、楽しみの支出を分け、同じ判断基準で混ぜないことが資産形成につながります。"],
  );
}

function buildTalent(chart: ZiweiBaseChart): ZiweiTopicSynthesis {
  const names: PalaceName[] = ["命宮", "福徳宮", "遷移宮", "官禄宮"];
  const factors = [
    ...palaceFactors(chart, "命宮"),
    ...palaceFactors(chart, "福徳宮").filter((item) => item.code.includes("-star-") || item.code.endsWith("-body")),
    ...natalTransformationFactors(chart, names),
    ...domainTimingFactors(chart, names),
  ];
  const bodyPalace = chart.palaces.find((item) => item.isBodyPalace);
  return synthesize(
    factors,
    `命宮${starNames(chart, "命宮")}が意識しやすい才能、福徳宮${starNames(chart, "福徳宮")}が内側の動機を示します。${bodyPalace ? `身宮は${bodyPalace.name}に重なるため、${bodyPalace.meaning}が実際の行動へ強く現れます。` : "身宮の重なりを確認すると、才能が行動へ出る領域が分かります。"}`,
    ["命宮の強みを、身宮が示す生活領域で繰り返し使い、外部評価へ接続しましょう。"],
  );
}

export function buildZiweiSynthesis(chart: ZiweiBaseChart): ZiweiSynthesis {
  const love = buildLove(chart);
  return {
    love,
    marriage: buildMarriage(chart, love),
    career: buildCareer(chart),
    money: buildMoney(chart),
    talent: buildTalent(chart),
  };
}
