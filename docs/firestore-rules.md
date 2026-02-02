# Firestore Rules (Console 反映手順)

## 目的
本リポジトリの `firestore.rules` は、現在のアプリ要件に合わせた最小かつ厳格なルールです。
- 認証必須（匿名含む）
- `/users/{uid}` は本人のみ read/write
- `createdAt` は初回のみセット（更新で不変）
- `/users/{uid}/fortunes/{id}` は本人のみ read/create（update/delete 禁止）

## Console 反映手順（手動）
> App Hosting からの自動反映はできない前提です。以下を手作業で実施してください。

1. Firebase Console で対象プロジェクトを開く
2. **Firestore Database** → **Rules** タブへ移動
3. `firestore.rules` の内容を貼り付ける
4. **Publish** をクリック

## ルール更新時の注意
- `fortunes` や `users` のフィールドを増やす場合は、
  `keys().hasOnly([...])` に新フィールドを追加してから Console へ反映してください。
- `createdAt` は更新で上書き禁止です。クライアント側の更新処理にも注意してください。
