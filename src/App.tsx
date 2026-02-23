import { useState } from "react";
import type { FormEvent } from "react";

type WeatherResponse = {
  ok: boolean;
  city: string;
  country?: string;
  current: {
    time: string;
    temperatureC: number;
    humidity?: number;
    weatherCode?: number;
    windSpeed?: number;
  };
  message?: string;
};

function formatObservedAtJst(raw: string): string {
  const normalized = raw.trim().replace("T", " ");
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
}

function getWeatherIcon(weatherCode?: number): string {
  if (weatherCode == null) return "❔";
  if (weatherCode === 0) return "☀️";
  if (weatherCode <= 3) return "⛅";
  if (weatherCode === 45 || weatherCode === 48) return "🌫️";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return "🌧️";
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "🌨️";
  if ([95, 96, 99].includes(weatherCode)) return "⛈️";
  return "🌤️";
}

export default function App() {
  const [city, setCity] = useState("Tokyo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherResponse | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedCity = city.trim();
    if (!normalizedCity) {
      setError("都市名を入力してください");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(normalizedCity)}`,
      );
      const json = (await response.json()) as WeatherResponse;

      if (!response.ok || !json.ok) {
        setData(null);
        setError(json.message ?? "天気情報の取得に失敗しました");
        return;
      }

      setData(json);
    } catch {
      setData(null);
      setError("API サーバーへ接続できませんでした");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <h1 className="app-title">Weather App</h1>

      <section className="search-area" aria-label="検索エリア">
        <h2 className="section-title">都市を検索</h2>
        <form onSubmit={onSubmit} className="search-form">
          <label htmlFor="city">都市名</label>
          <input
            id="city"
            value={city}
            onChange={(event) => setCity(event.target.value)}
            placeholder="Tokyo"
          />
          <button type="submit" disabled={loading}>
            {loading ? "取得中..." : "天気を取得"}
          </button>
        </form>
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="result-area" aria-label="検索結果エリア">
        <h2 className="section-title">検索結果</h2>
        {data ? (
          <article className="weather-card">
            <header className="weather-header">
              <span className="weather-icon" aria-hidden="true">
                {getWeatherIcon(data.current.weatherCode)}
              </span>
              <h3>
                {data.city}
                {data.country ? `, ${data.country}` : ""}
              </h3>
            </header>
            <p>気温: {data.current.temperatureC} °C</p>
            <p>湿度: {data.current.humidity ?? "-"}%</p>
            <p>風速: {data.current.windSpeed ?? "-"} km/h</p>
            <p>観測時刻: {formatObservedAtJst(data.current.time)}</p>
          </article>
        ) : (
          <p className="placeholder-text">
            検索するとここに結果が表示されます。
          </p>
        )}
      </section>
    </main>
  );
}
