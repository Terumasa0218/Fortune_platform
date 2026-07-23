import type {
  KyuseiInclination,
  KyuseiMeeting,
  KyuseiMonthlyWindow,
  KyuseiStar,
} from "./kyusei";

export type KyuseiSynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  interpretation: string;
};

export type KyuseiTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: KyuseiSynthesisFactor[];
};

export type KyuseiSynthesis = {
  love: KyuseiTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: KyuseiTopicSynthesis;
  career: KyuseiTopicSynthesis;
  money: KyuseiTopicSynthesis;
  talent: KyuseiTopicSynthesis;
};

type Domain = "love" | "career" | "money" | "talent";

type StarProfile = {
  core: string;
  love: string;
  partner: string;
  friction: string;
  career: string;
  money: string;
  talent: string;
  action: string;
};

const PROFILE: Record<number, StarProfile> = {
  1: { core: "流れを読み、静かに人と情報をつなぐ", love: "時間をかけて本音を確かめ、深い安心を作る", partner: "沈黙や迷いを急かさず、誠実に対話できる人", friction: "不安から結論を先送りし、気持ちを隠すこと", career: "調査、相談、情報、人をつなぐ仕事", money: "情報と信頼を長い関係から収入へ変える", talent: "柔軟性、洞察、人脈を水のようにつなぐ力", action: "一人で考える期限を決め、その後は相談する" },
  2: { core: "人と物事を支え、時間をかけて育てる", love: "世話と日常の行動で愛情を示す", partner: "支援を当然視せず、役割と感謝を返せる人", friction: "我慢と受け身が続き、不満を溜めること", career: "育成、運用、支援、基礎を守る仕事", money: "継続、生活価値、堅実な管理で蓄積する", talent: "小さな努力を積み重ね、確実な土台を作る力", action: "支える範囲と自分で決める範囲を分ける" },
  3: { core: "素早く動き、声と行動で始まりを作る", love: "好意を率直に示し、共有体験から距離を縮める", partner: "行動力を楽しみながら、詰めを補える人", friction: "勢いで約束し、確認や継続を後回しにすること", career: "新規企画、発信、営業、速度を使う仕事", money: "早い情報と行動を機会へ変える", talent: "停滞へ最初の動きと活気を入れる力", action: "動いた後の確認日と仕上げ期限を先に置く" },
  4: { core: "縁を広げ、穏やかな合意へ整える", love: "会話と信頼を積み、自然に関係を育てる", partner: "曖昧さを放置せず、穏やかに決められる人", friction: "全員に合わせて、自分の意思が薄くなること", career: "交渉、広報、調整、流通、遠方との仕事", money: "信用と紹介を継続的な価値へ変える", talent: "異なる人をつなぎ、流れを整える力", action: "譲れない基準を一つ明言してから調整する" },
  5: { core: "中心に立ち、混乱を再編して影響を与える", love: "強い責任感で関係を守り、主導する", partner: "影響力を恐れず、対等に異論を言える人", friction: "自分の正しさで相手を動かし、支配へ傾くこと", career: "経営、危機対応、再建、意思決定", money: "資源を集め、再配置して大きな成果へ変える", talent: "混乱の中心で決断し、全体を再編する力", action: "決定前に反対意見を一つ取り入れる" },
  6: { core: "高い基準と責任で物事を完成へ導く", love: "誠実さ、尊敬、将来への責任を重視する", partner: "自立し、責任と弱さの両方を共有できる人", friction: "完璧さを求め、相手にも厳しくなること", career: "管理、専門職、組織責任、品質を担う仕事", money: "信用、規律、長期計画によって資産を守る", talent: "高い視点で基準を作り、やり抜く力", action: "任せる基準を決め、責任を一人で抱えない" },
  7: { core: "言葉と楽しさで人を惹きつけ、価値を伝える", love: "会話、食事、楽しさを共有して愛情を育てる", partner: "楽しさと生活上の約束を両立できる人", friction: "気分や目先の魅力で約束と支出が緩むこと", career: "接客、営業、表現、娯楽、会話を使う仕事", money: "魅力と説明力を商品や体験へ変える", talent: "人を楽しませ、価値を軽やかに伝える力", action: "楽しむ予算と成果へ戻す導線を決める" },
  8: { core: "蓄積を受け継ぎ、止める力と変える力を使う", love: "簡単に揺らがない関係と家族的な安心を求める", partner: "変化を急かさず、決めた後は共に動ける人", friction: "守るか変えるかで固まり、対話が止まること", career: "承継、不動産、再編、長期事業、専門技能", money: "長期保有、実物価値、蓄積の再編で資産を作る", talent: "過去の資源を守りながら、大きな転換を起こす力", action: "残すもの、変えるもの、期限を別々に決める" },
  9: { core: "本質を見抜き、知性と美意識で可視化する", love: "精神的な刺激と、誇りを持てる関係を求める", partner: "評価だけでなく内面の疲れも受け止められる人", friction: "理想化、批判、周囲の評価で感情が揺れること", career: "教育、分析、表現、美容、評価される仕事", money: "専門知識と見せ方を高付加価値へ変える", talent: "曖昧なものを照らし、魅力的に示す力", action: "評価を見る時間と、自分を回復させる時間を分ける" },
};

