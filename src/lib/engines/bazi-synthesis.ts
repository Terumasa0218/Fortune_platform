import type { FiveElement, HeavenlyStem } from "../astro/bazi-types";
import type { BaziRelation, DetailedBaziChart, TenGod } from "../astro/bazi-detail";
import type { BirthProfileInput } from "./types";

export type BaziSynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  interpretation: string;
};

export type BaziTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: BaziSynthesisFactor[];
};

export type BaziSynthesis = {
  love: BaziTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: BaziTopicSynthesis;
  career: BaziTopicSynthesis;
  money: BaziTopicSynthesis;
  talent: BaziTopicSynthesis;
  timing: {
    favorableMonths: number[];
    cautionMonths: number[];
  };
};

const DAY_MASTER_STYLE: Record<HeavenlyStem, { core: string; love: string; talent: string }> = {
  甲: { core: "筋を通しながら長期的に育てる", love: "誠実さと成長を共有する", talent: "構想を立て、人や計画を育てる" },
  乙: { core: "柔軟に環境へ適応しながら美意識を守る", love: "相手に寄り添い、関係を細やかに整える", talent: "調整、編集、改善を積み重ねる" },
  丙: { core: "明るく開放的に周囲を動かす", love: "熱量を率直に表し、関係を前へ進める", talent: "発信し、人を照らして方向を示す" },
  丁: { core: "内側の情熱を一点へ注ぎ、本質を照らす", love: "本命ほど慎重になり、安心できる相手へ深く尽くす", talent: "観察、研究、表現を深く掘る" },
  戊: { core: "安定した基盤を作り、周囲を支える", love: "信頼と将来性を重視して関係を守る", talent: "長期運用、管理、組織化を担う" },
  己: { core: "現実を整え、人や資源を育てる", love: "生活を支えながら関係を育てる", talent: "必要なものを準備し、運用を改善する" },
  庚: { core: "問題を切り分け、決断して鍛え直す", love: "責任を引き受け、行動で相手を守る", talent: "改革、技術、危機対応で成果を出す" },
  辛: { core: "精密に選び、質と美しさを磨く", love: "尊敬と品のある関係を求める", talent: "選別、品質向上、洗練を進める" },
  壬: { core: "大きな流れを読み、自由に領域を越える", love: "互いの自由を守りながら世界を広げる", talent: "情報、移動、戦略をつなぐ" },
  癸: { core: "静かに観察し、見えない変化を読み取る", love: "相手の心を深く読み、慎重に信頼する", talent: "分析、言語化、洞察を深める" },
};

const TEN_GOD_MEANING: Record<TenGod, { strength: string; risk: string }> = {
  比肩: { strength: "自分で決めて継続する力", risk: "自分の方法に固執して協力を狭めること" },
  劫財: { strength: "仲間を巻き込み、競争の中で突破する力", risk: "交際、共同資金、勝負勘で資源を使いすぎること" },
  食神: { strength: "表現を続け、安心と成果を育てる力", risk: "心地よさを優先して決断が遅れること" },
  傷官: { strength: "問題を見抜き、専門性と改革へ変える力", risk: "正しさや批判が組織との摩擦になること" },
  偏財: { strength: "人脈と機会をつかみ、商機へ変える力", risk: "広げすぎて管理と回収が追いつかないこと" },
  正財: { strength: "信用、生活設計、堅実な収入を積み上げる力", risk: "安全性を優先して機会を逃すこと" },
  偏官: { strength: "負荷のある役割を引き受け、突破する力", risk: "急ぎと緊張で心身や対人関係へ圧力をかけること" },
  正官: { strength: "秩序、肩書き、社会的信用を築く力", risk: "評価や正解に合わせすぎて自由を失うこと" },
  偏印: { strength: "独自の視点で学び直し、企画へ変える力", risk: "考えを広げすぎて実行や継続が遅れること" },
  印綬: { strength: "知識、資格、体系を吸収し、信頼できる基盤を作る力", risk: "準備と理解を優先して外へ出すのが遅れること" },
};

const ELEMENT_ACTION: Record<FiveElement, string> = {
  木: "成長、企画、育成",
  火: "表現、発信、熱量",
  土: "実務、安定、形にすること",
  金: "決断、専門性、収益化",
  水: "情報、洞察、柔軟性",
};

function factor(
  code: string,
  source: string,
  weight: number,
  polarity: BaziSynthesisFactor["polarity"],
  interpretation: string,
): BaziSynthesisFactor {
  return { code, source, weight, polarity, interpretation };
}

