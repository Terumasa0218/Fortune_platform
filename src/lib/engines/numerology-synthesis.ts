import type { NumerologyBaseChart, NumerologyNumber } from "./numerology";

export type NumerologySynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  interpretation: string;
};

export type NumerologyTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: NumerologySynthesisFactor[];
};

export type NumerologySynthesis = {
  love: NumerologyTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: NumerologyTopicSynthesis;
  career: NumerologyTopicSynthesis;
  money: NumerologyTopicSynthesis;
  talent: NumerologyTopicSynthesis;
};

type NumberProfile = {
  core: string;
  love: string;
  partner: string;
  friction: string;
  career: string;
  money: string;
  talent: string;
  action: string;
};

const PROFILE: Record<NumerologyNumber, NumberProfile> = {
  1: { core: "自分で始めて方向を決める", love: "率直に好意を示し、関係にも前進を求める", partner: "自立を尊重しながら率直に意思表示できる人", friction: "主導権争いと、一人で結論を出すこと", career: "新規企画、起業、先頭に立つ役割", money: "自分の判断と成果を収入へ結びつける", talent: "決断、開拓、最初の一歩を作る力", action: "独断になる前に協力者へ目的を共有する" },
  2: { core: "人と状況の微細な変化を読み取る", love: "安心と相互理解を育てながら距離を縮める", partner: "感情を言葉にし、穏やかに合意を作れる人", friction: "我慢による不満の蓄積と、相手への過度な同調", career: "調整、支援、交渉、共同作業", money: "信頼関係と継続的な協力を価値へ変える", talent: "共感、観察、対立を和らげる力", action: "相手の希望と自分の希望を同じ重さで言語化する" },
  3: { core: "発想や感情を魅力的に表現する", love: "会話、遊び心、共有体験から愛情を育てる", partner: "反応が豊かで、表現と好奇心を楽しめる人", friction: "深刻な話の先送りと、関心が散ること", career: "発信、創作、企画、教育、接客", money: "表現力とアイデアを人に届く形へ変える", talent: "言語化、創造、場を明るくする力", action: "締切と発表の場を先に決めて最後まで仕上げる" },
  4: { core: "秩序を作り、安定して積み上げる", love: "約束と日常の行動で信頼を示す", partner: "生活感覚が堅実で、合意を継続できる人", friction: "変化への抵抗と、正しさを細かく求めること", career: "運用、設計、品質管理、専門実務", money: "予算、仕組み、長期蓄積で資産を守る", talent: "継続、標準化、再現可能な土台を作る力", action: "計画の中に小さく試せる余白を用意する" },
  5: { core: "変化へ入り、経験から素早く学ぶ", love: "刺激と自由を保ちながら関係を更新する", partner: "束縛せず、変化と対話の両方を楽しめる人", friction: "退屈からの衝動的な離脱と、約束の曖昧さ", career: "営業、情報、移動、新規市場、複数領域", money: "情報差と機動力を機会へ変える", talent: "適応、探索、異なる世界をつなぐ力", action: "自由を守るための最低限の期限と上限を決める" },
  6: { core: "人や環境を整え、責任を持って育てる", love: "世話、配慮、暮らしの質で愛情を示す", partner: "責任を分担し、感謝を具体的に返せる人", friction: "過干渉、理想の押し付け、抱え込み", career: "育成、医療福祉、デザイン、顧客支援、管理", money: "品質、信頼、生活価値を安定収入へ変える", talent: "育成、調和、美意識、責任感", action: "支える範囲と相手自身が担う範囲を分ける" },
  7: { core: "表面の奥を分析し、本質を確かめる", love: "精神的な理解と一人で考える時間を重視する", partner: "沈黙と探究心を尊重し、誠実に対話できる人", friction: "疑いすぎることと、説明せずに距離を取ること", career: "研究、分析、技術、監査、専門職", money: "希少な知識と精度を価値へ変える", talent: "洞察、検証、専門性を深める力", action: "十分な確証を待たず、小さな検証結果を外へ出す" },
  8: { core: "資源を動かし、目標を現実の成果へ変える", love: "尊敬、信頼、将来設計を通じて関係を深める", partner: "自立し、責任と成果を対等に分担できる人", friction: "支配、勝敗意識、弱さを見せないこと", career: "経営、金融、事業推進、意思決定", money: "人、資金、仕組みを組み合わせて規模を作る", talent: "実現、交渉、組織と数字を扱う力", action: "成果だけでなく信頼と余力も評価指標に入れる" },
  9: { core: "広い視点で経験を統合し、意味を与える", love: "相手を受け入れ、理想や価値観を共有する", partner: "共感を当然視せず、現実の責任も担える人", friction: "救済役になることと、理想化して境界線を失うこと", career: "教育、芸術、社会貢献、国際領域、総合職", money: "広い対象へ価値を届け、循環を作る", talent: "包容、完成、異なる価値観をまとめる力", action: "助ける対象と達成条件を具体的に限定する" },
  11: { core: "直感でまだ言語化されていない兆しを捉える", love: "強い精神的共鳴と繊細な理解を求める", partner: "感受性を否定せず、現実的な安定も作れる人", friction: "期待の投影、刺激過多、不安の増幅", career: "表現、相談、思想、創造、先端的な発信", money: "独自の感性を理解可能な形へ翻訳して価値にする", talent: "直感、啓発、人の内面を言葉にする力", action: "直感を記録し、事実と照合してから大きく動く" },
  22: { core: "大きな構想を持続可能な仕組みへ変える", love: "二人の生活や将来を長期計画として育てる", partner: "大きな目標と日々の責任を両方共有できる人", friction: "責任過多、完璧主義、関係を仕事のように管理すること", career: "大規模事業、組織設計、社会基盤、長期プロジェクト", money: "長期構想と組織化によって大きな資産を築く", talent: "理想の実装、組織化、長期的な建設力", action: "構想を短い工程に分け、責任を適切に委譲する" },
  33: { core: "創造性と愛情を使って人を育てる", love: "深い受容と献身で相手を支える", partner: "優しさを受け取るだけでなく、回復と責任を返せる人", friction: "自己犠牲、相手の課題の肩代わり、感情的消耗", career: "教育、癒やし、芸術、コミュニティ育成", money: "人を満たす創造的な価値を継続可能な形にする", talent: "奉仕、育成、感情を動かす表現力", action: "自分の回復時間と対価を先に確保する" },
};

