# genshin-calc

軽量な原神（Genshin Impact）向け計算ツールの静的サイト/ワーカー実装です。

概要
- シングルページのフロントエンド（index.html）とワーカー（worker.js）がルートにあります。

ローカルでの確認
1. Node.js と npm をインストールしてください（推奨: Node 18+）。
2. 依存をインストール（開発ツールのみ）:

   npm install

3. 型チェック（TypeScript の checkJs を使った段階的チェック）:

   npm run typecheck

4. ESLint で静的解析:

   npm run lint

5. Prettier でフォーマット（自動でコミットはしません）:

   npm run format

注意
- 既存のコードは自動で大きく変更しません。まずは段階的な型チェックと lint を導入して問題点を検出します。

ライセンス
MIT
