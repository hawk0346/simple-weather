# simple-weather

日本の市区町村を検索して天気を表示し、VOICEVOX で音声読み上げする React SPA。

## 開発コマンド

| コマンド | 用途 |
|---|---|
| `bun run dev` | フロントのみ起動 (port 3000) |
| `bun run dev:api` | APIのみ起動 (port 8787) |
| `bun run dev:all` | フロント + API 同時起動 |
| `bun run build` | プロダクションビルド |
| `bun test` | ユニットテスト実行 |
| `bunx tsc --noEmit` | 型チェック |
| `bunx biome check src` | Lint |
| `biome format --write .` | フォーマット自動修正 |
| `bun run knip` | 未使用コード検出 |

## アーキテクチャ概要

- **フロント**: React 19 + Vite (port 3000)
- **バック**: Hono (port 8787) — `bun src/backend/index.ts`
- **音声**: VOICEVOX Engine Docker サイドカー (port 50021)
- **Vite proxy**: `/api/*` → `http://localhost:8787`

## ディレクトリ構成

```
src/
  frontend/          # React SPA
    App.tsx          # ルートコンポーネント（状態結合）
    components/      # UI コンポーネント
    hooks/           # カスタムフック
    types/           # 型定義（api.ts, weather.ts）
    weather/         # 天気コード判定ロジック
  backend/           # Hono API サーバー
    index.ts         # エントリー + グローバルエラーハンドラ
    routes/          # エンドポイント定義
    services/        # ビジネスロジック
    schemas/         # Zod バリデーションスキーマ
  shared/            # フロント・バック共通コード
    normalize-romaji.ts  # ローマ字正規化（テスト付き）
```

## API エンドポイント

| Method | Path | 役割 |
|---|---|---|
| GET | `/health` | ヘルスチェック |
| POST | `/convert-to-romaji` | 日本語→ローマ字変換 |
| GET | `/weather?city=<name>` | 天気取得 (Open-Meteo) |
| GET | `/speech?text=<text>&speaker=<id>` | 音声合成 (VOICEVOX) |

## 外部サービス

- **Open-Meteo**: 天気データ・ジオコーディング（APIキー不要）
- **VOICEVOX Engine**: 音声合成。環境変数 `VOICEVOX_ENGINE_URL`（既定: `http://voicevox-engine:50021`）

## コーディング規約

- 変更は最小限に。既存アーキテクチャと命名を維持する
- フォーマッタ: Biome（インデント: space）
- 天気アイコンの色トークンは `tailwind-variants` で管理する
- inline SVG には必ず `xmlns="http://www.w3.org/2000/svg"` を付ける
- Tailwind v4 は `src/frontend/index.css` の `@source` を正として運用（`tailwind.config.js` の `content` は不使用）
- コンポーネント・フックは既存の再利用を優先し、新規作成は最後の手段

## Dev Container 起動手順

1. Windows 側: Docker Desktop 起動（WSL Integration 有効化）
2. VS Code: `Dev Containers: Rebuild and Reopen in Container`
3. コンテナ内: `bun install`
4. `bun run dev:all` で起動
5. 疎通確認: `curl -s http://voicevox-engine:50021/version`

## GH_TOKEN セットアップ

PR レビュースクリプト (`scripts/pr-review.sh`) の利用に必要。詳細は [CONTRIBUTING.md](CONTRIBUTING.md) を参照。

## 設計決定の記録

- **Next.js 非採用**: Turbopack 問題回避 → Vite + Bun SPA 構成
- **Kuroshiro 初期化**: `romaji-converter.ts` でシングルトン管理（初回のみ時間がかかる）
- **VOICEVOXタイムアウト**: `AbortSignal.timeout()` 設定済み（audio_query: 5秒、synthesis: 10秒）
- **Tailwind v4**: `src/frontend/index.css` の `@source` を正として運用
- **`src/components/SearchPanel.tsx`**: 旧ファイル（未使用）。正は `src/frontend/components/SearchPanel.tsx`

## 詳細リファレンス

コンポーネント・フック・API・データフローの詳細は `.github/skills/simple-weather/SKILL.md` を参照。
