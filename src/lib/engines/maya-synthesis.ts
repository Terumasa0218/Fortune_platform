import type { MayaBaseChart, MayaDaySign } from "./maya";

export type MayaInterpretationProvenance =
  | "classic-calendar"
  | "living-kiche-tradition"
  | "modern-symbolic";

export type MayaSynthesisFactor = {
  code: string;
  source: string;
  weight: number;
  polarity: "strength" | "challenge" | "neutral";
  provenance: MayaInterpretationProvenance;
  interpretation: string;
};

export type MayaTopicSynthesis = {
  conclusion: string;
  strengths: string[];
  challenges: string[];
  advice: string[];
  factors: MayaSynthesisFactor[];
};

export type MayaSynthesis = {
  love: MayaTopicSynthesis & {
    compatiblePartner: string;
    difficultPartner: string;
  };
  marriage: MayaTopicSynthesis;
  career: MayaTopicSynthesis;
  money: MayaTopicSynthesis;
  talent: MayaTopicSynthesis;
};

type Domain = "love" | "career" | "money" | "talent";

type DaySignProfile = {
  love: string;
  partner: string;
  friction: string;
  career: string;
  money: string;
  talent: string;
  action: string;
};

const PROFILE: Record<string, DaySignProfile> = {
  Imix: { love: "安心できる関係を自分から育てる", partner: "感情の波を受け止め、始めた関係を一緒に育てる人", friction: "世話を焼きすぎることと、気分で関係の方向を変えること", career: "立ち上げ、育成、生活を支える仕事", money: "新しい価値の種を見つけ、時間をかけて育てる", talent: "何もない所から流れを起こし、人や企画を養う力", action: "育てる対象を一つ選び、継続条件を決める" },
  Ik: { love: "会話と率直な意思表示で距離を縮める", partner: "言葉の意図を確認し、対話を止めない人", friction: "言葉が先走ることと、伝えたつもりになること", career: "発信、教育、営業、情報を運ぶ仕事", money: "情報と言語化を、人が使える価値へ変える", talent: "複雑な空気を言葉にし、人の意識を動かす力", action: "伝える目的と受け手を一つに絞る" },
  Akbal: { love: "静かな安心と内面の共有から親密さを作る", partner: "一人の時間と繊細な感情を尊重できる人", friction: "想像の中で不安を大きくし、説明せず閉じること", career: "研究、相談、物語、安心できる場を作る仕事", money: "内面への洞察を、相談や創作として形にする", talent: "見えにくい感情や可能性を受け取り、居場所を作る力", action: "直感を記録し、現実の小さな行動で確かめる" },
  Kan: { love: "互いの可能性を信じ、成長を支える", partner: "急かさず、努力と変化を具体的に応援できる人", friction: "準備と期待だけが増え、関係を現実に進めないこと", career: "企画、育成、研究開発、将来性を見つける仕事", money: "小さな可能性へ選択的に投資し、育てて回収する", talent: "まだ形になっていない資質と成長条件を見抜く力", action: "完成を待たず、小さな成果を外へ出す" },
  Chicchan: { love: "身体感覚と強い惹かれ方を率直に表す", partner: "情熱を恐れず、境界線も明確にできる人", friction: "衝動的な反応と、熱量を相手にも要求すること", career: "現場、表現、競技、即応力を使う仕事", money: "行動速度と存在感を成果へ結びつける", talent: "本能的に好機と危険を察知し、場を動かす力", action: "大きく反応する前に身体を整え、目的を確認する" },
  Cimi: { love: "変化や喪失も含めて深く関係に向き合う", partner: "終わりと再出発を誠実に話し合える人", friction: "過去を手放せないことと、急に関係を断つこと", career: "再建、危機対応、移行支援、終結を扱う仕事", money: "不要な支出や事業を整理し、資源を再配置する", talent: "終えるべき段階を見極め、次の形へ移す力", action: "残すもの、終えるもの、始めるものを分ける" },
  Manik: { love: "具体的に助け、行動で愛情を示す", partner: "世話を当然視せず、負担を返せる人", friction: "救済役になり、自分の疲れを後回しにすること", career: "医療福祉、技術、手仕事、実務支援", money: "再現できる技能と信頼を継続収入へ変える", talent: "手を動かして問題を整え、人や場を回復させる力", action: "支援範囲と対価を先に決める" },
  Lamat: { love: "楽しさ、美しさ、触れ合いを分かち合う", partner: "喜びを共有しながら生活の軸も保てる人", friction: "刺激を追い、約束や優先順位が散ること", career: "芸術、美容、接客、魅力を広げる仕事", money: "美意識と満足感を商品や体験へ変える", talent: "人が惹かれる調和を作り、価値を増幅する力", action: "選択肢を絞り、一つの美意識を継続して磨く" },
  Muluk: { love: "感情を深く交換し、献身でつながる", partner: "感情を受け止めつつ、互いの責任を分けられる人", friction: "相手の感情まで抱え込み、境界線を失うこと", career: "ケア、心理、調整、感情を扱う仕事", money: "信頼と回復を提供し、適切な対価の循環を作る", talent: "滞った感情を動かし、関係や場を浄化する力", action: "感じることと引き受けることを分ける" },
  Ok: { love: "信頼と忠誠を積み重ねて関係を守る", partner: "約束を守り、仲間として長く協力できる人", friction: "合わない関係にも義理で留まり続けること", career: "チーム運営、顧客関係、共同体を支える仕事", money: "長期顧客と信用を安定した収益へ変える", talent: "人をつなぎ、安心して協力できる関係を作る力", action: "誰に時間と忠誠を向けるかを選び直す" },
  Chuwen: { love: "遊び心と物語を共有して恋を育てる", partner: "自由な発想を楽しみ、必要な約束は守れる人", friction: "深刻な話や責任を後回しにすること", career: "創作、企画、教育、娯楽、編集", money: "発想と物語を完成した作品や企画へ変える", talent: "既存の要素を組み替え、人の想像力を開く力", action: "遊びの時間と仕上げる締切を両方置く" },
  Eb: { love: "共に学び、人生の道筋を分かち合う", partner: "経験を尊重し、互いの進路を応援できる人", friction: "相手の進路を優先し、自分の望みを失うこと", career: "教育、案内、相談、人の成長を支える仕事", money: "経験と手順を、学びや支援サービスへ変える", talent: "経験を意味のある道筋へ整理し、人を導く力", action: "自分の進路と他者支援の時間を分ける" },
  Ben: { love: "将来像と家庭の基盤を一緒に築く", partner: "責任と理想を分担し、柔軟に運用できる人", friction: "理想や保護者役を背負いすぎること", career: "組織運営、家族支援、理念を形にする仕事", money: "長期目標と生活基盤を優先して資産を作る", talent: "志を立て、集団が頼れる軸を作る力", action: "守る対象と自分だけでは担わない範囲を決める" },
  Ix: { love: "直感的な共鳴と深い個性を大切にする", partner: "感覚を否定せず、言葉で確認もできる人", friction: "察してほしい期待と、説明不足による距離", career: "自然、芸術、研究、独自感性を使う仕事", money: "希少な視点と独自性を理解可能な形で届ける", talent: "目に見えない変化を察し、独自の魅力へ変える力", action: "直感の根拠と相手に必要な説明を添える" },
  Men: { love: "互いの自由と未来像を尊重する", partner: "遠い目標を共有し、日常の実務も担える人", friction: "未来ばかり見て、今の感情や生活を置き去りにすること", career: "戦略、企画、国際領域、全体を見る仕事", money: "大きな流れを読み、長期的な機会へ資源を配る", talent: "高い視点から全体像と次の可能性を見抜く力", action: "ビジョンを今週の具体的な工程へ落とす" },
  Kib: { love: "経験から学び、成熟した関係を選ぶ", partner: "過去の誤りを責め続けず、知恵へ変えられる人", friction: "正しさや反省を求めすぎ、感情を裁くこと", career: "分析、監査、改善、助言、専門職", money: "経験知と精度を、信頼される専門価値へ変える", talent: "複雑な経験を整理し、再発を防ぐ知恵にする力", action: "正解を示す前に、相手の事情と目的を確認する" },
  Kaban: { love: "変化を共有し、関係を更新し続ける", partner: "変化を恐れず、生活リズムを一緒に整えられる人", friction: "環境変化へ反応しすぎ、落ち着く前に結論を出すこと", career: "変革、情報分析、移動、環境を読む仕事", money: "変化の兆しを捉え、収入源や運用を適応させる", talent: "複数の変化を同期させ、進化の方向を見つける力", action: "変える部分と固定する生活基盤を分ける" },
  Etznab: { love: "曖昧さを避け、本音と境界線を明確にする", partner: "真実を隠さず、言葉の鋭さも調整できる人", friction: "正論で切り込み、修復の余地まで断つこと", career: "検証、法務、品質管理、問題を明らかにする仕事", money: "無駄や不透明さを見抜き、収支を明確にする", talent: "矛盾を映し出し、必要な判断を下す力", action: "指摘と同時に、改善案と伝え方を用意する" },
  Kawak: { love: "停滞を揺さぶり、関係を新しくする", partner: "強い変化の後に安心と修復を作れる人", friction: "勢いで状況を壊し、着地点を用意しないこと", career: "改革、危機対応、新規事業、再生", money: "停滞した資源を動かし、新しい循環を作る", talent: "古い状態を刷新し、人や組織を再起動する力", action: "変革後の運用者、期限、回復手順まで決める" },
  Ajaw: { love: "明るく率直に愛情を示し、関係を完成へ導く", partner: "存在感を競わず、成果と弱さの両方を共有できる人", friction: "理想の関係像を強め、影や失敗を見ないこと", career: "代表、表現、統合、成果を世に示す仕事", money: "完成度と信用を高め、広く価値を届ける", talent: "物事をまとめ上げ、人を照らす形で示す力", action: "完成の基準を決め、学びと成果を分かち合う" },
};

