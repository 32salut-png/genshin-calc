# Contributing

ありがとうございます！貢献フローの目安です。

1. Issue を立ててから作業を始めてください（特に大きな変更の場合）。
2. 新機能や修正は `chore/` や `feat/` プレフィックスのブランチを切ってください。例: `chore/add-docs-eslint-typescript`。
3. コミットメッセージは短く分かりやすく（例: `fix: ...`, `chore: ...`, `feat: ...`）。
4. PR を作成するときは変更点の概要と確認手順を記載してください。

ローカル検証
- 依存をインストール: `npm install`
- 型チェック: `npm run typecheck`
- Lint: `npm run lint`
- Format: `npm run format`

スタイル・方針
- 本リポジトリでは、まず `allowJs` と `checkJs` を有効にした TypeScript 設定で段階的に型チェックを導入します。
- 破壊的な自動修正はデフォルトでは行いません。必要な場合は別途提案します。

