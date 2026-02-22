// 12星座
export type ZodiacSign =
  | "おひつじ"
  | "おうし"
  | "ふたご"
  | "かに"
  | "しし"
  | "おとめ"
  | "てんびん"
  | "さそり"
  | "いて"
  | "やぎ"
  | "みずがめ"
  | "うお";

// 天体位置
export type Planet = {
  name: string;
  longitude: number; // 0〜360度
  sign: ZodiacSign;
  degree: number; // 星座内の度数 0〜29
};

// 西洋占星術の解釈結果
export type WesternReading = {
  sunSign: ZodiacSign;
  moonSign: ZodiacSign;
  planets: Planet[];
  personality: string;
  talent: string;
  destiny: string;
  loveStyle: string;
};
