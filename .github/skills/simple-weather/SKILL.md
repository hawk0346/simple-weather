---
name: simple-weather
description: 'Architectural reference for the simple-weather repository. Use when adding or modifying components, hooks, API routes, services, or styles. Covers all frontend components with props, backend endpoints, data flow, coding conventions, and known constraints.'
---

# simple-weather — アーキテクチャ詳細リファレンス

## フロントエンド構成

### コンポーネント

| コンポーネント | ファイル | Props | 役割 |
|---|---|---|---|
| `App` | `src/frontend/App.tsx` | なし | ルートコンポーネント・全フック結合 |
| `Header` | `src/frontend/components/Header.tsx` | `scheme`, `onToggleScheme` | ヘッダー・ダークモード切替ボタン |
| `SearchPanel` | `src/frontend/components/SearchPanel.tsx` | `city`, `loading`, `error`, `onCityChange`, `onSubmit` | 都市名入力フォーム |
| `WeatherResultPanel` | `src/frontend/components/WeatherResultPanel.tsx` | `data`, `speaking`, `onSpeak` | 天気結果表示・音声ボタン |
| `HistoryPanel` | `src/frontend/components/HistoryPanel.tsx` | `history`, `onSelect`, `onRemove`, `onClear` | 検索履歴リスト |
| `WeatherIcon` | `src/frontend/components/WeatherIcon.tsx` | `code` | 天気コード → SVG アイコン |

### 天気アイコン詳細

| ファイル | 役割 |
|---|---|
| `src/frontend/components/weather-icon/render-icon-shape.tsx` | 天気コード別の SVG パス描画 |
| `src/frontend/components/weather-icon/weather-icon-variants.ts` | `tailwind-variants` による色トークン定義 |

### カスタムフック

| フック | ファイル | 戻り値 | 役割 |
|---|---|---|---|
| `useColorScheme` | `src/frontend/hooks/useColorScheme.ts` | `scheme`, `toggleScheme` | ダークモード管理（OS連動 + 手動切替） |
| `useSearchHistory` | `src/frontend/hooks/useSearchHistory.ts` | `history`, `addHistory`, `removeHistory`, `clearHistory` | 検索履歴（localStorage 保存） |
| `useWeatherSearch` | `src/frontend/hooks/useWeatherSearch.ts` | `city`, `setCity`, `loading`, `error`, `data`, `onSubmit` | 天気検索メインロジック |
| `useWeatherSpeech` | `src/frontend/hooks/useWeatherSpeech.ts` | `speaking`, `speechError`, `speakWeather` | VOICEVOX 音声読み上げ |

### 型定義

| ファイル | 内容 |
|---|---|
| `src/frontend/types/api.ts` | `ApiErrorResponse` |
| `src/frontend/types/weather.ts` | `WeatherResponse` |
| `src/frontend/weather/weather-condition.ts` | 天気コード判定ロジック |

## バックエンド構成

### ルート (`src/backend/routes/`)

| ファイル | エンドポイント | 役割 |
|---|---|---|
| `health.ts` | GET `/health` | `{ ok: true }` を返す |
| `convert-to-romaji.ts` | POST `/convert-to-romaji` | Kuroshiro で日本語→ローマ字 |
| `weather.ts` | GET `/weather?city=` | Open-Meteo ジオコーディング→天気取得 |
| `speech.ts` | GET `/speech?text=&speaker=` | VOICEVOX audio_query → synthesis → WAV |

### サービス (`src/backend/services/`)

| ファイル | 役割 |
|---|---|
| `api-response.ts` | `jsonError(c, status, message)` 共通ユーティリティ |
| `http.ts` | タイムアウト付き fetch（5秒） |
| `weather-search.ts` | Open-Meteo Geocoding API + 都道府県→代表都市フォールバック |
| `prefecture-to-city.ts` | 都道府県名→代表都市マッピングテーブル |
| `romaji-converter.ts` | Kuroshiro + wanakana ローマ字変換（シングルトン初期化） |
| `voicevox-speech.ts` | VOICEVOX HTTP API 呼び出し（タイムアウト付き） |

### Zod スキーマ (`src/backend/schemas/index.ts`)

- `convertToRomajiBodySchema`
- `weatherQuerySchema`
- `speechQuerySchema`
- `forecastResponseSchema`

## データフロー

### 天気検索フロー

1. `SearchPanel` → `onSubmit` → `useWeatherSearch.onSubmit`
2. `useWeatherSearch`: 日本語入力を `POST /api/convert-to-romaji` でローマ字化
3. `GET /api/weather?city=<romaji>` → バックエンド
4. バックエンド: Open-Meteo Geocoding → 緯度経度取得 → forecast API → `WeatherResponse`
5. `WeatherResultPanel` に結果表示 / `useSearchHistory.addHistory` で履歴追加

### 音声合成フロー

1. `WeatherResultPanel` の「読み上げ」ボタン → `speakWeather()`
2. `useWeatherSpeech`: 読み上げテキスト生成 → `GET /api/speech?text=...`
3. バックエンド: VOICEVOX `POST /audio_query`（5秒タイムアウト）→ `POST /synthesis`（10秒タイムアウト）
4. WAV バイナリ → `Blob` → `Audio.play()`
5. エラー時: `speechError` をトーストで4秒表示

## 規約と禁止事項

- 天気アイコンの色トークンは **`tailwind-variants`** で管理（Tailwind クラス直書き禁止）
- inline SVG には **`xmlns="http://www.w3.org/2000/svg"`** を必ず付ける
- Tailwind v4 は `src/frontend/index.css` の `@source` を正とする（`tailwind.config.js` の `content` は使わない）
- 新しいコンポーネント・フックを作る前に既存の再利用を検討する
- PR / コミットの差分は最小限に。無関係な整形は含めない

## 既知の制約

- VOICEVOX Engine はローカル Docker サイドカー必須（`http://voicevox-engine:50021`）
- Kuroshiro は初回初期化に数秒かかる（シングルトンで解決済み）
- `src/components/SearchPanel.tsx` は旧ファイルで未使用。正は `src/frontend/components/SearchPanel.tsx`
