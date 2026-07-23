import type { DetailedBaziChart, HiddenStem, TenGod } from "../astro/bazi-detail";

export type BaziStructureStatus = "supported" | "mixed" | "unsupported" | "provisional";

export type BaziStructureCandidate = {
  name: string;
  tenGod: TenGod;
  hiddenStem: HiddenStem["stem"];
  qiLabel: HiddenStem["label"];
  transparentPillars: string[];
  category: "順用" | "逆用" | "禄刃";
  primary: boolean;
};

export type BaziStructureAssessment = {
  school: "子平真詮系・月令格局法-v1";
  primary: BaziStructureCandidate;
  alternatives: BaziStructureCandidate[];
  status: BaziStructureStatus;
  statusLabel: string;
  supports: string[];
  disruptions: string[];
  adjustments: string[];
  summary: string;
  evidence: string[];
};

const FORWARD_GODS = new Set<TenGod>(["正官", "正財", "偏財", "印綬", "食神"]);
const REVERSE_GODS = new Set<TenGod>(["偏官", "偏印", "傷官"]);

function structureName(chart: DetailedBaziChart, god: TenGod): string {
  if (god === "正財") return "正財格";
  if (god === "偏財") return "偏財格";
  if (god === "正官") return "正官格";
  if (god === "偏官") return "七殺格";
  if (god === "印綬") return "印綬格";
  if (god === "偏印") return "偏印格";
  if (god === "食神") return "食神格";
  if (god === "傷官") return "傷官格";
  if (chart.monthPillar.twelveStage === "建禄") return "建禄格";
  if (
    chart.monthPillar.twelveStage === "帝旺" &&
    chart.dayMasterYinYang === "陽"
  ) return "陽刃格";
  return "月劫格";
}

function category(god: TenGod): BaziStructureCandidate["category"] {
  if (FORWARD_GODS.has(god)) return "順用";
  if (REVERSE_GODS.has(god)) return "逆用";
  return "禄刃";
}

function visibleStemPillars(chart: DetailedBaziChart, stem: HiddenStem["stem"]): string[] {
  const pillars = [
    ["年干", chart.yearPillar],
    ["月干", chart.monthPillar],
    ["時干", chart.timePillar],
  ] as const;
  return pillars.flatMap(([label, pillar]) =>
    pillar?.stem === stem ? [`${label} ${pillar.stem}`] : [],
  );
}

function candidate(
  chart: DetailedBaziChart,
  hidden: HiddenStem,
  primary: boolean,
): BaziStructureCandidate {
  return {
    name: primary ? structureName(chart, hidden.tenGod) : `${hidden.tenGod}透干候補`,
    tenGod: hidden.tenGod,
    hiddenStem: hidden.stem,
    qiLabel: hidden.label,
    transparentPillars: visibleStemPillars(chart, hidden.stem),
    category: category(hidden.tenGod),
    primary,
  };
}

function score(chart: DetailedBaziChart, ...gods: TenGod[]): number {
  return gods.reduce((sum, god) => sum + chart.tenGodBalance[god], 0);
}

function addWhen(target: string[], condition: boolean, text: string): void {
  if (condition) target.push(text);
}

