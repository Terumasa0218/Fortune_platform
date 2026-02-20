# データモデル仕様

本文書は Fortune Platform で使用する主要なデータ型とFirestore構造を定義する。

---

## 1. Person型（個人プロフィール）

### 1.1 型定義
```typescript
type Person = {
  id: string;
  uid: string;              // 所有者のFirebase Auth UID
  name: string;             // 表示名
  gender?: "male" | "female" | "other";
  
  // 生年月日・時刻
  birthDate: string;        // ISO 8601 date (YYYY-MM-DD)
  birthTime?: string;       // ISO 8601 time (HH:MM) or null（時刻不明時）
  
  // 出生地
  birthPlace?: string;      // 地名（"東京都渋谷区"等）
  latitude?: number;        // 緯度（-90 to 90）
  longitude?: number;       // 経度（-180 to 180）
  timezone?: string;        // IANA timezone ("Asia/Tokyo"等)
  
  // 性格診断（外部結果の手動入力）
  mbti?: string;            // "ENFP" | "ISTJ" | ... (16タイプ)
  enneagram?: number;       // 1〜9
  loveType?: string;        // 独自定義（Phase 2B で決定）
  
  // 信頼度フラグ
  confidence: {
    time: "unknown" | "approximate" | "exact";
    place: "unknown" | "city" | "exact";
  };
  
  // メタ情報
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 1.2 信頼度（Confidence）の定義

信頼度は占術計算の精度に影響する。

#### time（時刻の信頼度）
- **unknown**: 時刻不明（birthTime が null）
  - 影響: ハウス・ASC/MC が計算不可、時柱が計算不可
  - 可能な占術: 太陽星座占い、四柱推命の年月日柱のみ
- **approximate**: おおよその時刻（±1-2時間の誤差）
  - 影響: ハウスカスプに誤差、ASC星座が境界付近で不確定
- **exact**: 正確な時刻
  - 影響: なし（全占術が正確に計算可能）

#### place（場所の信頼度）
- **unknown**: 場所不明（latitude/longitude が null）
  - 影響: ハウス・ASC/MC が計算不可
  - 可能な占術: 太陽星座占い（時刻も不明な場合）
- **city**: 都市レベル（±10-50km の誤差）
  - 影響: ハウスカスプに微小な誤差（通常は無視可能）
- **exact**: 正確な座標
  - 影響: なし

### 1.3 Firestore配置

Person はユーザー配下のサブコレクションで管理する。

```text
/users/{uid}/persons/{personId}
```

- `uid` は Firebase Auth UID（親パスとドキュメント内 `uid` は一致必須）
- `personId` は自動採番IDまたはULID
- 1ユーザーにつき複数Personを保持可能（本人、家族、相性相手候補など）

---

## 2. Pair型（相性データ）

### 2.1 型定義
```typescript
type Pair = {
  id: string;
  uid: string;                 // 所有者のFirebase Auth UID

  // 相性対象
  personAId: string;           // Person.id
  personBId: string;           // Person.id

  // 表示用スナップショット（任意）
  personAName?: string;
  personBName?: string;

  // 相性結果（メソッド別）
  methods: {
    western?: {
      score: number;           // 0-100
      summary: string;
      computedAt: Timestamp;
      version?: string;
    };
    bazi?: {
      score: number;           // 0-100
      summary: string;
      computedAt: Timestamp;
      version?: string;
    };
    mbti?: {
      score: number;           // 0-100
      summary: string;
      computedAt: Timestamp;
      version?: string;
    };
    enneagram?: {
      score: number;           // 0-100
      summary: string;
      computedAt: Timestamp;
      version?: string;
    };
    loveType?: {
      score: number;           // 0-100
      summary: string;
      computedAt: Timestamp;
      version?: string;
    };
  };

  // 統合スコア
  overallScore?: number;       // 0-100

  // メタ情報
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2.2 一意性ルール

同一ユーザー内で同じPerson組み合わせの重複作成を防ぐため、以下を推奨する。

- `pairKey = min(personAId, personBId) + "__" + max(personAId, personBId)` を作成
- FirestoreドキュメントIDに `pairKey` を利用する、または `pairKey` フィールドで重複チェック
- `personAId !== personBId` を必須バリデーションとする

### 2.3 Firestore配置

Pair もユーザー配下サブコレクションで管理する。

```text
/users/{uid}/pairs/{pairId}
```

- `uid` は Firebase Auth UID（親パスとドキュメント内 `uid` は一致必須）
- `pairId` は `pairKey` 利用を推奨
- `personAId` / `personBId` は同一 `uid` 配下の Person を参照する

---

## 3. Firestore全体構造

```text
/users/{uid}
  ├─ profile (document)
  ├─ fortunes/{fortuneId}
  ├─ persons/{personId}
  └─ pairs/{pairId}
```

### 3.1 設計方針
- すべてのユーザーデータは `/users/{uid}` 配下に閉じる（マルチテナント分離）
- Person と Pair は同一ユーザー内でのみ参照可能
- 相性計算結果は Pair ドキュメントに集約し、再計算時に `methods.*` を更新

### 3.2 インデックス推奨
- `pairs` コレクション: `updatedAt desc`（一覧表示用）
- `pairs` コレクション: `overallScore desc`（ランキング表示用）
- `persons` コレクション: `updatedAt desc`（最近更新順）

---

## 4. バリデーション要件

### 4.1 Person
- `birthDate` は `YYYY-MM-DD` 形式
- `birthTime` は未入力許容（null/undefined）
- `latitude` がある場合は `longitude` と `timezone` をセットで保持
- `confidence.time` / `confidence.place` は必須

### 4.2 Pair
- `personAId` / `personBId` は必須
- `personAId !== personBId`
- `methods.*.score` は 0〜100
- `overallScore` は `methods` の重み付き集計値として計算

---

## 変更履歴
- 2026-02-20: 初版作成