type Domain = "love" | "career" | "money" | "talent";

function profile(number: number): NumberProfile {
  return PROFILE[number as NumerologyNumber] ?? PROFILE[9];
}

function domainText(number: number, domain: Domain): string {
  const item = profile(number);
  return domain === "love" ? item.love : domain === "career" ? item.career : domain === "money" ? item.money : item.talent;
}

function factor(
  code: string,
  source: string,
  weight: number,
  polarity: NumerologySynthesisFactor["polarity"],
  interpretation: string,
): NumerologySynthesisFactor {
  return { code, source, weight, polarity, interpretation };
}

function factorsFor(chart: NumerologyBaseChart, domain: Domain): NumerologySynthesisFactor[] {
  const pinnacle = chart.pinnacles.find((item) => item.current) ?? chart.pinnacles[3];
  const challenge = chart.challenges.find((item) => item.current) ?? chart.challenges[3];
  const challengeText = challenge.number === 0
    ? "一つの課題へ固定せず、状況ごとに自分で優先テーマを選ぶことが求められます。"
    : `現在は、${profile(challenge.number).friction}を繰り返し調整することが成長課題です。`;

  return [
    factor("life-path", `ライフパス ${chart.lifePathNumber}`, 0.96, "strength", `${profile(chart.lifePathNumber).core}性質が土台です。${domainText(chart.lifePathNumber, domain)}方向で力を使いやすくなります。`),
    factor("birth-day", `誕生日数 ${chart.birthDayNumber}`, 0.84, "strength", `自然に表れやすい資質は、${domainText(chart.birthDayNumber, domain)}ことです。`),
    factor("attitude", `態度数 ${chart.attitudeNumber}`, 0.7, "neutral", `周囲には、${profile(chart.attitudeNumber).core}人として見えやすく、その入口から${domainText(chart.attitudeNumber, domain)}傾向が出ます。`),
    factor(`pinnacle-${pinnacle.index}`, `第${pinnacle.index}ピナクル ${pinnacle.number}（${pinnacle.startAge}-${pinnacle.endAge ?? "生涯"}歳）`, 0.9, "strength", `現在の長期成長テーマは、${domainText(pinnacle.number, domain)}ことです。`),
    factor(`challenge-${challenge.index}`, `第${challenge.index}チャレンジ ${challenge.number}（${challenge.startAge}-${challenge.endAge ?? "生涯"}歳）`, 0.86, "challenge", challengeText),
    factor("personal-year", `個人年 ${chart.personalYearNumber}`, 0.76, "neutral", `対象年は${profile(chart.personalYearNumber).core}流れです。${profile(chart.personalYearNumber).action}ことが年間テーマになります。`),
    factor("personal-month", `個人月 ${chart.personalMonthNumber}`, 0.6, "neutral", `対象月は、${profile(chart.personalMonthNumber).action}動きが噛み合います。`),
    factor("personal-day", `個人日 ${chart.personalDayNumber}`, 0.42, "neutral", `対象日は、${profile(chart.personalDayNumber).core}行動を小さく実行する日に向きます。`),
  ];
}

