---
description: "feature-dev エージェント定義を公式プラグインの最新版に同期する"
---

# feature-dev エージェント定義の更新

以下の手順で `.github/agents/` 内の feature-dev 関連エージェント定義を更新してください。

## 対象ファイル

- `.github/agents/feature-dev.agent.md` — メインワークフロー
- `.github/agents/code-explorer.agent.md` — コードベース調査サブエージェント
- `.github/agents/code-architect.agent.md` — アーキテクチャ設計サブエージェント
- `.github/agents/code-reviewer.agent.md` — コードレビューサブエージェント

## 更新手順

1. 公式リポジトリから最新のソースを取得してください:
   - https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/feature-dev/commands/feature-dev.md
   - https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/feature-dev/agents/code-explorer.md
   - https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/feature-dev/agents/code-architect.md
   - https://raw.githubusercontent.com/anthropics/claude-plugins-official/main/plugins/feature-dev/agents/code-reviewer.md

2. 取得した内容を VS Code Copilot のカスタムエージェント形式（`.agent.md`）に変換してください:
   - Claude Code プラグインの YAML frontmatter（`tools:`, `model:`, `color:` など）を VS Code 形式に変換
   - `tools:` は VS Code のエイリアス（`read`, `edit`, `search`, `execute`, `agent`, `web`, `todo`）を使用
   - サブエージェントは `user-invocable: false` を設定
   - メインエージェントの `agents:` でサブエージェントの名前を列挙

3. 既存のエージェントファイルと差分を確認し、変更点をユーザーに提示してください。

4. ユーザーの承認後に更新を適用してください。

## 変換時の注意

- VS Code Copilot では `model:` の指定は任意（デフォルトのモデル選択に従う）
- `color:` は VS Code 形式では不要
- `TodoWrite` → `todo` エイリアスに置換
- `Glob`, `Grep`, `LS`, `Read` → `read`, `search` エイリアスに集約
- `BashOutput`, `KillShell` → `execute` エイリアスに集約
- `WebFetch`, `WebSearch` → `web` エイリアスに集約
