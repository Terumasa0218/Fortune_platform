import {
  BirthProfileInput,
  DetailedFortuneResult,
  FortuneSection,
  FortuneSignal,
  confidenceFromScore,
  parseBirthParts,
  sectionsToDomainReadings,
} from "./types";

type MayaDaySign = {
  name: string;
  japaneseName: string;
  keywords: string[];
  talent: string;
  challenge: string;
  advice: string;
};

export type MayaChart = {
  tone: number;
  daySign: MayaDaySign;
  cycleDay: number;
  trecenaTone: number;
  trecenaSign: MayaDaySign;
  longCount: {
    baktun: number;
    katun: number;
    tun: number;
    uinal: number;
    kin: number;
    formatted: string;
    totalDays: number;
  };
  haab: {
    day: number;
    month: string;
    dayOfYear: number;
    formatted: string;
  };
  calendarRound: string;
  lordOfNight: number;
  correlationConstant: 584283;
  baseCorrelation: string;
  calculationScope: "classic-calendar-round-v2";
  system: "classic-maya-gmt";
};

const DAY_SIGNS: MayaDaySign[] = [
  { name: "Imix", japaneseName: "イミシュ", keywords: ["始まり", "生命力", "養育"], talent: "新しい流れを生み、周囲に生命力を与える力があります。", challenge: "感情の波に飲まれると、始めたことが散らばりやすいです。", advice: "始まりの衝動を小さな形にして、育てる対象を絞りましょう。" },
  { name: "Ik", japaneseName: "イク", keywords: ["風", "言葉", "伝達"], talent: "言葉や情報を運び、人の意識を動かす力があります。", challenge: "言葉が先走ると、意図が誤解されやすくなります。", advice: "伝える前に目的を一つ定めると、影響力が増します。" },
  { name: "Akbal", japaneseName: "アクバル", keywords: ["夢", "内面", "受容"], talent: "無意識の声を受け取り、安心できる居場所を作れます。", challenge: "内側にこもりすぎると、現実の機会を逃しやすいです。", advice: "夢や直感をメモし、日常の行動へ変換しましょう。" },
  { name: "Kan", japaneseName: "カン", keywords: ["種", "可能性", "集中"], talent: "可能性の種を見つけ、成長の条件を整える力があります。", challenge: "準備に偏ると、芽を出すタイミングが遅れます。", advice: "小さく公開しながら育てると、才能が現実化します。" },
  { name: "Chicchan", japaneseName: "チークチャン", keywords: ["本能", "情熱", "身体感覚"], talent: "身体感覚と情熱で、生命力のある選択ができます。", challenge: "衝動が強い時は、反応が極端になりやすいです。", advice: "身体を整える習慣が、直感の精度を上げます。" },
  { name: "Cimi", japaneseName: "キミ", keywords: ["変容", "手放し", "再生"], talent: "終わらせるべきものを見極め、次の段階へ移る力があります。", challenge: "変化への恐れから、古い形に留まりやすいです。", advice: "終わりを失敗ではなく移行として扱いましょう。" },
  { name: "Manik", japaneseName: "マニク", keywords: ["癒し", "手仕事", "実践"], talent: "手を動かし、具体的な行為で人や場を癒す力があります。", challenge: "助ける役割に入りすぎると、自分の疲れに鈍くなります。", advice: "技術を磨くほど、癒しが再現可能な才能になります。" },
  { name: "Lamat", japaneseName: "ラマト", keywords: ["美", "豊かさ", "調和"], talent: "美しさや楽しさを広げ、場を明るく豊かにする力があります。", challenge: "刺激や楽しさを追いすぎると、中心がぶれます。", advice: "美意識を基準に選ぶと、自然に人を惹きつけます。" },
  { name: "Muluk", japaneseName: "ムルク", keywords: ["感情", "浄化", "献身"], talent: "感情を通して深くつながり、浄化と再調整を起こせます。", challenge: "感情を抱え込みすぎると、境界線が曖昧になります。", advice: "感じたことを流す習慣を持つと、献身が軽やかになります。" },
  { name: "Ok", japaneseName: "オク", keywords: ["信頼", "忠誠", "仲間"], talent: "信頼できる関係を作り、チームの絆を強める力があります。", challenge: "忠誠心が強すぎると、合わない場所から離れにくくなります。", advice: "誰に力を注ぐかを選ぶことが、運を開きます。" },
  { name: "Chuwen", japaneseName: "チュエン", keywords: ["遊び", "創造", "物語"], talent: "遊び心で新しい物語を作り、人の想像力を開きます。", challenge: "自由さが強い時は、責任や締切が後回しになります。", advice: "遊びを作品や企画に変える枠組みを持ちましょう。" },
  { name: "Eb", japaneseName: "エブ", keywords: ["道", "学び", "人間性"], talent: "経験を道に変え、人が成長するプロセスを支えられます。", challenge: "人の道を優先しすぎると、自分の進路が薄れます。", advice: "自分の学びを共有すると、導く力が育ちます。" },
  { name: "Ben", japaneseName: "ベン", keywords: ["柱", "志", "家族"], talent: "志を立て、人や共同体の柱になる力があります。", challenge: "理想を背負いすぎると、柔軟さを失います。", advice: "守るものを明確にしつつ、支え合う形を作りましょう。" },
  { name: "Ix", japaneseName: "イシュ", keywords: ["魔法", "自然", "直感"], talent: "自然な流れや見えない気配を読み、独自の魅力を発揮します。", challenge: "感覚が鋭いぶん、説明不足になりやすいです。", advice: "直感を言語化すると、周囲と力を合わせやすくなります。" },
  { name: "Men", japaneseName: "メン", keywords: ["俯瞰", "ビジョン", "自由"], talent: "高い視点から全体を見て、未来の可能性を見抜けます。", challenge: "遠くを見すぎると、足元の実務が薄くなります。", advice: "ビジョンを短期計画に落とすと、自由が成果になります。" },
  { name: "Kib", japaneseName: "キブ", keywords: ["知恵", "浄化", "成熟"], talent: "経験から知恵を取り出し、複雑な問題を整理できます。", challenge: "正しさに寄りすぎると、人の感情を置き去りにします。", advice: "知恵をやわらかく伝えるほど、信頼が増します。" },
  { name: "Kaban", japaneseName: "カバン", keywords: ["地球", "同期", "進化"], talent: "変化の兆しを感じ取り、流れに合わせて進化できます。", challenge: "環境変化に敏感で、安定を失いやすいです。", advice: "身体感覚と生活リズムを整えると、変化に強くなります。" },
  { name: "Etznab", japaneseName: "エツナブ", keywords: ["鏡", "真実", "切断"], talent: "曖昧なものを映し出し、必要な真実を明らかにできます。", challenge: "鋭さが強い時は、言葉が切れ味を持ちすぎます。", advice: "真実と優しさを両立させると、突破力が活きます。" },
  { name: "Kawak", japaneseName: "カワク", keywords: ["嵐", "刷新", "浄化"], talent: "停滞を揺さぶり、古い状態を一気に刷新する力があります。", challenge: "変化の勢いが強く、周囲を驚かせやすいです。", advice: "刷新の後に安心できる着地点を用意しましょう。" },
  { name: "Ajaw", japaneseName: "アハウ", keywords: ["太陽", "完成", "祝福"], talent: "物事を完成へ導き、明るさと存在感で人を照らせます。", challenge: "理想の光が強いぶん、影の部分を避けやすいです。", advice: "完成後に学びを分かち合うと、影響力が広がります。" },
];