function godWeight(value: number): number {
  return Number(Math.min(1, 0.42 + value / 2.8).toFixed(2));
}

function sortedGods(chart: DetailedBaziChart): Array<[TenGod, number]> {
  return (Object.entries(chart.tenGodBalance) as Array<[TenGod, number]>).sort((a, b) => b[1] - a[1]);
}

function relationFactor(relation: BaziRelation, index: number): BaziSynthesisFactor {
  const challenge = relation.kind.includes("冲");
  return factor(
    `natal-relation-${index}-${relation.kind}`,
    `${relation.kind} ${relation.target}`,
    challenge ? 0.76 : 0.68,
    challenge ? "challenge" : "strength",
    relation.meaning,
  );
}

function timingFactors(chart: DetailedBaziChart): BaziSynthesisFactor[] {
  const timing = chart.timing;
  const factors: BaziSynthesisFactor[] = [];
  if (timing.activeLuckCycle) {
    const cycle = timing.activeLuckCycle;
    factors.push(factor(
      "active-dayun",
      `大運 ${cycle.pillar.stem}${cycle.pillar.branch}（${cycle.startYear}〜${cycle.endYear}年・${cycle.tenGod}）`,
      0.96,
      chart.usefulElements.includes(cycle.pillar.element) ? "strength" : chart.avoidElements.includes(cycle.pillar.element) ? "challenge" : "neutral",
      `現在の10年周期では、${cycle.focus}を長期テーマとして扱います。`,
    ));
  }
  factors.push(factor(
    "annual",
    `流年 ${timing.annualPillar.stem}${timing.annualPillar.branch}（${timing.annualTenGod}）`,
    0.84,
    timing.annualElementRole === "useful" ? "strength" : timing.annualElementRole === "avoid" ? "challenge" : "neutral",
    `対象年は${timing.focus}が表に出やすい時期です。`,
  ));
  factors.push(factor(
    "monthly",
    `流月 ${timing.monthly.pillar.stem}${timing.monthly.pillar.branch}（${timing.monthly.tenGod}）`,
    0.7,
    timing.monthly.elementRole === "useful" ? "strength" : timing.monthly.elementRole === "avoid" ? "challenge" : "neutral",
    `対象節月は${timing.monthly.focus}を具体的な行動へ落とす時期です。`,
  ));
  return factors;
}

function buildTalent(chart: DetailedBaziChart): BaziTopicSynthesis {
  const style = DAY_MASTER_STYLE[chart.dayMaster];
  const topGods = sortedGods(chart).slice(0, 4);
  const monthCommand = chart.monthPillar.hiddenStems.find((item) => item.label === "本気");
  const factors: BaziSynthesisFactor[] = [
    factor("day-master", `日主 ${chart.dayMaster}${chart.dayMasterElement}・${chart.dayMasterYinYang}`, 0.95, "strength", `${style.core}ことが命式の核です。`),
    factor("day-master-strength", `身強弱 ${chart.dayMasterStrength.level}（${chart.dayMasterStrength.score}）`, 0.92, chart.dayMasterStrength.level === "中和" ? "neutral" : "strength", chart.dayMasterStrength.summary),
    ...(monthCommand ? [factor("month-command", `月支 ${chart.monthPillar.branch}・本気 ${monthCommand.stem}（${monthCommand.tenGod}）`, 0.9, "strength", `生まれた季節の中心には${TEN_GOD_MEANING[monthCommand.tenGod].strength}があります。`)] : []),
    ...topGods.map(([god, value]) => factor(`god-${god}`, `${god} ${value.toFixed(1)}`, godWeight(value), "strength", TEN_GOD_MEANING[god].strength)),
    ...chart.relations.map(relationFactor),
  ];
  const strengths = factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation);
  const challenges = topGods.slice(0, 2).map(([god]) => TEN_GOD_MEANING[god].risk);
  return {
    conclusion: `才能の核は${style.talent}ことです。${monthCommand ? `${monthCommand.tenGod}が月令側にあり、${TEN_GOD_MEANING[monthCommand.tenGod].strength}が土台になります。` : "月令の中心星は確認中です。"}${topGods.length ? `さらに${topGods.slice(0, 3).map(([god]) => god).join("・")}が強く、知識、実行、対人資源の使い方へ個性が出ます。` : ""}`,
    strengths,
    challenges,
    advice: [`用神候補の${chart.usefulElements.join("・") || "不足要素"}、つまり${chart.usefulElements.map((element) => ELEMENT_ACTION[element]).join("、")}を加えると、強い性質を成果へ変えやすくなります。`],
    factors,
  };
}

