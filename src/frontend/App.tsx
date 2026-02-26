import SearchPanel from "./components/SearchPanel";
import WeatherResultPanel from "./components/WeatherResultPanel";
import { useWeatherSearch } from "./hooks/useWeatherSearch";
import { useWeatherSpeech } from "./hooks/useWeatherSpeech";

export default function App() {
  const { city, setCity, loading, error, data, onSubmit } = useWeatherSearch();
  const { speaking, speechError, speakWeather } = useWeatherSpeech(data);

  return (
    <main className="app">
      <header className="app-header">
        <h1 className="app-title">Weather App</h1>
        <p className="credit-text">
          音声合成: <a href="https://voicevox.hiroshiba.jp/">VOICEVOX</a>
          （speaker: 1）
        </p>
      </header>
      <SearchPanel
        city={city}
        loading={loading}
        error={error}
        onCityChange={setCity}
        onSubmit={onSubmit}
      />
      <WeatherResultPanel data={data} speaking={speaking} onSpeak={speakWeather} />
      {speechError ? (
        <p className="speech-toast" role="alert" aria-live="assertive">
          {speechError}
        </p>
      ) : null}
    </main>
  );
}