const MS_PER_DAY = 86_400_000;
const BASE_DATE_UTC = Date.UTC(2012, 11, 21);
const BASE_TONE = 4;
const BASE_DAY_SIGN_INDEX = 19;
const BASE_LONG_COUNT_DAYS = 13 * 144_000;
const BASE_HAAB_DAY = 13 * 20 + 3;
const BASE_TZOLKIN_POSITION = 160;
const HAAB_MONTHS = [
  "Pop",
  "Wo",
  "Sip",
  "Sotz'",
  "Sek",
  "Xul",
  "Yaxk'in",
  "Mol",
  "Ch'en",
  "Yax",
  "Sak",
  "Keh",
  "Mak",
  "K'ank'in",
  "Muwan",
  "Pax",
  "K'ayab",
  "Kumk'u",
  "Wayeb",
] as const;

function positiveMod(value: number, modulo: number): number {
  return ((value % modulo) + modulo) % modulo;
}

function utcDay(year: number, month: number, day: number): number {
  return Date.UTC(year, month - 1, day);
}

function buildLongCount(totalDays: number): MayaChart["longCount"] {
  let rest = totalDays;
  const baktun = Math.floor(rest / 144_000);
  rest = positiveMod(rest, 144_000);
  const katun = Math.floor(rest / 7_200);
  rest %= 7_200;
  const tun = Math.floor(rest / 360);
  rest %= 360;
  const uinal = Math.floor(rest / 20);
  const kin = rest % 20;

  return {
    baktun,
    katun,
    tun,
    uinal,
    kin,
    formatted: `${baktun}.${katun}.${tun}.${uinal}.${kin}`,
    totalDays,
  };
}

