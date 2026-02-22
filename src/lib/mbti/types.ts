export type MbtiType =
  | 'INTJ'
  | 'INTP'
  | 'ENTJ'
  | 'ENTP'
  | 'INFJ'
  | 'INFP'
  | 'ENFJ'
  | 'ENFP'
  | 'ISTJ'
  | 'ISFJ'
  | 'ESTJ'
  | 'ESFJ'
  | 'ISTP'
  | 'ISFP'
  | 'ESTP'
  | 'ESFP';

export type MbtiCompatibility = {
  score: number;
  axes: {
    communication: number;
    conflict: number;
    stability: number;
    growth: number;
  };
  summary: string;
  details?: string;
};

export const LOVE_TYPES = [
  { id: 'rabbit', label: 'ちゃっかりうさぎ' },
  { id: 'bossCat', label: 'ボス猫' },
  { id: 'babyHide', label: '隠れベイビー' },
  { id: 'star', label: '主役体質' },
  { id: 'tsundere', label: 'ツンデレヤンキー' },
  { id: 'senpai', label: '憧れの先輩' },
  { id: 'chameleon', label: 'パーフェクトカメレオン' },
  { id: 'lion', label: 'キャプテンライオン' },
  { id: 'balancer', label: 'カリスマバランサー' },
  { id: 'romance', label: 'ロマンスマジシャン' },
  { id: 'loyal', label: '忠犬ハチ公' },
  { id: 'monster', label: '恋愛モンスター' },
  { id: 'mystery', label: '不思議生命体' },
  { id: 'manager', label: '敏腕マネージャー' },
  { id: 'devil', label: 'デビル天使' },
  { id: 'lastLover', label: '最後の恋人' },
] as const;

export type LoveTypeId = (typeof LOVE_TYPES)[number]['id'];