function profile(daySign: MayaDaySign): DaySignProfile {
  return PROFILE[daySign.name] ?? PROFILE.Ajaw;
}

function domainText(item: DaySignProfile, domain: Domain): string {
  return item[domain];
}

function factor(
  code: string,
  source: string,
  weight: number,
  polarity: MayaSynthesisFactor["polarity"],
  provenance: MayaInterpretationProvenance,
  interpretation: string,
): MayaSynthesisFactor {
  return { code, source, weight, polarity, provenance, interpretation };
}

function factorsFor(chart: MayaBaseChart, domain: Domain): MayaSynthesisFactor[] {
  const birth = profile(chart.daySign);
  const trecena = profile(chart.trecenaSign);
  const target = profile(chart.timing.target.daySign);
  const tradition = chart.daySign.livingTradition;
  const nextExact = chart.timing.upcomingResonanceWindows.find((item) =>
    item.matches.includes("exact-tzolkin-return"),
  );

  return [
    factor("living-tradition", `K'iche' Chol Q'ij ${tradition.name} / Yucatec ${chart.daySign.name}`, 0.92, "strength", "living-kiche-tradition", `生まれ持った資質として、${tradition.qualities.join("・")}が強調されます。`),
    ...(tradition.cautions.length
      ? [factor("living-tradition-caution", `${tradition.name} の伝統的注意点`, 0.76, "challenge", "living-kiche-tradition", tradition.cautions.join("。"))]
      : []),
    factor("birth-day-sign", `出生ツォルキン ${chart.tone} ${chart.daySign.name}`, 0.82, "strength", "modern-symbolic", `${domain === "love" ? "関係性" : domain === "career" ? "仕事" : domain === "money" ? "価値の生み方" : "才能"}では、${domainText(birth, domain)}傾向です。`),
    factor("birth-day-sign-shadow", `出生日名 ${chart.daySign.name} の現代的調整テーマ`, 0.7, "challenge", "modern-symbolic", birth.friction),
    factor("birth-trecena", `出生トレセーナ 1 ${chart.trecenaSign.name}`, 0.74, "strength", "modern-symbolic", `長期的には、${domainText(trecena, domain)}方向を育てると持ち味が安定します。`),
    factor("target-day", `対象日 ${chart.timing.target.calendarRound}`, 0.42, "neutral", "modern-symbolic", `対象日の象徴は「${domainText(target, domain)}」。長期資質を上書きせず、その日の焦点として使います。`),
    factor("target-trecena", `対象トレセーナ ${chart.timing.targetTrecenaWindow.startDate}〜${chart.timing.targetTrecenaWindow.endDate}`, 0.48, "neutral", "classic-calendar", `${chart.timing.target.trecenaSign.name}の13日区間に位置します。これは暦上の期間特定であり、吉凶や出来事を保証しません。`),
    factor("next-return", `次の出生ツォルキン回帰 ${chart.timing.nextTzolkinReturnDate}`, 0.62, "neutral", "classic-calendar", nextExact ? `対象日から${nextExact.offsetDays}日後に、出生時と同じ係数と日名が再び一致します。` : "出生時と同じ係数と日名が対象日に一致しています。"),
  ];
}

