import type { PalaceName, ZiweiBaseChart, ZiweiPalace, ZiweiStar } from "./ziwei";

export type ZiweiPatternDomain = "love" | "career" | "money" | "talent";
export type ZiweiPatternIntegrity = "reinforced" | "base" | "mixed" | "challenged";

export type ZiweiPattern = {
  id: string;
  name: string;
  school: "紫微斗数全書系・三方四正格局-v1";
  integrity: ZiweiPatternIntegrity;
  coreCondition: string;
  involvedPalaces: PalaceName[];
  evidence: string[];
  supportEvidence: string[];
  challengeEvidence: string[];
  domains: ZiweiPatternDomain[];
  strength: string;
  risk: string;
  action: string;
};

type PatternChart = Pick<ZiweiBaseChart, "palaces" | "natalTransformations">;
type PatternSeed = Omit<
  ZiweiPattern,
  "school" | "integrity" | "supportEvidence" | "challengeEvidence"
>;

const SUPPORT_STARS = new Set(["左輔", "右弼", "文昌", "文曲", "天魁", "天鉞", "祿存", "禄存"]);
const CHALLENGE_STARS = new Set(["擎羊", "陀羅", "陀罗", "火星", "鈴星", "铃星", "地空", "地劫"]);
const BRIGHT = new Set(["廟", "旺"]);

function palace(chart: PatternChart, name: PalaceName): ZiweiPalace {
  const found = chart.palaces.find((item) => item.name === name);
  if (!found) throw new Error(`Zi Wei pattern palace missing: ${name}`);
  return found;
}

function hasAllStars(item: ZiweiPalace, names: string[]): boolean {
  const present = new Set(item.majorStars.map((star) => star.name));
  return names.every((name) => present.has(name));
}

function uniquePalaces(items: ZiweiPalace[]): ZiweiPalace[] {
  return [...new Map(items.map((item) => [item.name, item])).values()];
}

function mingSanfang(chart: PatternChart): ZiweiPalace[] {
  const ming = palace(chart, "命宮");
  return uniquePalaces([
    ming,
    palace(chart, ming.surroundedPalaces.opposite.name),
    palace(chart, ming.surroundedPalaces.wealth.name),
    palace(chart, ming.surroundedPalaces.career.name),
  ]);
}

function starsIn(items: ZiweiPalace[]): ZiweiStar[] {
  return items.flatMap((item) => item.majorStars);
}

function hasStarsAcross(items: ZiweiPalace[], names: string[]): boolean {
  const present = new Set(starsIn(items).map((star) => star.name));
  return names.every((name) => present.has(name));
}

function starEvidence(items: ZiweiPalace[], names: string[]): string[] {
  return names.flatMap((name) => {
    const found = items.find((item) => item.majorStars.some((star) => star.name === name));
    if (!found) return [];
    const star = found.majorStars.find((item) => item.name === name);
    return [`${found.name}${found.earthlyBranch} ${name}${star?.brightness ? `（${star.brightness}）` : ""}`];
  });
}

function allStars(item: ZiweiPalace): ZiweiStar[] {
  return [...item.majorStars, ...item.minorStars, ...item.adjectiveStars];
}

function conditionEvidence(chart: PatternChart, involvedPalaces: PalaceName[]) {
  const items = involvedPalaces.map((name) => palace(chart, name));
  const supportEvidence = items.flatMap((item) =>
    allStars(item)
      .filter((star) => SUPPORT_STARS.has(star.name))
      .map((star) => `${item.name}${item.earthlyBranch} ${star.name}`),
  );
  const challengeEvidence = items.flatMap((item) =>
    allStars(item)
      .filter((star) => CHALLENGE_STARS.has(star.name))
      .map((star) => `${item.name}${item.earthlyBranch} ${star.name}`),
  );

  for (const transformation of chart.natalTransformations) {
    if (!transformation.natalPalace || !involvedPalaces.includes(transformation.natalPalace)) continue;
    const label = `${transformation.natalPalace} ${transformation.star}化${transformation.kind}`;
    if (transformation.kind === "忌") challengeEvidence.push(label);
    else supportEvidence.push(label);
  }

  return {
    supportEvidence: [...new Set(supportEvidence)],
    challengeEvidence: [...new Set(challengeEvidence)],
  };
}

function integrity(supportCount: number, challengeCount: number): ZiweiPatternIntegrity {
  if (challengeCount >= 2 && supportCount === 0) return "challenged";
  if (challengeCount > 0) return "mixed";
  if (supportCount >= 2) return "reinforced";
  return "base";
}

