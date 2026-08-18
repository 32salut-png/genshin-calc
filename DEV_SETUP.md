# DEV_SETUP.md

このファイルは、今回追加・変更した開発周りのファイルを1つにまとめた「読みやすい版」です。
実際のツールや GitHub Actions はそれぞれのファイルを参照しますので、元のファイルはそのまま残しています。

---

## 目次（ざっくり）
1. README の内容（簡易）
2. CONTRIBUTING（貢献手順）
3. FILES_OVERVIEW（ファイルの目的）
4. 開発用設定ファイルの中身（package.json, tsconfig.json, .eslintrc.json, .prettierrc）
5. PR テンプレート

---

## 1) README（簡易）

小さな更新: READMEに合わせて空行を1行追加しました。

これは CI をトリガーするための安全なコミットです。

---

## 2) CONTRIBUTING（貢献手順）

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

---

## 3) FILES_OVERVIEW（要旨）

- index.html
  - サイト本体（ユーザーが見るページ）。
- worker.js
  - サイトの裏側で動く処理（ブラウザやホスティング上で実行されるスクリプト）。
- favicon.png
  - ブラウザタブに表示される小さなアイコン。
- sitemap.xml
  - 検索エンジン向けのサイト地図ファイル。

開発者向け（主に開発・保守時に使う）
- README.md
  - プロジェクトの短い説明と、ローカルでの確認手順（今は簡易版）。
- CONTRIBUTING.md
  - 誰かが修正を加えるときの手順（貢献ルール）。
- package.json
  - 開発用コマンドと使うツール（lint, format, typecheck など）。
- tsconfig.json
  - TypeScript の設定（現在は段階的チェック: allowJs + checkJs）。
- .eslintrc.json
  - ESLint（コード品質チェック）のルール。
- .prettierrc
  - Prettier（自動整形）のルール。
- .github/
  - 自動チェック（Actions）や PR テンプレートなど、GitHub に関する設定が入っています。

---

## 4) 開発用設定ファイル（そのまま貼り付け）

下記は人間が見るためのまとめコピーです。設定を編集する場合は元ファイルを直接編集してください。

### package.json

```json
{
  "name": "genshin-calc",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "lint": "eslint . --ext .js,.mjs",
    "format": "prettier --write .",
    "typecheck": "tsc -p . --noEmit"
  },
  "devDependencies": {
    "eslint": "^8.45.0",
    "prettier": "^2.8.8",
    "typescript": "^5.3.3",
    "@typescript-eslint/parser": "^6.3.0",
    "@typescript-eslint/eslint-plugin": "^6.3.0",
    "eslint-config-prettier": "^8.8.0",
    "eslint-plugin-prettier": "^4.2.1"
  }
}
```

---

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "allowJs": true,
    "checkJs": true,
    "noEmit": true,
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["**/*"],
  "exclude": ["node_modules"]
}
```

---

### .eslintrc.json

```json
{
  "root": true,
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2023,
    "sourceType": "module"
  },
  "env": {
    "browser": true,
    "es2023": true,
    "node": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off"
  }
}
```

---

### .prettierrc

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5"
}
```

---

## 5) PR テンプレート

以下は .github/PULL_REQUEST_TEMPLATE.md の内容（読みやすいコピー）:

```yaml
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
- 既存の動作（index.html / worker.js）に変更はありません。破壊的な自動修正は行っていません。
```

---

## 補足と注意（重要）
- このファイルは「人が読む用のまとめ」です。設定ファイルを編集するときは、必ず元の個別ファイルを編集してください（例: package.json, tsconfig.json など）。
- 元ファイルを削除すると自動チェックやデプロイに影響が出ます。まとめは可読性のためのコピーであり、実運用の設定は個別ファイルが源です。

---

作業が楽になるように、これをルートに追加しました。元ファイルは残っています。

次に何をしますか？
- 元ファイルを docs/ に移動してルートをすっきりさせる（提案ブランチを作成します）
- dev_setup.md を README に埋め込む
- 何もしない