function synthesize(
  chart: MayaBaseChart,
  domain: Domain,
  conclusion: string,
  advice: string[],
): MayaTopicSynthesis {
  const factors = factorsFor(chart, domain);
  return {
    conclusion,
    strengths: factors.filter((item) => item.polarity === "strength").map((item) => item.interpretation),
    challenges: factors.filter((item) => item.polarity === "challenge").map((item) => item.interpretation),
    advice,
    factors,
  };
}

export function buildMayaSynthesis(chart: MayaBaseChart): MayaSynthesis {
  const birth = profile(chart.daySign);
  const trecena = profile(chart.trecenaSign);
  const tradition = chart.daySign.livingTradition;
  const love = synthesize(
    chart,
    "love",
    `恋愛では、${birth.love}ことが中心です。${tradition.qualities.join("・")}という生まれ持った資質も、相手への向き合い方に表れます。`,
    [birth.action, "好意、境界線、生活上の約束を別々に言葉にしましょう。"],
  );
  const marriage = synthesize(
    chart,
    "love",
    `長期関係では、${tradition.qualities.join("・")}という資質と、${birth.love}傾向を日常の役割へ落とし込みます。${birth.friction}ことは、二人で整える課題です。`,
    ["家計、仕事、家事、一人の時間、家族との距離を具体的に合意しましょう。", birth.action],
  );
  const career = synthesize(
    chart,
    "career",
    `仕事では、${tradition.qualities.join("・")}という資質を土台に、${birth.career}働き方で力を発揮しやすいでしょう。`,
    [birth.action, "象徴を職種名で断定せず、実際に繰り返し成果が出る作業を観測しましょう。"],
  );
  const money = synthesize(
    chart,
    "money",
    `金運では、${tradition.qualities.join("・")}という資質を活かし、${birth.money}ことが収入につながりやすいでしょう。`,
    [birth.action, "収入を作る力、支出を管理する力、長期で残す仕組みを別々に設計しましょう。"],
  );
  const talent = synthesize(
    chart,
    "talent",
    `中核となる資質は、${tradition.qualities.join("・")}です。特に、${birth.talent}力として育ちやすいでしょう。`,
    [birth.action, trecena.action, "得意な行動を反復できる役割と、成果を確認できる指標を一つ決めましょう。"],
  );

  return {
    love: {
      ...love,
      compatiblePartner: `${birth.partner}と噛み合いやすいと読みます。日名だけで二者相性を確定せず、実際の価値観、境界線、責任分担を優先します。`,
      difficultPartner: `${birth.friction}を繰り返し増幅し、話し合いや修復を拒む相手とは摩擦が続きやすいと読みます。`,
    },
    marriage,
    career,
    money,
    talent,
  };
}
