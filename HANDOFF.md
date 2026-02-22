# 引き継ぎメモ（2026-02-23）

## 目的
- 天気情報表示アプリを作成する
- ランタイムは bun
- 現在は **Next.js を使わず**、bun + React + TypeScript の SPA 方針

## これまでの決定
- Next.js は不要（依存から削除済み）
- Turbopack エラー回避のため、Tailwind/shadcn は一旦保留
- Docker / Dev Container で環境を固定して作業する
- Hono / zod / biome / knip は後で追加予定

## 現在の状態
- `package.json` の dependencies は React 系のみ
- `tsconfig.json` は `lib` に `dom` を含む
- `.devcontainer/devcontainer.json` は作成済み
- `src/App.tsx`, `src/index.tsx` は最小構成あり
- **Vite 導入済み**（`index.html` / `vite.config.ts` / `bun run dev`）
- `bun run build` が成功する状態
- `hono` / `zod` / `@biomejs/biome` / `knip` を追加済み
- `src/server/index.ts` に最小 API（`/health`, `/weather`）を追加済み
- `/weather` は **Open-Meteo** 連携済み（APIキー不要）

## 直近で実施すること（再開手順）
1. Docker 権限確認（ホスト）
   - `docker ps` が通ることを確認
2. VS Code でコンテナ起動
   - `Dev Containers: Reopen in Container`
3. コンテナ内で依存再取得
   - `bun install`
4. フロント起動
   - `bun run dev`

## 既知の注意点
- WSL/Windows で `permission denied while trying to connect to the docker API` が出る場合:
  - Docker Desktop 起動
  - WSL Integration を有効化
  - Linux 側で `sudo usermod -aG docker $USER` → 再ログイン

## 次の実装候補（優先順）
1. OpenWeatherMap など API クライアント実装
2. Hono 側で外部 API プロキシ化（APIキーはサーバー側管理）
3. UI 方針（素のCSS / 別UIライブラリ）決定

（更新）
- 外部 API は Open-Meteo を採用済み。次はフロント側から `/weather` を呼び出して表示する。

## 補足
- このファイルを最初に読み、続いて `package.json` と `src/` を確認すれば、前回の会話を知らなくても再開できます。