function relationshipGods(gender: BirthProfileInput["gender"]): TenGod[] {
  if (gender === "male") return ["正財", "偏財"];
  if (gender === "female") return ["正官", "偏官"];
  return ["正財", "偏財", "正官", "偏官"];
}

function buildLove(chart: DetailedBaziChart, gender: BirthProfileInput["gender"]): BaziSynthesis["love"] {
  const style = DAY_MASTER_STYLE[chart.dayMaster];
  const spouseGods = relationshipGods(gender);
  const spouseScore = spouseGods.reduce((sum, god) => sum + chart.tenGodBalance[god], 0);
  const dayBranchMain = chart.dayPillar.hiddenStems.find((item) => item.label === "本気");
  const dayRelations = chart.relations.filter((relation) => relation.target.includes("日柱"));
  const factors: BaziSynthesisFactor[] = [
    factor("day-master-love", `日主 ${chart.dayMaster}`, 0.82, "strength", style.love),
    factor("spouse-palace", `日支 ${chart.dayPillar.branch}・十二運 ${chart.dayPillar.twelveStage}`, 0.95, "neutral", `親密な関係では、日支${chart.dayPillar.branch}と十二運${chart.dayPillar.twelveStage}の性質が生活上の反応として出ます。`),
    ...(dayBranchMain ? [factor("spouse-palace-main", `日支本気 ${dayBranchMain.stem}（${dayBranchMain.tenGod}）`, 0.88, "neutral", `関係の内側では${TEN_GOD_MEANING[dayBranchMain.tenGod].strength}を求めます。`)] : []),
    factor("relationship-stars", `${spouseGods.join("・")} 合計 ${spouseScore.toFixed(1)}`, Math.max(0.5, godWeight(spouseScore)), spouseScore >= 1.5 ? "strength" : "neutral", spouseScore >= 1.5 ? "関係性を現実の役割や約束へ結び付けやすい命式です。" : "関係性は自然発生に任せるより、希望する役割と約束を言葉にするほど安定します。"),
    ...dayRelations.map(relationFactor),
  ];
  const selfScore = chart.tenGodBalance.比肩 + chart.tenGodBalance.劫財;
  if (selfScore >= 2) {
    factors.push(factor("self-stars-strong", `比肩・劫財 合計 ${selfScore.toFixed(1)}`, 0.86, "challenge", "自分の判断とペースが強いため、親密になるほど相手の裁量を意識して残す必要があります。"));
  }
  return {
    conclusion: `${style.love}タイプです。日支${chart.dayPillar.branch}${dayBranchMain ? `の内側に${dayBranchMain.tenGod}` : ""}があり、恋の勢いより、関係の中で${dayBranchMain ? TEN_GOD_MEANING[dayBranchMain.tenGod].strength : "安心と役割"}を確認できることが長期条件になります。`,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    advice: ["好意の強さだけでなく、連絡、金銭、仕事、家族、ひとりの時間をどう運用するか早めに確認しましょう。"],
    factors,
    compatiblePartner: `用神候補の${chart.usefulElements.join("・")}、つまり${chart.usefulElements.map((element) => ELEMENT_ACTION[element]).join("、")}を関係へ持ち込み、強い${chart.avoidElements.join("・")}の偏りを落ち着かせる人が合います。`,
    difficultPartner: `${chart.avoidElements.join("・")}の性質を互いに強め、${chart.dayMasterStrength.level === "身強" ? "主導権争いと即断" : "遠慮と依存"}が増える相手とは、役割と境界線が曖昧になりやすいです。`,
  };
}

function buildMarriage(chart: DetailedBaziChart, love: BaziSynthesis["love"]): BaziTopicSynthesis {
  const timing = timingFactors(chart);
  const relationshipTiming = timing.filter((item) => ["正財", "偏財", "正官", "偏官"].some((god) => item.source.includes(god)));
  return {
    conclusion: `結婚では日支${chart.dayPillar.branch}の生活反応と、${chart.dayMasterStrength.level}の日主が持つ自己決定力を両立させることが重要です。相手選びより前に、家計、仕事、住居、家族との距離を共同運営できるかが安定条件になります。`,
    strengths: love.strengths,
    challenges: love.challenges,
    advice: ["結婚時期は財星・官星だけで断定せず、日支への合冲、大運、流年、流月が同じテーマを示す時期を優先します。"],
    factors: [...love.factors.filter((item) => item.code.includes("spouse")), ...relationshipTiming],
  };
}

