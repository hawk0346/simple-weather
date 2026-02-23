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

## AI補助コマンド（ローカル開発用）
- テンプレート表示: `bun run ai:prompt`
	- AIに渡す依頼文の雛形（`.copilot-local/prompt-template.md`）を表示
- 事前チェック実行: `bun run ai:preflight`
	- `lint` / `typecheck` / `build` を実行し、要約を生成
	- 生成物:
		- `.copilot-local/out/preflight-summary.md`
		- `.copilot-local/out/preflight.log`

### 推奨フロー
1. `bun run ai:preflight`
2. `bun run ai:prompt` を参考に依頼文を作成
3. `.copilot-local/out/preflight-summary.md` を添えて AI に依頼

### 終了コードについて
- `ai:prompt` は通常 `exit=0`
- `ai:preflight` はチェック失敗時に `exit=1`（想定動作）