function assessConditions(
  chart: DetailedBaziChart,
  primary: BaziStructureCandidate,
): Pick<BaziStructureAssessment, "supports" | "disruptions" | "adjustments"> {
  const supports: string[] = [];
  const disruptions: string[] = [];
  const adjustments: string[] = [];
  const wealth = score(chart, "正財", "偏財");
  const authority = score(chart, "正官", "偏官");
  const output = score(chart, "食神", "傷官");
  const resource = score(chart, "印綬", "偏印");
  const peers = score(chart, "比肩", "劫財");
  const visibleGods = [
    chart.yearPillar.stemTenGod,
    chart.monthPillar.stemTenGod,
    chart.timePillar?.stemTenGod,
  ].filter((god): god is TenGod => Boolean(god));
  const visible = (god: TenGod) => visibleGods.includes(god);

  switch (primary.tenGod) {
    case "正官":
      addWhen(supports, wealth >= 0.6, "財星が官星を生じ、役割と成果をつなぎます。");
      addWhen(supports, resource >= 0.6, "印星が官星を護り、知識・資格・信用へつなぎます。");
      addWhen(disruptions, chart.tenGodBalance.傷官 >= 0.6, "傷官が官星を剋すため、評価制度や権威との摩擦を調整する必要があります。");
      addWhen(disruptions, visible("偏官"), "正官と七殺がともに透り、官殺混雑の整理が必要です。");
      adjustments.push("財で官を生じるか、印で官を護る経路を優先します。");
      break;
    case "正財":
    case "偏財":
      addWhen(supports, output >= 0.6, "食傷が財星を生じ、技能・表現・生産を成果へ変えます。");
      addWhen(supports, chart.tenGodBalance.正官 >= 0.5, "財官が連なり、現実成果を信用と役割へつなげます。");
      addWhen(disruptions, peers >= 1.8, "比劫が強く、競争・共同資金・分配で財が散りやすい構造です。");
      addWhen(disruptions, chart.tenGodBalance.偏官 >= 0.8 && output < 0.6 && resource < 0.6, "財が七殺を強めやすく、負担と責任の制御が不足します。");
      adjustments.push("食傷による価値提供と、比劫による分配・支出管理を分けます。");
      break;
    case "印綬":
    case "偏印":
      addWhen(supports, authority >= 0.6, "官殺が印星を生じ、責任を知識・資格・保護へ変えます。");
      addWhen(supports, chart.dayMasterStrength.level === "身強" && output >= 0.7, "身強で印があり、食傷によって知識を外へ泄秀できます。");
      addWhen(disruptions, wealth >= 1.1, "財星が印星を剋し、学習・信用・保護と成果要求が衝突しやすい構造です。");
      addWhen(disruptions, primary.tenGod === "偏印" && chart.tenGodBalance.食神 >= 0.6, "偏印と食神が競合し、準備や独自性が継続的な出力を止めやすくなります。");
      adjustments.push("印を蓄えるだけで終わらせず、食傷で説明・制作・実務へ出します。");
      break;
    case "食神":
      addWhen(supports, wealth >= 0.6, "食神が財星を生じ、継続的な表現や技能を収益へつなげます。");
      addWhen(supports, chart.tenGodBalance.偏官 >= 0.5, "食神が七殺を制し、負荷と競争を技能で扱います。");
      addWhen(disruptions, chart.tenGodBalance.偏印 >= 0.6, "偏印が食神を抑え、出力の継続を妨げやすい構造です。");
      adjustments.push("作品・技能・サービスを反復可能な形にし、偏印による中断を管理します。");
      break;
    case "偏官":
      addWhen(supports, score(chart, "食神", "傷官") >= 0.7, "食傷が七殺を制し、圧力を技能・判断・突破力へ変えます。");
      addWhen(supports, resource >= 0.6, "印星が七殺を化し、責任と緊張を知識・資格・保護へ変えます。");
      addWhen(disruptions, wealth >= 0.8 && output < 0.7 && resource < 0.6, "財星が七殺を強める一方、制化する食傷・印が不足します。");
      addWhen(disruptions, visible("正官"), "正官と七殺がともに透り、責任系統が混在しています。");
      adjustments.push("食傷で制する経路か、印で化する経路を明確にします。");
      break;
    case "傷官":
      addWhen(supports, resource >= 0.7, "印星が傷官の鋭さを整え、専門性と説明力へ変えます。");
      addWhen(supports, wealth >= 0.7, "傷官が財星を生じ、改善・発信・技術を成果へつなげます。");
      addWhen(disruptions, chart.tenGodBalance.正官 >= 0.6, "傷官と正官が競合し、制度・評価・上位者との摩擦が出やすい構造です。");
      adjustments.push("印で根拠と再現性を加えるか、財へつないで成果として示します。");
      break;
    case "比肩":
    case "劫財":
      addWhen(supports, authority >= 0.6, "官殺が比劫・禄刃の強い自己決定力を役割と責任へ整えます。");
      addWhen(supports, wealth >= 0.6 && output >= 0.5, "食傷から財へ流れ、自力と競争心を価値提供へ変えます。");
      addWhen(disruptions, authority < 0.6 && wealth < 0.6, "財官が弱く、強い自己決定力の向かう先が定まりにくい構造です。");
      addWhen(disruptions, peers + resource >= 3.5, "比劫と印が重なり、自己完結・抱え込み・競争が強まりやすい構造です。");
      adjustments.push("官殺で責任を定めるか、食傷生財で成果と分配へ流します。");
      break;
  }

  return { supports, disruptions, adjustments };
}

function statusOf(
  primary: BaziStructureCandidate,
  supports: string[],
  disruptions: string[],
): BaziStructureStatus {
  if (primary.transparentPillars.length === 0) return "provisional";
  if (supports.length > 0 && disruptions.length > 0) return "mixed";
  if (supports.length === 0 && disruptions.length > 0) return "unsupported";
  if (supports.length > 0) return "supported";
  return "provisional";
}

const STATUS_LABEL: Record<BaziStructureStatus, string> = {
  supported: "成立を支える条件あり",
  mixed: "成敗条件が混在",
  unsupported: "破格要因が優勢",
  provisional: "候補・透干または相神を要確認",
};

export function analyzeBaziStructure(chart: DetailedBaziChart): BaziStructureAssessment {
  const command = chart.monthPillar.hiddenStems.find((item) => item.label === "本気");
  if (!command) throw new Error("Bazi month-command hidden stem is missing.");
  const primary = candidate(chart, command, true);
  const alternatives = chart.monthPillar.hiddenStems
    .filter((item) => item.label !== "本気")
    .map((item) => candidate(chart, item, false))
    .filter((item) => item.transparentPillars.length > 0);
  const { supports, disruptions, adjustments } = assessConditions(chart, primary);
  const status = statusOf(primary, supports, disruptions);
  const transparency = primary.transparentPillars.length
    ? `${primary.hiddenStem}が${primary.transparentPillars.join("・")}へ透出`
    : `${primary.hiddenStem}は天干へ透出せず`;

  return {
    school: "子平真詮系・月令格局法-v1",
    primary,
    alternatives,
    status,
    statusLabel: STATUS_LABEL[status],
    supports,
    disruptions,
    adjustments,
    summary: `月支${chart.monthPillar.branch}の本気${primary.hiddenStem}（${primary.tenGod}）から${primary.name}を第一候補とします。${transparency}、判定は「${STATUS_LABEL[status]}」です。`,
    evidence: [
      `月令 ${chart.monthPillar.branch} / 本気 ${primary.hiddenStem} ${primary.tenGod} / 十二運 ${chart.monthPillar.twelveStage}`,
      `透干 ${primary.transparentPillars.join("・") || "なし"}`,
      ...alternatives.map((item) => `副気透干 ${item.hiddenStem} ${item.tenGod} -> ${item.transparentPillars.join("・")}`),
      ...supports.map((item) => `成立条件 ${item}`),
      ...disruptions.map((item) => `破格・混雑候補 ${item}`),
    ],
  };
}
