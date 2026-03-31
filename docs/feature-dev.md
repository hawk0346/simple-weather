# feature-dev エージェント

Claude Code の [feature-dev プラグイン](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/feature-dev) を VS Code Copilot 向けにカスタムエージェントとして再構築したものです。

## 使い方

1. VS Code のチャットパネルを開く
2. エージェント選択ドロップダウンで **feature-dev** を選択
3. 実装したい機能を入力して送信

```
CollapsibleSection にアニメーションを追加して
```

## 7つのフェーズ

| Phase | 内容 |
|-------|------|
| 1. Discovery | 要件の明確化・制約の洗い出し |
| 2. Codebase探索 | `code-explorer` サブエージェントが既存コードのパターンや類似機能を調査 |
| 3. 質問 | 曖昧な点をすべて質問し、回答を待ってから次へ |
| 4. アーキテクチャ設計 | `code-architect` サブエージェントが複数の設計案を提示し、トレードオフを比較 |
| 5. 実装 | ユーザー承認後にコーディング開始 |
| 6. コードレビュー | `code-reviewer` サブエージェントが品質・バグ・規約の観点でレビュー |
| 7. サマリー | 変更内容と次のステップをまとめ |

## ファイル構成

```
.github/agents/
  feature-dev.agent.md      # メインワークフロー
  code-explorer.agent.md    # コードベース調査サブエージェント
  code-architect.agent.md   # アーキテクチャ設計サブエージェント
  code-reviewer.agent.md    # コードレビューサブエージェント
```

## 使い分けの目安

- **小さいバグ修正・ちょっとした改善** → 不要。通常の Copilot で十分
- **中規模の実装タスク** → 最適。コードベースの理解が精度に直結するタスクで効果を発揮
- **大規模タスク** → `docs/` にデザインドキュメントを用意し、タスクを中規模に分解してから feature-dev に渡す

## エージェント定義の更新

エージェント定義を最新の公式プラグインに合わせて更新する場合は、`.github/prompts/sync-feature-dev.prompt.md` を使用してください。

### 更新手順

1. チャットで `/sync-feature-dev` を実行
2. 公式リポジトリから最新ソースを取得し、差分を提示
3. 確認後に `.github/agents/` 内のファイルを更新
