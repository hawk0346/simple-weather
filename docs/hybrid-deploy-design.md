# ハイブリッドデプロイ設計書

> **ステータス**: 未着手（設計完了）
> **作成日**: 2026-03-28

## 目的

`bun run dev:all` なしでアプリを利用可能にする。スマホ対応、他人との共有、VOICEVOX 音声対応、完全無料。

## 全体構成

```
┌──────────────────────────────────────────────────┐
│  Static Hosting (GitHub Pages)                   │
│  ┌────────────────────────────────────────────┐  │
│  │  React SPA (dist/)                         │  │
│  │  ├─ Open-Meteo API ← ブラウザ直接呼び出し  │  │
│  │  ├─ wanakana ローマ字変換 ← クライアント完結│  │
│  │  └─ 県庁所在地フォールバック ← 静的マップ   │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
          │
          │ Speech API (HTTPS via Cloudflare Tunnel)
          ▼
┌──────────────────────────────────────────────────┐
│  自宅 PC (Windows + Docker Desktop)              │
│  ┌───────────────┐   ┌────────────────────────┐ │
│  │ Hono API      │──▶│ VOICEVOX Engine         │ │
│  │ (port 8787)   │   │ (Docker, port 50021)   │ │
│  │ /health       │   └────────────────────────┘ │
│  │ /speech       │                               │
│  │ + CORS        │                               │
│  └───────┬───────┘                               │
│  ┌───────┴───────┐                               │
│  │ cloudflared   │ ← HTTPS トンネル             │
│  └───────────────┘                               │
└──────────────────────────────────────────────────┘

         VOICEVOX 不到達時
          │
          ▼
┌─────────────────────────┐
│  Web Speech API fallback│ ← ブラウザ組み込み TTS
└─────────────────────────┘
```

## コスト

| 項目 | コスト |
|---|---|
| GitHub Pages（フロント） | 無料 |
| Cloudflare Tunnel | 無料 |
| Cloudflare アカウント | 無料 |
| ドメイン（任意） | 年 ~$10（なくても `trycloudflare.com` で利用可） |

## 現行 → 新構成の変更マッピング

| 機能 | 現在 | 新構成 |
|---|---|---|
| 天気取得 | バックエンド経由で Open-Meteo | ブラウザから Open-Meteo 直接呼び出し |
| ローマ字変換 | バックエンド kuroshiro → wanakana フォールバック | wanakana のみ（クライアント完結） |
| 県庁所在地フォールバック | バックエンドの静的マップ | フロントに移植（shared/ に移動） |
| 音声合成 | バックエンド経由で VOICEVOX | Cloudflare Tunnel 経由で VOICEVOX、不到達時は Web Speech API |
| ホスティング | `bun run dev:all`（ローカルのみ） | GitHub Pages + Cloudflare Tunnel |

## データフロー

### 天気検索（新）

```
ユーザー入力 ("東京")
  │
  ├─ wanakana.toRomaji() + normalizeRomaji() → "tokyo"
  │
  ├─ GET https://geocoding-api.open-meteo.com/v1/search?name=tokyo&count=1&language=ja&countryCode=JP
  │   (結果なし → prefectureToCity["tokyo"] で再検索)
  │
  ├─ GET https://api.open-meteo.com/v1/forecast?latitude=...&longitude=...
  │
  └─ WeatherResponse → UI 更新
```

### 音声読み上げ（新）

```
「読み上げ」ボタン押下
  │
  ├─ speechMode === "voicevox"
  │   └─ GET {VITE_SPEECH_API_URL}/speech?text=...&speaker=1
  │      → audio/wav → Audio 再生
  │
  ├─ speechMode === "web-speech"
  │   └─ SpeechSynthesisUtterance(text, lang="ja-JP")
  │      → ブラウザ組み込み TTS
  │
  └─ speechMode === "none"
      └─ ボタン無効化
```

### Speech バックエンド検出

```
アプリ起動時
  │
  ├─ VITE_SPEECH_API_URL 未設定 → speechMode = "web-speech"
  │
  └─ 設定あり → GET {url}/health (3秒タイムアウト)
      ├─ 200 OK → speechMode = "voicevox"
      └─ エラー → speechMode = "web-speech"
      │
      └─ 60秒ごとに再チェック
```

