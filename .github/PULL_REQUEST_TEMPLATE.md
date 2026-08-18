---
name: "PR: Setup docs, ESLint, Prettier, TypeScript and CI"
about: "Adds README, CONTRIBUTING, dev tooling configs and CI workflow"
title: "chore: add docs + ESLint/TS + CI"
labels: "chore"
assignees: []
---

## 概要
- README.md と CONTRIBUTING.md を追加しました。
- 開発用設定を追加しました: package.json, .eslintrc.json, .prettierrc, tsconfig.json
- GitHub Actions ワークフローを追加して typecheck と lint を自動実行します。

## 変更理由
- プロジェクトの説明と貢献手順を明確にすることで他者が参加しやすくなります。
- TypeScript の段階的導入（checkJs）と ESLint により、将来の不具合を未然に防ぎます。

## 動作確認手順
1. `git checkout chore/add-docs-eslint-typescript`
2. `npm install`
3. `npm run typecheck`
4. `npm run lint`

## 備考
- 既存の動作（index.html / worker.js）に変更はありません。破壊的な自動修正は行っていま��ん。
