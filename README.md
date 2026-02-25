# simple-weather

## 再開ガイド
- 引き継ぎ内容は [HANDOFF.md](HANDOFF.md) を参照
- 開発コンテナで再開する場合:
	1. `docker ps` が通ることを確認
	2. VS Code で `Dev Containers: Reopen in Container`
	3. コンテナ内で `bun install`

## 開発サーバー起動
- フロントのみ: `bun run dev`
- APIのみ: `bun run dev:api`
- 同時起動: `bun run dev:all`

## Tailwind 運用メモ
- Tailwind v4 は `src/index.css` の `@source` を正として運用し、`tailwind.config.js` の `content` は重複回避のため使用しない。

## AI補助コマンド（ローカル開発用）
- 常時ルール: `.github/copilot-instructions.md`
	- Copilot が参照するリポジトリ固有ルール（最小差分、UI制約、SVG `xmlns`、色は `tailwind-variants` など）
- 実行コマンド: `bun run ai:request`
	- 事前チェックと依頼バンドル生成を1コマンドで実行
	- 生成物:
		- `.copilot-local/out/preflight-summary.md`
		- `.copilot-local/out/preflight.log`
		- `.copilot-local/out/request-bundle.md`

### 推奨フロー
1. `.copilot-local/prompt-template.md` に要件を記入
2. `bun run ai:request`
3. `.copilot-local/out/request-bundle.md` の `Paste script` を AI に貼り付けて依頼
4. 実装後に以下を実行して確認
	- `bunx biome check src`
	- `bunx tsc --noEmit`
	- `bun run knip`

### 終了コードについて
- `ai:request` は preflight が失敗しても `request-bundle` 生成まで続行

### 開発環境について
- 開発環境は WSL（POSIX シェル前提）を想定しています

### Copilotレビューを日本語化する設定
- 本リポジトリには日本語レビュー用の指示ファイルを配置済み:
	- `.github/copilot-instructions.md`
	- `.github/instructions/code-review.instructions.md`
- GitHub のリポジトリ設定で、Copilot code review の custom instructions を有効にする:
	1. `Settings` → `Copilot` → `Code review`
	2. `Use custom instructions when reviewing pull requests` を ON
- PRテンプレートにも「日本語でレビューしてください」を明記しています。