## ファイル変更一覧

### 移動

| 元 | 先 | 理由 |
|---|---|---|
| `src/backend/services/prefecture-to-city.ts` | `src/shared/prefecture-to-city.ts` | フロントでも使用 |

### 新規作成

| ファイル | 説明 |
|---|---|
| `src/shared/schemas.ts` | geocoding + forecast Zod スキーマ（バックエンドから抽出） |
| `src/frontend/config.ts` | 環境変数 (`VITE_SPEECH_API_URL`) の一元管理 |
| `src/frontend/services/weather-api.ts` | Open-Meteo 直接呼び出しサービス |
| `src/frontend/services/speech-backend.ts` | Speech バックエンド接続性 + Web Speech API |
| `src/frontend/hooks/useSpeechBackend.ts` | Speech バックエンド状態管理フック |
| `compose.production.yml` | 本番用 Docker Compose (VOICEVOX + Hono) |
| `Dockerfile.speech` | Speech API コンテナ |
| `.github/workflows/deploy.yml` | GitHub Pages デプロイ CI |
| `.env.example` | 環境変数テンプレート |

### 修正

| ファイル | 変更内容 |
|---|---|
| `src/frontend/hooks/useWeatherSearch.ts` | `/api/weather` → `fetchWeather()` 直接呼び出し。`/api/convert-to-romaji` 呼び出し削除 |
| `src/frontend/hooks/useWeatherSpeech.ts` | `speechMode` に応じて VOICEVOX / Web Speech API を切り替え |
| `src/frontend/App.tsx` | `useSpeechBackend` 追加。`speechMode` を子コンポーネントに伝搬 |
| `src/frontend/components/WeatherResultPanel.tsx` | Speech モード表示（VOICEVOX / ブラウザ音声 / 利用不可） |
| `src/backend/index.ts` | CORS ミドルウェア追加。weather / romaji ルート削除 |
| `src/backend/schemas/index.ts` | 共有スキーマを `shared/` から re-export。speech 用のみ残す |
| `vite.config.ts` | `base: './'` 追加。proxy を speech のみに限定 |
| `package.json` | `build:pages` / `dev:speech` スクリプト追加。kuroshiro 関連パッケージ削除 |

### 削除（バックエンド簡略化）

| ファイル | 理由 |
|---|---|
| `src/backend/routes/weather.ts` | 天気ロジックはフロントに移動 |
| `src/backend/routes/convert-to-romaji.ts` | wanakana のみで代替 |
| `src/backend/services/weather-search.ts` | フロントに移動 |
| `src/backend/services/romaji-converter.ts` | 不要 |
| `src/backend/services/http.ts` | バックエンドでは不使用 |

## 実装フェーズ

### Phase 1: 天気検索のフロントエンド直接化

バックエンド非依存で天気検索を動作させる。既存バックエンドルートはまだ残す。

- [ ] `src/shared/prefecture-to-city.ts` にファイル移動
- [ ] `src/shared/schemas.ts` に Zod スキーマ抽出
- [ ] `src/frontend/services/weather-api.ts` 作成（Open-Meteo 直接呼び出し）
- [ ] `src/frontend/config.ts` 作成
- [ ] `src/frontend/hooks/useWeatherSearch.ts` 改修
- [ ] 動作確認: バックエンドなしで天気検索が動くこと

### Phase 2: Speech 切り替え機構

VOICEVOX と Web Speech API の動的切り替えを実装。

- [ ] `src/frontend/services/speech-backend.ts` 作成
- [ ] `src/frontend/hooks/useSpeechBackend.ts` 作成
- [ ] `src/frontend/hooks/useWeatherSpeech.ts` 改修
- [ ] `src/frontend/App.tsx` 改修
- [ ] `src/frontend/components/WeatherResultPanel.tsx` 改修
- [ ] `src/backend/index.ts` に CORS ミドルウェア追加
- [ ] 動作確認: バックエンドあり→VOICEVOX、なし→Web Speech API

