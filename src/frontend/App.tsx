import Header from "./components/Header";
import HistoryPanel from "./components/HistoryPanel";
import SearchPanel from "./components/SearchPanel";
import WeatherResultPanel from "./components/WeatherResultPanel";
import { useColorScheme } from "./hooks/useColorScheme";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { usePwaInstall } from "./hooks/usePwaInstall";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { useWeatherSearch } from "./hooks/useWeatherSearch";
import { useWeatherSpeech } from "./hooks/useWeatherSpeech";

export default function App() {
  const { scheme, toggleScheme } = useColorScheme();
  const online = useOnlineStatus();
  const { canInstall, install, dismiss } = usePwaInstall();
  const { history, addHistory, removeHistory, clearHistory } =
    useSearchHistory();
  const { city, setCity, loading, error, data, onSubmit } =
    useWeatherSearch(addHistory);
  const { speaking, speechError, speakWeather } = useWeatherSpeech(data);

  function handleHistorySelect(selectedCity: string) {
    setCity(selectedCity);
  }

  return (
    <div className="app">
      <Header scheme={scheme} onToggleScheme={toggleScheme} />
      {!online && (
        <output className="offline-banner">
          オフラインです。検索・音声読み上げは利用できません。
        </output>
      )}
      {canInstall && (
        <div className="install-banner" role="complementary">
          <span>ホーム画面に追加してオフラインでも使えます</span>
          <div className="install-banner-actions">
            <button type="button" className="install-btn" onClick={install}>
              追加
            </button>
            <button
              type="button"
              className="install-dismiss-btn"
              onClick={dismiss}
              aria-label="閉じる"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <main className="app-main">
        <div className="column-left">
          <SearchPanel
            city={city}
            loading={loading}
            error={error}
            offline={!online}
            onCityChange={setCity}
            onSubmit={onSubmit}
          />
          <HistoryPanel
            history={history}
            onSelect={handleHistorySelect}
            onRemove={removeHistory}
            onClear={clearHistory}
          />
        </div>
        <div className="column-right">
          <WeatherResultPanel
            data={data}
            speaking={speaking}
            onSpeak={speakWeather}
          />
          <p className="credit-text">
            音声合成: <a href="https://voicevox.hiroshiba.jp/">VOICEVOX</a>
            （speaker: 1）
          </p>
        </div>
      </main>
      {speechError ? (
        <p className="speech-toast" role="alert" aria-live="assertive">
          {speechError}
        </p>
      ) : null}
    </div>
  );
}
