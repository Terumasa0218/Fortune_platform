export type TarotCard = {
  id: number; // 0〜21
  name: string; // 日本語名
  nameEn: string; // 英語名
  upright: string; // 正位置の意味（1〜2文で簡潔に）
  reversed: string; // 逆位置の意味（1〜2文で簡潔に）
  emoji: string; // カードを象徴する絵文字1つ
};

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0,
    name: '愚者',
    nameEn: 'The Fool',
    upright: '新しい冒険が始まる兆しです。直感を信じて一歩踏み出すことで道が開けます。',
    reversed: '無計画さや現実逃避に注意が必要です。勢いだけで進まず足元を確認しましょう。',
    emoji: '🌟',
  },
  {
    id: 1,
    name: '魔術師',
    nameEn: 'The Magician',
    upright: '才能と行動力がかみ合い、望む現実を形にできる時です。自信を持って始めましょう。',
    reversed: '自信の空回りや見せかけの言葉に気をつけるべき時です。目的を明確にして誠実に進みましょう。',
    emoji: '🎩',
  },
  {
    id: 2,
    name: '女教皇',
    nameEn: 'The High Priestess',
    upright: '静かな洞察力が冴え、物事の本質を見抜けます。焦らず内なる声に耳を傾けるのが吉です。',
    reversed: '疑いすぎや感情の閉じ込めが判断を鈍らせます。心を少し開き、事実を丁寧に確認しましょう。',
    emoji: '🌙',
  },
  {
    id: 3,
    name: '女帝',
    nameEn: 'The Empress',
    upright: '愛情や豊かさに恵まれ、育む力が高まっています。自分と周囲を大切にするほど実りが増えます。',
    reversed: '甘やかしすぎや依存でバランスを崩しやすい時です。自分の境界線を意識して整えましょう。',
    emoji: '🌸',
  },
  {
    id: 4,
    name: '皇帝',
    nameEn: 'The Emperor',
    upright: '責任感と統率力が発揮され、物事を安定へ導けます。計画を立てて着実に進めると成功しやすいです。',
    reversed: '頑固さや支配的な姿勢が対立を招きます。柔軟性を持ち、他者の意見も取り入れましょう。',
    emoji: '👑',
  },
  {
    id: 5,
    name: '教皇',
    nameEn: 'The Hierophant',
    upright: '信頼できる助言や伝統的な価値観が助けになります。基本に立ち返ることで安心感が得られます。',
    reversed: '形式に縛られすぎると本質を見失います。自分に合うやり方を見極める姿勢が必要です。',
    emoji: '⛪',
  },
  {
    id: 6,
    name: '恋人',
    nameEn: 'The Lovers',
    upright: '大切な選択を心から納得して行える時です。人との結びつきが深まり、調和が生まれます。',
    reversed: '迷いや価値観のズレが表面化しやすい時です。感情任せにせず、誠実な対話を心がけましょう。',
    emoji: '💑',
  },
  {
    id: 7,
    name: '戦車',
    nameEn: 'The Chariot',
    upright: '強い意志で前進し、目標達成へ勢いがつきます。困難があっても主導権を握って進めます。',
    reversed: '焦りや暴走によって方向を見失いがちです。速度を落として目的地を再確認しましょう。',
    emoji: '🏆',
  },
  {
    id: 8,
    name: '力',
    nameEn: 'Strength',
    upright: '優しさと忍耐によって状況を穏やかに制する力があります。自分を信じることで不安を乗り越えられます。',
    reversed: '自信喪失や感情の揺れが強まりやすい時です。無理をせず、心身を整えることを優先しましょう。',
    emoji: '🦁',
  },
  {
    id: 9,
    name: '隠者',
    nameEn: 'The Hermit',
    upright: '一人で考える時間が答えを導きます。内省を深めることで進むべき道が見えてきます。',
    reversed: '閉じこもりすぎて視野が狭くなる恐れがあります。信頼できる人の意見も取り入れましょう。',
    emoji: '🕯️',
  },
  {
    id: 10,
    name: '運命の輪',
    nameEn: 'Wheel of Fortune',
    upright: '流れが好転し、思いがけないチャンスが巡ってきます。変化を前向きに受け入れると運が味方します。',
    reversed: 'タイミングのずれや停滞を感じやすい時です。今は無理に動かず、準備を整えましょう。',
    emoji: '🎡',
  },
  {
    id: 11,
    name: '正義',
    nameEn: 'Justice',
    upright: '公平な判断が求められる局面です。事実に基づいて誠実に行動すれば良い結果につながります。',
    reversed: '感情的な偏りや不公平感が問題を招きます。冷静に状況を整理し、バランスを取り戻しましょう。',
    emoji: '⚖️',
  },
  {
    id: 12,
    name: '吊された男',
    nameEn: 'The Hanged Man',
    upright: '視点を変えることで新たな気づきが得られます。今は待つことが最善の前進になる時です。',
    reversed: '報われない我慢や先延ばしが続きやすい時です。執着を手放し、次の行動を決めましょう。',
    emoji: '🙃',
  },
  {
    id: 13,
    name: '死神',
    nameEn: 'Death',
    upright: '終わりと再生の節目であり、古い流れを手放す好機です。変化を受け入れるほど未来が開けます。',
    reversed: '変化への抵抗が停滞を長引かせます。恐れを認めたうえで、小さな一歩を選びましょう。',
    emoji: '🌑',
  },
  {
    id: 14,
    name: '節制',
    nameEn: 'Temperance',
    upright: '異なる要素を調和させ、安定した成果を生み出せます。無理のないペースが成功の鍵です。',
    reversed: '極端な行動や生活の乱れが不調を招きます。中庸を意識してリズムを整えましょう。',
    emoji: '🏺',
  },
  {
    id: 15,
    name: '悪魔',
    nameEn: 'The Devil',
    upright: '欲望や執着が強まりやすい状況です。何に縛られているか自覚することが解放の第一歩です。',
    reversed: '依存や悪習慣から抜け出す兆しがあります。自分を縛る思い込みを手放していきましょう。',
    emoji: '😈',
  },
  {
    id: 16,
    name: '塔',
    nameEn: 'The Tower',
    upright: '突然の変化で価値観が揺さぶられるかもしれません。崩壊は再構築の始まりだと捉えましょう。',
    reversed: '混乱は続くものの、被害を最小限に抑えられる余地があります。現実を直視して早めに立て直しましょう。',
    emoji: '⚡',
  },
  {
    id: 17,
    name: '星',
    nameEn: 'The Star',
    upright: '希望が戻り、心が癒やされる時です。素直な願いを描くことで未来への道筋が見えてきます。',
    reversed: '悲観や自信の低下で光を見失いがちです。小さな希望を積み重ねることを意識しましょう。',
    emoji: '✨',
  },
  {
    id: 18,
    name: '月',
    nameEn: 'The Moon',
    upright: '不安や迷いが強まりやすい一方、直感は鋭くなります。見えない部分を慎重に確かめる姿勢が大切です。',
    reversed: '曖昧だった状況が少しずつ明らかになります。思い込みを外し、事実に基づいて判断しましょう。',
    emoji: '🌕',
  },
  {
    id: 19,
    name: '太陽',
    nameEn: 'The Sun',
    upright: '成功と喜びに満ちた明るい運気です。自分らしさを表現するほど周囲にも良い影響が広がります。',
    reversed: '好調でも油断や無理が陰りを生むことがあります。休息を取りつつ、着実さを保ちましょう。',
    emoji: '☀️',
  },
  {
    id: 20,
    name: '審判',
    nameEn: 'Judgement',
    upright: '過去の経験が評価され、再挑戦の機会が訪れます。覚悟を決めることで新しい段階へ進めます。',
    reversed: '決断を先延ばしにすると好機を逃しやすくなります。過去を責めず、今できる選択に集中しましょう。',
    emoji: '📯',
  },
  {
    id: 21,
    name: '世界',
    nameEn: 'The World',
    upright: '努力が実を結び、ひとつの完成に到達する時です。達成を喜びつつ次の目標へ希望をつなげましょう。',
    reversed: 'あと一歩で仕上がる段階で足踏みしやすい時です。不足点を整え、最後までやり切りましょう。',
    emoji: '🌍',
  },
];

export function drawRandomCard(): { card: TarotCard; isReversed: boolean } {
  const index = Math.floor(Math.random() * MAJOR_ARCANA.length);
  const isReversed = Math.random() < 0.5;

  return {
    card: MAJOR_ARCANA[index],
    isReversed,
  };
}