### Phase 3: バックエンド簡略化

不要になったバックエンドコードを削除。

- [ ] 不要ルート・サービスの削除
- [ ] `src/backend/index.ts` ルート登録を更新
- [ ] `package.json` から kuroshiro 関連パッケージ削除
- [ ] `bunx tsc --noEmit` + `bun test` で破損がないこと確認

### Phase 4: デプロイパイプライン

静的ビルド + Cloudflare Tunnel + Docker Compose。

- [ ] `vite.config.ts` に `base: './'` 追加
- [ ] `.env.example` 作成
- [ ] `Dockerfile.speech` 作成
- [ ] `compose.production.yml` 作成
- [ ] `.github/workflows/deploy.yml` 作成（GitHub Pages デプロイ CI）
- [ ] 動作確認: `bun run build` → `dist/` の静的ファイルで天気検索が動くこと

### Phase 5: Cloudflare Tunnel セットアップ + 検証

- [ ] Cloudflare アカウント作成
- [ ] `cloudflared` インストール（`winget install cloudflare.cloudflared`）
- [ ] Quick Tunnel テスト: `cloudflared tunnel --url http://localhost:8787`
- [ ] スマホからの動作確認
- [ ] （任意）独自ドメイン取得 + Named Tunnel 設定
- [ ] README 更新

## セキュリティ考慮事項

| 懸念 | 対策 |
|---|---|
| CORS 設定 | 許可オリジンを具体的に指定。`*` は使わない |
| VOICEVOX 悪用 | Hono に簡易 rate limiting（IP ベース、100 req/min） |
| テキスト長制限 | 既存の `speechQuerySchema` の `max(300)` を維持 |
| Tunnel セキュリティ | Cloudflare Access（無料50ユーザー）で認証レイヤー追加を検討 |

## ローマ字変換の精度について

wanakana のみへの移行により、漢字入力の変換精度は下がる。

| 入力 | kuroshiro + wanakana | wanakana のみ |
|---|---|---|
| 東京 | tokyo | とうきょう（変換不可、漢字をそのまま渡す） |
| とうきょう | tokyo | tokyo |
| tokyo | tokyo | tokyo |

現状のフロントエンドには wanakana フォールバックが既に実装されており、漢字入力時はひらがな・カタカナ・ローマ字での入力を促す UI 案内が有効。

## Cloudflare Tunnel セットアップ概要

### Quick Tunnel（即席、ドメイン不要）

```powershell
# Windows PowerShell
winget install cloudflare.cloudflared

# Speech API + VOICEVOX を起動
docker compose -f compose.production.yml up -d

# トンネル起動（ランダム URL が発行される）
cloudflared tunnel --url http://localhost:8787
# → https://xxxxx-xxxxx-xxxxx.trycloudflare.com
```

発行された URL を `.env.production` の `VITE_SPEECH_API_URL` に設定してビルド。
URL は起動ごとに変わるため、常用には Named Tunnel を推奨。

### Named Tunnel（固定 URL、要ドメイン）

```powershell
# 1. Cloudflare にログイン
cloudflared tunnel login

# 2. トンネル作成
cloudflared tunnel create speech-api

# 3. config.yml 作成
# %USERPROFILE%\.cloudflared\config.yml
# tunnel: <tunnel-id>
# credentials-file: %USERPROFILE%\.cloudflared\<tunnel-id>.json
# ingress:
#   - hostname: speech.your-domain.com
#     service: http://localhost:8787
#   - service: http_status:404

# 4. DNS 設定
cloudflared tunnel route dns speech-api speech.your-domain.com

# 5. 起動
cloudflared tunnel run speech-api

# 6. （任意）Windows サービスとして登録
cloudflared service install
```

## 参考リンク

- [Cloudflare Tunnel ドキュメント](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)
- [GitHub Pages ドキュメント](https://docs.github.com/ja/pages)
- [VOICEVOX Engine Docker](https://hub.docker.com/r/voicevox/voicevox_engine)
- [Web Speech API (MDN)](https://developer.mozilla.org/ja/docs/Web/API/Web_Speech_API)