type SynthesisInput = {
  honmei: KyuseiStar;
  getsumei: KyuseiStar;
  dayStar: KyuseiStar;
  inclination: KyuseiInclination;
  yearMeeting: KyuseiMeeting;
  monthMeeting: KyuseiMeeting;
  activeMonthlyWindow?: KyuseiMonthlyWindow;
};

function profile(star: KyuseiStar): StarProfile {
  return PROFILE[star.number];
}

function domainText(item: StarProfile, domain: Domain): string {
  return item[domain];
}

function factor(
  code: string,
  source: string,
  weight: number,
  polarity: KyuseiSynthesisFactor["polarity"],
  interpretation: string,
): KyuseiSynthesisFactor {
  return { code, source, weight, polarity, interpretation };
}

function meetingFactor(
  code: string,
  label: string,
  weight: number,
  side: KyuseiMeeting["sameMeeting"],
): KyuseiSynthesisFactor {
  return factor(
    code,
    `${label} ${side.meetingStar.name}・${side.relation.type}`,
    weight,
    side.relation.polarity === "support" ? "strength" : side.relation.polarity === "challenge" ? "challenge" : "neutral",
    `${side.agency === "self-initiated" ? "自分から起こす作用" : "外から受ける作用"}に${side.meetingStar.keywords.join("・")}が重なり、${side.relation.description}です。`,
  );
}

function factorsFor(input: SynthesisInput, domain: Domain): KyuseiSynthesisFactor[] {
  const inclinationStar = input.inclination.star;
  return [
    factor("honmei", `本命星 ${input.honmei.name}`, 0.96, "strength", `${profile(input.honmei).core}性質が長期軸です。${domainText(profile(input.honmei), domain)}方向で力を使いやすくなります。`),
    factor("getsumei", `月命星 ${input.getsumei.name}`, 0.82, "neutral", `内面と反応には、${profile(input.getsumei).core}性質が重なります。`),
    ...(inclinationStar
      ? [factor("inclination", `傾斜 ${input.inclination.palace}・${inclinationStar.name}`, 0.74, "neutral", `表に出にくい動機は、${domainText(profile(inclinationStar), domain)}ことです。`)]
      : []),
    factor("day-star", `日家九星 ${input.dayStar.name}`, 0.56, "neutral", `具体的な行動には、${profile(input.dayStar).core}反応が出やすくなります。`),
    meetingFactor("year-same-meeting", "年の同会", 0.68, input.yearMeeting.sameMeeting),
    meetingFactor("year-received-meeting", "年の被同会", 0.68, input.yearMeeting.receivedMeeting),
    meetingFactor("month-same-meeting", "月の同会", 0.58, input.monthMeeting.sameMeeting),
    meetingFactor("month-received-meeting", "月の被同会", 0.58, input.monthMeeting.receivedMeeting),
  ];
}