function synthesize(
  chart: NumerologyBaseChart,
  domain: Domain,
  conclusion: string,
  advice: string[],
): NumerologyTopicSynthesis {
  const factors = factorsFor(chart, domain);
  return {
    conclusion,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    advice,
    factors,
  };
}

export function buildNumerologySynthesis(chart: NumerologyBaseChart): NumerologySynthesis {
  const life = profile(chart.lifePathNumber);
  const birth = profile(chart.birthDayNumber);
  const attitude = profile(chart.attitudeNumber);
  const love = synthesize(
    chart,
    "love",
    `恋愛では、${life.love}ことが関係の中心です。自然な愛情表現として${birth.love}傾向も加わります。出会った直後の印象と、親密になった後に求める安心には差が出るため、長く続く関係では両方を言葉にすることが大切です。`,
    [life.action, "好意、生活上の約束、一人の時間、負担の分担を別々に確認しましょう。"],
  );
  const marriage = synthesize(
    chart,
    "love",
    `結婚では、${life.love}という関係への望みと、${birth.love}という自然な愛情表現を共同生活へ落とし込むことが中心です。現在繰り返しやすい課題は、二人で定期的に話し合う生活上のテーマとして扱います。`,
    ["家計、仕事、家事、自由時間、家族との距離を、感情とは別の合意事項として言葉にしましょう。", life.action],
  );
  const career = synthesize(
    chart,
    "career",
    `${life.career}ことが長期的な仕事軸です。実務では${birth.career}力が自然に表れ、周囲からは${attitude.career}役割を任されやすくなります。現在は、得意なことをどの規模まで育てるかを決める段階です。`,
    [life.action, "一年のテーマを四半期目標へ、今月の流れを一つの具体的な行動へ変えましょう。"],
  );
  const money = synthesize(
    chart,
    "money",
    `金運は、${life.money}ことを主軸に、${birth.money}力を収益化の手段として使う形です。今は長く育てる対象を選び、浪費や停滞につながる癖を管理することが大切です。`,
    [birth.action, "収入を作る力、支出を管理する力、長期で残す仕組みを別々に設計しましょう。"],
  );
  const talent = synthesize(
    chart,
    "talent",
    `中核の才能は${life.talent}、自然に使える武器は${birth.talent}です。周囲から認識されやすい見せ方と、今その力を育てる方向を重ねることで、得意なことを仕事や役割へつなげやすくなります。`,
    [life.action, birth.action, "得意なことを繰り返し使える役割と、成果を観測できる指標を一つ決めましょう。"],
  );

  return {
    love: {
      ...love,
      compatiblePartner: `${life.partner}が合います。あなたの自然な愛情表現を理解し、繰り返しやすい課題を一緒に調整できることが長期相性の条件です。`,
      difficultPartner: `${life.friction}を増幅し、${birth.friction}について確認を拒む相手とは摩擦が続きやすくなります。実際の境界線と責任分担を優先して判断します。`,
    },
    marriage,
    career,
    money,
    talent,
  };
}