function finalize(chart: PatternChart, seed: PatternSeed): ZiweiPattern {
  const conditions = conditionEvidence(chart, seed.involvedPalaces);
  return {
    ...seed,
    school: "紫微斗数全書系・三方四正格局-v1",
    integrity: integrity(conditions.supportEvidence.length, conditions.challengeEvidence.length),
    ...conditions,
  };
}

function directPatternSeeds(chart: PatternChart): PatternSeed[] {
  const ming = palace(chart, "命宮");
  const career = palace(chart, "官禄宮");
  const wealth = palace(chart, "財帛宮");
  const sanfang = mingSanfang(chart);
  const sanfangNames = sanfang.map((item) => item.name);
  const seeds: PatternSeed[] = [];

  if (hasAllStars(ming, ["紫微", "天府"])) {
    seeds.push({
      id: "zi-fu-tong-gong",
      name: "紫府同宮",
      coreCondition: "命宮で紫微と天府が同宮",
      involvedPalaces: sanfangNames,
      evidence: starEvidence([ming], ["紫微", "天府"]),
      domains: ["career", "money", "talent"],
      strength: "大局観と資源管理を同じ判断軸で扱い、長期目標を段取りへ落としやすい構造です。",
      risk: "理想と安定を守る意識が強まり、権限委譲や方向転換が遅れることがあります。",
      action: "目標、配分する資源、見直し期限を一組にして運用します。",
    });
  }

  const hasShaPoLang = hasStarsAcross(sanfang, ["七殺", "破軍", "貪狼"]);
  const shaPoLangInMing = ["七殺", "破軍", "貪狼"].some((name) =>
    ming.majorStars.some((star) => star.name === name),
  );
  if (hasShaPoLang && shaPoLangInMing) {
    seeds.push({
      id: "sha-po-lang",
      name: "殺破狼",
      coreCondition: "命宮に七殺・破軍・貪狼のいずれかがあり、三方四正で三曜が揃う",
      involvedPalaces: sanfangNames,
      evidence: starEvidence(sanfang, ["七殺", "破軍", "貪狼"]),
      domains: ["love", "career", "money", "talent"],
      strength: "変化の大きい局面で機会を探し、決断し、古い仕組みを組み替える推進力があります。",
      risk: "始める力に対して守成と回収が追いつかず、仕事・資金・関係が極端に動きやすくなります。",
      action: "着手前に残す資産、撤退条件、変化後の運用責任者を決めます。",
    });
  }

  if (hasStarsAcross(sanfang, ["天機", "太陰", "天同", "天梁"])) {
    seeds.push({
      id: "ji-yue-tong-liang",
      name: "機月同梁",
      coreCondition: "命宮三方四正に天機・太陰・天同・天梁が揃う",
      involvedPalaces: sanfangNames,
      evidence: starEvidence(sanfang, ["天機", "太陰", "天同", "天梁"]),
      domains: ["career", "talent"],
      strength: "情報整理、調整、支援、制度運用を組み合わせ、複雑な仕事を安定させやすい構造です。",
      risk: "損失回避と周囲への配慮が重なると、挑戦や決断を先送りしやすくなります。",
      action: "守る基準と試してよい範囲を分け、小さな実験で決断速度を補います。",
    });
  }

  if (career.majorStars.some((star) => star.name === "天府") && wealth.majorStars.some((star) => star.name === "天相")) {
    seeds.push({
      id: "fu-xiang-chao-yuan",
      name: "府相朝垣",
      coreCondition: "官禄宮の天府と財帛宮の天相が命宮を会照",
      involvedPalaces: ["命宮", "官禄宮", "財帛宮"],
      evidence: starEvidence([career, wealth], ["天府", "天相"]),
      domains: ["career", "money", "talent"],
      strength: "管理・蓄積と調整・品質管理が連動し、組織や資源を安定運用しやすい構造です。",
      risk: "安定と公平さを優先しすぎると、自分の意思決定や大胆な更新が遅れます。",
      action: "運用を整える役割と最終判断を下す役割を明確に分けます。",
    });
  }

  const sun = starsIn(sanfang).find((star) => star.name === "太陽");
  const moon = starsIn(sanfang).find((star) => star.name === "太陰");
  if (sun?.brightness && moon?.brightness && BRIGHT.has(sun.brightness) && BRIGHT.has(moon.brightness)) {
    seeds.push({
      id: "ri-yue-bing-ming",
      name: "日月並明",
      coreCondition: "命宮三方四正の太陽と太陰がともに廟または旺",
      involvedPalaces: sanfangNames,
      evidence: starEvidence(sanfang, ["太陽", "太陰"]),
      domains: ["career", "talent"],
      strength: "外へ示す力と内側で観察・計画する力を、状況に応じて使い分けやすい構造です。",
      risk: "期待に応え続けようとすると、外向きの責任と内面の回復が競合します。",
      action: "発信・決断の時間と、検証・回復の時間を意識して分離します。",
    });
  }

  if (hasAllStars(ming, ["太陽", "太陰"])) {
    seeds.push({
      id: "ri-yue-tong-gong",
      name: "日月同宮",
      coreCondition: "命宮で太陽と太陰が同宮",
      involvedPalaces: sanfangNames,
      evidence: starEvidence([ming], ["太陽", "太陰"]),
      domains: ["love", "career", "talent"],
      strength: "表に出て導く面と、内側で受け止めて整える面を一人の中に併せ持ちます。",
      risk: "外へ向かう判断と内側の慎重さが交互に強まり、自己評価が揺れやすくなります。",
      action: "決断時には外向きの目的と内面的な納得条件を両方書き出します。",
    });
  }

  if (["寅", "申"].includes(ming.earthlyBranch) && hasAllStars(ming, ["太陽", "巨門"])) {
    seeds.push({
      id: "ju-ri-tong-gong",
      name: "巨日同宮",
      coreCondition: "寅または申の命宮で太陽と巨門が同宮",
      involvedPalaces: sanfangNames,
      evidence: starEvidence([ming], ["太陽", "巨門"]),
      domains: ["career", "talent"],
      strength: "問題を言語化し、公の場で説明・提案して周囲を動かす力があります。",
      risk: "正しさを急ぐと、説明が批判や一方的な主張として届くことがあります。",
      action: "問題提起には根拠、代案、相手が選べる余地を添えます。",
    });
  }

  if (["卯", "酉"].includes(ming.earthlyBranch) && hasAllStars(ming, ["天機", "巨門"])) {
    seeds.push({
      id: "ji-ju-tong-lin",
      name: "機巨同臨",
      coreCondition: "卯または酉の命宮で天機と巨門が同宮",
      involvedPalaces: sanfangNames,
      evidence: starEvidence([ming], ["天機", "巨門"]),
      domains: ["career", "talent"],
      strength: "複雑な論点を分解し、仮説・調査・言語化を往復して解決策を作れます。",
      risk: "疑問と選択肢が増えすぎると、批判的思考が決断停止へ傾きます。",
      action: "調査を終える条件と、暫定結論を試す期限を先に決めます。",
    });
  }

  const thunderPalace = [ming, career].find(
    (item) => item.earthlyBranch === "卯" && hasAllStars(item, ["太陽", "天梁"]),
  );
  if (thunderPalace) {
    seeds.push({
      id: "ri-zhao-lei-men",
      name: "日照雷門",
      coreCondition: "卯の命宮または官禄宮で太陽と天梁が同宮",
      involvedPalaces: uniquePalaces([ming, career, ...sanfang]).map((item) => item.name),
      evidence: starEvidence([thunderPalace], ["太陽", "天梁"]),
      domains: ["career", "talent"],
      strength: "公共性、発信力、保護・助言を結び付け、経験を人へ還元しやすい構造です。",
      risk: "使命感が強くなるほど、助言が過干渉になり、自分の負担も増えやすくなります。",
      action: "誰に何をどこまで支援するかを合意してから力を使います。",
    });
  }

  if (["子", "午", "寅", "申"].includes(ming.earthlyBranch) && hasAllStars(ming, ["七殺"])) {
    seeds.push({
      id: "qi-sha-chao-dou",
      name: "七殺朝斗",
      coreCondition: "子・午・寅・申の命宮に七殺",
      involvedPalaces: sanfangNames,
      evidence: starEvidence([ming], ["七殺"]),
      domains: ["career", "talent"],
      strength: "難しい局面で責任を引き受け、目標へ集中して突破しやすい構造です。",
      risk: "能力と準備が追いつかないまま強行すると、孤立と損失が拡大します。",
      action: "権限、必要能力、撤退条件を揃えてから大きな決断を下します。",
    });
  }

  return seeds;
}

export function detectZiweiPatterns(chart: PatternChart): ZiweiPattern[] {
  return directPatternSeeds(chart).map((seed) => finalize(chart, seed));
}