function synthesize(
  input: SynthesisInput,
  domain: Domain,
  conclusion: string,
  advice: string[],
): KyuseiTopicSynthesis {
  const factors = factorsFor(input, domain);
  return {
    conclusion,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    advice,
    factors,
  };
}

export function buildKyuseiSynthesis(input: SynthesisInput): KyuseiSynthesis {
  const honmei = profile(input.honmei);
  const getsumei = profile(input.getsumei);
  const inclination = input.inclination.star ? profile(input.inclination.star) : undefined;
  const timingLabel = input.activeMonthlyWindow
    ? `${input.activeMonthlyWindow.termName}節の支援度${input.activeMonthlyWindow.supportScore > 0 ? "+" : ""}${input.activeMonthlyWindow.supportScore}`
    : "対象節月";
  const love = synthesize(
    input,
    "love",
    `恋愛の中心は本命星${input.honmei.name}の「${honmei.love}」です。月命星${input.getsumei.name}の「${getsumei.love}」が親密になった後の反応に加わり、${inclination ? `傾斜${input.inclination.star?.name}の「${inclination.love}」が無意識の欲求を補います。` : "中宮傾斜は確定せず、本命星と月命星を中心に読みます。"}`,
    [honmei.action, "好意、境界線、連絡、生活上の責任を別々に確認しましょう。"],
  );
  const marriage = synthesize(
    input,
    "love",
    `結婚では本命星${input.honmei.name}の長期姿勢と、月命星${input.getsumei.name}の内面的な安心条件を共同生活へ落とし込みます。${honmei.friction}と${getsumei.friction}を繰り返す運用課題として扱います。`,
    ["家計、家事、仕事、一人の時間、家族との距離を具体的に合意しましょう。", honmei.action],
  );
  const career = synthesize(
    input,
    "career",
    `仕事の長期軸は本命星${input.honmei.name}の「${honmei.career}」、内側の働き方は月命星${input.getsumei.name}の「${getsumei.career}」です。${timingLabel}を、能力そのものではなく現在の使いやすさとして重ねます。`,
    [honmei.action, "回座宮の役割を月の一つの成果へ変え、同会と被同会を自発・他動に分けて対処しましょう。"],
  );
  const money = synthesize(
    input,
    "money",
    `金運は本命星${input.honmei.name}の「${honmei.money}」を収益と蓄積の軸に、月命星${input.getsumei.name}の「${getsumei.money}」を日常的な金銭反応として読みます。${timingLabel}は判断負荷の目安です。`,
    [honmei.action, "収入、支出、蓄積を別々に管理し、支援度が低い月は判断額と予定を小さくしましょう。"],
  );
  const talent = synthesize(
    input,
    "talent",
    `中核の才能は本命星${input.honmei.name}の「${honmei.talent}」、自然な内面資質は月命星${input.getsumei.name}の「${getsumei.talent}」です。${inclination ? `傾斜${input.inclination.star?.name}の「${inclination.talent}」が潜在力として重なります。` : "傾斜宮なしのため二星を中心にします。"}`,
    [honmei.action, getsumei.action, "繰り返し成果が出る役割と、消耗が増える条件を記録しましょう。"],
  );

  return {
    love: {
      ...love,
      compatiblePartner: `${honmei.partner}と噛み合いやすいと読みます。さらに月命星${input.getsumei.name}の内面を急かさず、${getsumei.action}姿勢を共有できることが長期条件です。`,
      difficultPartner: `${honmei.friction}を増幅し、${getsumei.friction}について話し合えない相手とは摩擦が続きやすくなります。星だけで断定せず、実際の境界線と責任分担を優先します。`,
    },
    marriage,
    career,
    money,
    talent,
  };
}