function buildCareer(chart: DetailedBaziChart): BaziTopicSynthesis {
  const topGods = sortedGods(chart).slice(0, 4);
  const timing = timingFactors(chart);
  const factors: BaziSynthesisFactor[] = [
    ...topGods.map(([god, value]) => factor(`career-${god}`, `${god} ${value.toFixed(1)}`, godWeight(value), "strength", TEN_GOD_MEANING[god].strength)),
    factor("career-strength", `身強弱 ${chart.dayMasterStrength.level}`, 0.88, "neutral", chart.dayMasterStrength.level === "身強" ? "裁量と責任がある環境で、自分から仕事を動かすほど力が出ます。" : chart.dayMasterStrength.level === "身弱" ? "制度、専門知識、協力者の支えがある環境で実力が安定します。" : "専門性と協力の切り替えができる環境で力が出ます。"),
    ...timing,
  ];
  const current = timing.map((item) => item.interpretation).join(" ");
  return {
    conclusion: `仕事では${topGods.slice(0, 3).map(([god]) => god).join("・")}が中心です。${topGods.slice(0, 3).map(([god]) => TEN_GOD_MEANING[god].strength).join("、")}を同じ役割へ載せると成果が再現しやすくなります。${current}`,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: [
      ...topGods.slice(0, 2).map(([god]) => TEN_GOD_MEANING[god].risk),
      ...factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    ],
    advice: [`用神候補の${chart.usefulElements.join("・")}を、実務、専門性、情報整理として仕事へ加えましょう。`],
    factors,
  };
}

function buildMoney(chart: DetailedBaziChart): BaziTopicSynthesis {
  const wealthScore = chart.tenGodBalance.正財 + chart.tenGodBalance.偏財;
  const outputScore = chart.tenGodBalance.食神 + chart.tenGodBalance.傷官;
  const competitionScore = chart.tenGodBalance.比肩 + chart.tenGodBalance.劫財;
  const factors: BaziSynthesisFactor[] = [
    factor("wealth-stars", `財星 正財${chart.tenGodBalance.正財.toFixed(1)}・偏財${chart.tenGodBalance.偏財.toFixed(1)}`, godWeight(wealthScore), wealthScore >= 1.5 ? "strength" : "neutral", wealthScore >= 1.5 ? "収入、商機、現実成果を直接扱う力が命式に表れています。" : "財星は強すぎないため、先に技能、信用、発信を育てるほど収入につながります。"),
    factor("output-stars", `食傷 食神${chart.tenGodBalance.食神.toFixed(1)}・傷官${chart.tenGodBalance.傷官.toFixed(1)}`, godWeight(outputScore), "strength", "知識や技能を外へ出し、商品、作品、サービスへ変える力です。"),
    factor("competition-stars", `比劫 比肩${chart.tenGodBalance.比肩.toFixed(1)}・劫財${chart.tenGodBalance.劫財.toFixed(1)}`, godWeight(competitionScore), competitionScore >= 2 ? "challenge" : "neutral", competitionScore >= 2 ? "自己投資、仲間、交際、共同資金でお金が動きやすいため、上限管理が必要です。" : "自分の裁量と共同資金の境界を明確にすると安定します。"),
    ...timingFactors(chart),
  ];
  const favorableMonths = chart.timing.months.filter((month) => month.elementRole === "useful");
  return {
    conclusion: `${wealthScore < 1.5 ? "直接お金を追うより、" : "財星を活かし、"}${outputScore > 0 ? "技能や知識を商品化してから" : "信用と役割を積み上げて"}収益へつなぐ型です。${competitionScore >= 2 ? "稼ぐ力とは別に、仲間や自己投資へ使う金額を管理する必要があります。" : "収入と守る資金を分けると安定します。"}`,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    advice: [`財星または用神候補が巡る第${favorableMonths.map((month) => month.monthOrdinal).join("・")}節月は、契約、価格設定、回収計画を進める候補です。`],
    factors,
  };
}

export function buildBaziSynthesis(
  chart: DetailedBaziChart,
  gender: BirthProfileInput["gender"],
): BaziSynthesis {
  const love = buildLove(chart, gender);
  return {
    love,
    marriage: buildMarriage(chart, love),
    career: buildCareer(chart),
    money: buildMoney(chart),
    talent: buildTalent(chart),
    timing: {
      favorableMonths: chart.timing.months.filter((month) => month.elementRole === "useful").map((month) => month.monthOrdinal),
      cautionMonths: chart.timing.months.filter((month) => month.elementRole === "avoid").map((month) => month.monthOrdinal),
    },
  };
}
