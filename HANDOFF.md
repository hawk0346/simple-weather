# 引き継ぎメモ（2026-02-23）

## 目的
- 天気情報表示アプリを作成する
- ランタイムは bun
- 現在は **Next.js を使わず**、bun + React + TypeScript の SPA 方針

## これまでの決定
- Next.js は不要（依存から削除済み）
- Turbopack 問題は Next.js 非採用で回避し、現在は Vite 構成で開発
- Tailwind/shadcn 関連依存は導入済み（UI 方針は今後必要に応じて整理）
- Docker / Dev Container で環境を固定して作業する
- Hono / zod / biome / knip は追加済み

## 現在の状態
- 開発環境の実装は一旦完了
- `package.json` は React + Hono + zod、開発系に Vite / Biome / Knip 等を含む
- `tsconfig.json` は `lib` に `dom` を含む
- `.devcontainer/devcontainer.json` は作成済み
- `src/App.tsx`, `src/index.tsx` は最小構成あり
- **Vite 導入済み**（`index.html` / `vite.config.ts` / `bun run dev`）
- `bun run build` が成功する状態
- `bun run dev:all` でフロント + API 同時起動可能
- `hono` / `zod` / `@biomejs/biome` / `knip` を追加済み
- `src/backend/index.ts` に最小 API（`/health`, `/weather`）を追加済み
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
5. フロント + API 同時起動（推奨）
   - `bun run dev:all`

## 既知の注意点
- WSL/Windows で `permission denied while trying to connect to the docker API` が出る場合:
  - Docker Desktop 起動
  - WSL Integration を有効化
  - Linux 側で `sudo usermod -aG docker $USER` → 再ログイン

## 次の実装候補（優先順）
1. フロントUIの改善（取得結果表示の拡充、ローディング/エラー体験の改善）
2. APIレスポンス設計の整理（エラーコード/メッセージの統一）
3. UI方針整理（Tailwind/shadcnを本採用するか最終決定）

（更新）
- 外部 API は Open-Meteo を採用済み。フロント側から `/weather` 呼び出しも実装済み。

## 補足
- このファイルを最初に読み、続いて `package.json` と `src/` を確認すれば、前回の会話を知らなくても再開できます。
