import type { WeatherResponse } from "../types/weather";
import WeatherIcon from "./WeatherIcon";

type WeatherResultPanelProps = {
  data: WeatherResponse | null;
  speaking: boolean;
  onSpeak: () => void;
};

function formatObservedAtJst(raw: string): string {
  const normalized = raw.trim().replace("T", " ");
  return normalized.length >= 16 ? normalized.slice(0, 16) : normalized;
}

export default function WeatherResultPanel({
  data,
  speaking,
  onSpeak,
}: WeatherResultPanelProps) {
  return (
    <section className="result-area" aria-label="検索結果エリア">
      <h2 className="section-title">検索結果</h2>
      {data ? (
        <article className="weather-card">
          <header className="weather-header">
            <WeatherIcon weatherCode={data.current.weatherCode} />
            <h3>
              {data.city}
              {data.country ? `, ${data.country}` : ""}
            </h3>
          </header>
          {data.notice ? (
            <p className="placeholder-text">{data.notice}</p>
          ) : null}
          <p>気温: {data.current.temperatureC} °C</p>
          <p>湿度: {data.current.humidity ?? "-"}%</p>
          <p>風速: {data.current.windSpeed ?? "-"} km/h</p>
          <p>観測時刻: {formatObservedAtJst(data.current.time)}</p>
          <button type="button" onClick={onSpeak} disabled={speaking}>
            {speaking ? "読み上げ中..." : "読み上げ"}
          </button>
        </article>
      ) : (
        <p className="placeholder-text">検索するとここに結果が表示されます。</p>
      )}
    </section>
  );
}
