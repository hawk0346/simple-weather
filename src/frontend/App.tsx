import Header from "./components/Header";
import HistoryPanel from "./components/HistoryPanel";
import SearchPanel from "./components/SearchPanel";
import WeatherResultPanel from "./components/WeatherResultPanel";
import { useColorScheme } from "./hooks/useColorScheme";
import { useSearchHistory } from "./hooks/useSearchHistory";
import { useWeatherSearch } from "./hooks/useWeatherSearch";
import { useWeatherSpeech } from "./hooks/useWeatherSpeech";

export default function App() {
  const { scheme, toggleScheme } = useColorScheme();
  const { history, addHistory, removeHistory, clearHistory } = useSearchHistory();
  const { city, setCity, loading, error, data, onSubmit } = useWeatherSearch(addHistory);
  const { speaking, speechError, speakWeather } = useWeatherSpeech(data);

  function handleHistorySelect(selectedCity: string) {
    setCity(selectedCity);
  }

  return (
    <div className="app">
      <Header scheme={scheme} onToggleScheme={toggleScheme} />
      <main className="app-main">
        <SearchPanel
          city={city}
          loading={loading}
          error={error}
          onCityChange={setCity}
          onSubmit={onSubmit}
        />
        <WeatherResultPanel data={data} speaking={speaking} onSpeak={speakWeather} />
        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
          onRemove={removeHistory}
          onClear={clearHistory}
        />
        <p className="credit-text">
          音声合成: <a href="https://voicevox.hiroshiba.jp/">VOICEVOX</a>（speaker: 1）
        </p>
      </main>
      {speechError ? (
        <p className="speech-toast" role="alert" aria-live="assertive">
          {speechError}
        </p>
      ) : null}
    </div>
  );
}
