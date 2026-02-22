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
      const response = await fetch(`/api/weather?city=${encodeURIComponent(normalizedCity)}`);
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
    <main>
      <h1>Weather App</h1>

      <form onSubmit={onSubmit}>
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

      {error ? <p>{error}</p> : null}

      {data ? (
        <section>
          <h2>
            {data.city}
            {data.country ? `, ${data.country}` : ""}
          </h2>
          <p>気温: {data.current.temperatureC} °C</p>
          <p>湿度: {data.current.humidity ?? "-"}%</p>
          <p>風速: {data.current.windSpeed ?? "-"} km/h</p>
          <p>観測時刻: {formatObservedAtJst(data.current.time)}</p>
        </section>
      ) : null}
    </main>
  );
}