function buildHaab(diffDays: number): MayaChart["haab"] {
  const dayOfYear = positiveMod(BASE_HAAB_DAY + diffDays, 365);
  const monthIndex = dayOfYear < 360 ? Math.floor(dayOfYear / 20) : 18;
  const day = monthIndex === 18 ? dayOfYear - 360 : dayOfYear % 20;
  const month = HAAB_MONTHS[monthIndex];
  return { day, month, dayOfYear, formatted: `${day} ${month}` };
}

export function calcMaya(input: BirthProfileInput): DetailedFortuneResult<MayaChart> {
  const { year, month, day } = parseBirthParts(input.birthDate);
  const diffDays = Math.round((utcDay(year, month, day) - BASE_DATE_UTC) / MS_PER_DAY);
  const tone = positiveMod(BASE_TONE - 1 + diffDays, 13) + 1;
  const daySign = DAY_SIGNS[positiveMod(BASE_DAY_SIGN_INDEX + diffDays, 20)];
  const cycleDay = positiveMod(BASE_TZOLKIN_POSITION - 1 + diffDays, 260) + 1;
  const trecenaOffset = tone - 1;
  const trecenaSign = DAY_SIGNS[positiveMod(BASE_DAY_SIGN_INDEX + diffDays - trecenaOffset, 20)];
  const longCount = buildLongCount(BASE_LONG_COUNT_DAYS + diffDays);
  const haab = buildHaab(diffDays);

  const chart: MayaChart = {
    tone,
    daySign,
    cycleDay,
    trecenaTone: 1,
    trecenaSign,
    longCount,
    haab,
    calendarRound: `${tone} ${daySign.name} ${haab.formatted}`,
    lordOfNight: positiveMod(longCount.totalDays - 1, 9) + 1,
    correlationConstant: 584283,
    baseCorrelation: "GMT 584283: 2012-12-21 = 13.0.0.0.0 / 4 Ajaw / 3 K'ank'in",
    calculationScope: "classic-calendar-round-v2",
    system: "classic-maya-gmt",
  };

  const sections: FortuneSection[] = [
    {
      theme: "personality",
      topic: "coreTalent",
      title: `${tone} ${daySign.name}`,
      summary: `${daySign.japaneseName} は ${daySign.keywords.join("・")} を示します。${daySign.talent}`,
      keywords: daySign.keywords,
      strengths: [daySign.talent],
      challenges: [daySign.challenge],
      advice: [daySign.advice],
      evidence: [
        `${chart.baseCorrelation} を基準に ${diffDays} 日差で算出`,
        `長期暦 ${chart.longCount.formatted} / カレンダーラウンド ${chart.calendarRound}`,
      ],
    },
    {
      theme: "growth",
      topic: "growthAdvice",
      title: `トレセーナ: ${trecenaSign.name}`,
      summary: `成長サイクルの背景には ${trecenaSign.japaneseName} のテーマが流れます。${trecenaSign.talent}`,
      keywords: trecenaSign.keywords,
      strengths: [trecenaSign.talent],
      challenges: [trecenaSign.challenge],
      advice: [trecenaSign.advice],
      evidence: [`音 ${tone} から13日周期の起点を逆算`],
    },
    {
      theme: "love",
      topic: "loveStyle",
      title: "恋愛で表れやすい性質",
      summary: `${daySign.japaneseName} の ${daySign.keywords.join("・")} が、親密な関係での反応にも表れやすいと読みます。`,
      keywords: daySign.keywords,
      strengths: [daySign.talent],
      challenges: [daySign.challenge],
      advice: [daySign.advice],
      evidence: [`ツォルキン ${tone} ${daySign.name}`],
    },
    {
      theme: "love",
      topic: "compatiblePartner",
      title: "恋愛で噛み合う相手",
      summary: `${daySign.japaneseName} の恋愛は、${daySign.keywords.join("・")} の性質を自然に受け止める相手と噛み合いやすいです。`,
      keywords: ["共鳴", ...daySign.keywords],
      strengths: [daySign.talent],
      challenges: [daySign.challenge],
      advice: ["相手に合わせすぎるより、自分のリズムを言葉にして共有すると関係が安定します。"],
      evidence: [`日名 ${daySign.name} / 音 ${tone}`],
    },
    {
      theme: "marriage",
      topic: "marriage",
      title: "長期関係の育て方",
      summary: `${daySign.japaneseName} の強みを日常の役割として活かし、課題を互いに調整できる関係が安定しやすいと読みます。`,
      keywords: ["継続", ...daySign.keywords],
      strengths: [daySign.talent],
      challenges: [daySign.challenge],
      advice: [daySign.advice, "暦日の象徴だけで相性を断定せず、現実の価値観と生活条件も確認します。"],
      evidence: [`カレンダーラウンド ${chart.calendarRound}`],
    },
    {
      theme: "career",
      topic: "successKeys",
      title: "仕事で成功するテーマ",
      summary: `${trecenaSign.japaneseName} の13日サイクルが、仕事で伸ばすべき背景テーマを示します。${trecenaSign.talent}`,
      keywords: trecenaSign.keywords,
      strengths: [trecenaSign.talent],
      challenges: [trecenaSign.challenge],
      advice: [trecenaSign.advice],
      evidence: [`トレセーナ ${trecenaSign.name}`],
    },
    {
      theme: "career",
      topic: "careerStrengths",
      title: "仕事面の長所",
      summary: daySign.talent,
      keywords: daySign.keywords,
      strengths: [daySign.talent],
      challenges: [],
      advice: [daySign.advice],
      evidence: [`ツォルキン ${tone} ${daySign.name}`],
    },
    {
      theme: "career",
      topic: "careerWeaknesses",
      title: "仕事面の注意点",
      summary: daySign.challenge,
      keywords: daySign.keywords,
      strengths: [],
      challenges: [daySign.challenge],
      advice: [daySign.advice],
      evidence: [`ツォルキン ${tone} ${daySign.name}`],
    },
    {
      theme: "money",
      topic: "moneyRisk",
      title: "金運で注意する癖",
      summary: `${daySign.japaneseName} の課題が強く出る時、お金の使い方にも同じ癖が出やすくなります。`,
      keywords: ["使い方", "循環", ...daySign.keywords.slice(0, 2)],
      strengths: [`${daySign.talent} この才能を価値提供に変えると収入につながります。`],
      challenges: [daySign.challenge],
      advice: ["お金は感情の反応で動かすより、目的別に枠を作ると安定します。"],
      evidence: [`日名 ${daySign.name} を金銭傾向へ展開`],
    },
    {
      theme: "money",
      topic: "earningStyle",
      title: "価値を収入へ変える型",
      summary: `${daySign.talent} この性質を、具体的な技能・成果物・支援として反復できる形にすると収入へつながりやすいと読みます。`,
      keywords: ["価値提供", ...daySign.keywords],
      strengths: [daySign.talent],
      challenges: [daySign.challenge],
      advice: [daySign.advice],
      evidence: [`ツォルキン ${tone} ${daySign.name}`],
    },
  ];

  const signals: FortuneSignal[] = sections.flatMap((item) =>
    item.keywords.map((keyword) => ({
      method: "maya",
      theme: item.theme,
      trait: keyword,
      polarity: "strength",
      score: 64,
      confidence: 0.52,
      evidence: item.evidence[0],
    })),
  );

  return {
    method: "maya",
    displayName: "古典マヤ暦",
    version: "maya-classic-gmt-v2",
    inputRequirement: {
      birthDate: "required",
      birthTime: "unused",
      birthPlace: "unused",
    },
    confidence: confidenceFromScore(0.72, [
      "GMT 584283相関で長期暦・ツォルキン・ハアブを一貫して算出しています。",
      "暦変換の信頼性と、出生人格への象徴的解釈の妥当性は別に扱います。",
    ]),
    chart,
    domains: sectionsToDomainReadings(sections, signals),
    sections,
    signals,
    notes: [
      "古典マヤ暦のGMT 584283相関を採用し、Dreamspellや銀河の署名とは混在させません。",
      "ツォルキンは本来、暦日と儀礼の体系です。出生時の才能・恋愛・仕事への展開は現代的な象徴解釈として表示します。",
      "相関定数にはGMT+2などの異説があり、方式を変えると全日付がずれます。採用方式は結果に常時表示します。",
    ],
  };
}
