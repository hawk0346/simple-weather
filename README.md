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