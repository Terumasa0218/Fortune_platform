import type { ElementBalance, FiveElement, HeavenlyStem } from "./bazi-types";

const DAY_STEM_INTERPRETATION: Record<
  HeavenlyStem,
  {
    personality: string;
    talent: string;
    destiny: string;
    loveStyle: string;
  }
> = {
  甲: {
    personality: "大木のような堂々とした存在感。真っ直ぐな正義感と強いリーダーシップを持つ。",
    talent: "開拓と成長の力。新しい分野で先頭に立ち、周囲を引っ張る天性のリーダー。",
    destiny: "困難を乗り越えながら大きく成長する運命。試練が魂を磨き、天命を開く。",
    loveStyle: "一途で誠実。パートナーを大切に守る愛情深いタイプ。",
  },
  乙: {
    personality: "柔軟な草木のように環境に適応する。しなやかな強さと繊細な感受性を持つ。",
    talent: "適応力と協調性。どんな環境でも自分らしさを保ちながら成長する力。",
    destiny: "縁と絆によって運が開く。人との出会いが人生の転機をもたらす。",
    loveStyle: "優しく包容力がある。相手に寄り添い、関係を丁寧に育てる。",
  },
  丙: {
    personality: "太陽のように明るく情熱的。周囲を照らす華やかなエネルギーを持つ。",
    talent: "表現力と人を惹きつけるカリスマ。舞台の中心で輝く才能。",
    destiny: "光と影の両方を体験しながら、人々に希望を与える使命を持つ。",
    loveStyle: "情熱的でオープン。愛情を全力で表現し、相手を幸せにしたいと願う。",
  },
  丁: {
    personality: "ろうそくの炎のように温かく内省的。深い感情と繊細な直感を持つ。",
    talent: "芸術的感受性と集中力。一点に深く向き合い、本質を照らし出す力。",
    destiny: "内なる光を磨くことで周囲を癒す使命。孤独の中に深い智慧が育つ。",
    loveStyle: "深く純粋な愛情。特定の相手に深く熱中し、献身的に愛し続ける。",
  },
  戊: {
    personality: "山のように安定した存在感。揺るぎない信念と包容力を持つ大地の人。",
    talent: "包容力と信頼性。人々の拠り所となり、組織の要として機能する力。",
    destiny: "安定と信頼を築くことが天命。長期的な視点で大きな成果を生む運命。",
    loveStyle: "安定と誠実さを大切にする。ゆっくりと信頼を積み上げる愛のスタイル。",
  },
  己: {
    personality: "肥沃な大地のように豊かな内面。実用的で思いやりがあり、縁の下の力持ち。",
    talent: "育む力と実務能力。地道な積み重ねで確実な結果を出す堅実な才能。",
    destiny: "奉仕と育成によって運が開く。人を育てることで自分も成長する運命。",
    loveStyle: "家庭的で献身的。相手の成長を支え、安心できる関係を築く。",
  },
  庚: {
    personality: "鋼鉄のような強さと鋭さを持つ。正義感が強く、妥協を許さない硬派な人物。",
    talent: "決断力と実行力。困難な状況でも揺るがない意志で目標を達成する力。",
    destiny: "試練と鍛錬によって本物の強さを手に入れる運命。困難が宝石を磨く。",
    loveStyle: "一度決めたら一途。不器用でも真剣にパートナーを守り抜く。",
  },
  辛: {
    personality: "宝石のような美しさと鋭さを持つ。繊細な感受性と高い美意識を兼ね備える。",
    talent: "審美眼と精密さ。美しいものを見極め、洗練された形に仕上げる才能。",
    destiny: "美と真実の追求が天命。磨かれるほどに輝きを増す宝石のような人生。",
    loveStyle: "理想を持つロマンティスト。完璧な愛を求め、洗練された関係を好む。",
  },
  壬: {
    personality: "大海のような広大な包容力。自由を愛し、どこへでも流れていく変化の人。",
    talent: "柔軟性と大局観。状況を読んで流れを作り出す知性と適応力。",
    destiny: "変化と流動の中に使命がある。多くの場所と人を経験することで天命が開く。",
    loveStyle: "自由と冒険を愛する。束縛を嫌い、お互いの個性を尊重する関係を好む。",
  },
  癸: {
    personality: "雨露のような繊細さと浸透力。深い感受性と直感力を持つ内省的な人物。",
    talent: "直感と洞察力。表面には見えない本質を感じ取り、深い知恵を生み出す力。",
    destiny: "内省と浄化を通じて魂が深まる運命。静かな水面の下に大きな力を秘める。",
    loveStyle: "感受性豊かで共感力が高い。相手の気持ちを深く理解し、寄り添う愛。",
  },
};

const ELEMENT_BALANCE_SUPPLEMENT: Record<FiveElement, string> = {
  木: "命式に木の気が強く、成長と発展のエネルギーに恵まれています。",
  火: "命式に火の気が強く、情熱と表現力に溢れています。",
  土: "命式に土の気が強く、安定と信頼のエネルギーを持っています。",
  金: "命式に金の気が強く、決断力と実行力に優れています。",
  水: "命式に水の気が強く、知恵と柔軟性に恵まれています。",
};

export function interpretBaziChart(params: {
  yearPillar: { stem: HeavenlyStem };
  monthPillar: { stem: HeavenlyStem };
  dayPillar: { stem: HeavenlyStem };
  elementBalance: ElementBalance;
  dominantElement: FiveElement;
}): { personality: string; talent: string; destiny: string; loveStyle: string } {
  const base = DAY_STEM_INTERPRETATION[params.dayPillar.stem];
  const supplement = ELEMENT_BALANCE_SUPPLEMENT[params.dominantElement];

  return {
    personality: `${base.personality}\n\n${supplement}`,
    talent: base.talent,
    destiny: base.destiny,
    loveStyle: base.loveStyle,
  };
}
