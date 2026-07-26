# 鑑定文CMS

## 目的

占いの計算ロジックを変更せず、運営者が管理画面から鑑定文を編集・確認・公開できるようにする。

## 管理画面

- `/dev/copy-editor`: 文章の編集、プレビュー、下書き保存、公開、過去版への復元
- `/dev/copy-review`: 代表的な出生データを使った全文確認

本番では `COPY_REVIEW_ENABLED=true` の時だけルートを有効にする。クラウドへ接続するには、GoogleログインとFirestoreの管理者登録も必要。

## Firestore

- `cmsAdmins/{uid}`: CMSを操作できるFirebase Authユーザー。Consoleから手動で作成し、クライアントからの変更は禁止する。
- `readingCopyDrafts/bazi-talent-ja`: 編集中の文章
- `readingCopyPublished/bazi-talent-ja`: 一般画面が読む公開版
- `readingCopyHistory/bazi-talent-ja/versions/{revision}`: 公開履歴

## 初回設定

1. Firebase AuthenticationでGoogleプロバイダーを有効にする。
2. 管理画面から使うGoogleアカウントで一度ログインし、Firebase AuthenticationでUIDを確認する。
3. Firestore Consoleで `cmsAdmins/{uid}` を作成する。内容は `enabled: true` など任意でよい。
4. `firestore.rules` をFirebase Consoleへ反映する。
5. Vercelで `COPY_REVIEW_ENABLED=true` を設定する。

管理者登録前は、管理画面を端末内保存モードで試せる。端末内の「公開」は同じブラウザの鑑定プレビューだけへ反映される。
