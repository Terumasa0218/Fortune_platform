// インド12星座（ラーシ）
export type Rashi =
  | "メーシャ"
  | "ヴリシャバ"
  | "ミトゥナ"
  | "カルカタ"
  | "シンハ"
  | "カンニャ"
  | "トゥラー"
  | "ヴリシュチカ"
  | "ダヌ"
  | "マカラ"
  | "クンバ"
  | "ミーナ";

// 27ナクシャトラ
export type Nakshatra =
  | "アシュヴィニー"
  | "バラニー"
  | "クリッティカー"
  | "ローヒニー"
  | "ムリガシラー"
  | "アールドラー"
  | "プナルヴァス"
  | "プシュヤ"
  | "アーシュレーシャー"
  | "マガー"
  | "プールヴァ・パールグニー"
  | "ウッタラ・パールグニー"
  | "ハスタ"
  | "チトラー"
  | "スヴァーティー"
  | "ヴィシャーカー"
  | "アヌラーダー"
  | "ジェーシュター"
  | "ムーラ"
  | "プールヴァ・アーシャーダー"
  | "ウッタラ・アーシャーダー"
  | "シュラヴァナ"
  | "ダニシュター"
  | "シャタビシャジュ"
  | "プールヴァ・バードラパダー"
  | "ウッタラ・バードラパダー"
  | "レーヴァティー";

// インド占星術の解釈結果
export type VedicReading = {
  sunRashi: Rashi;
  moonRashi: Rashi;
  moonNakshatra: Nakshatra;
  ascendantRashi?: Rashi;
  personality: string;
  talent: string;
  destiny: string;
  loveStyle: string;
};
