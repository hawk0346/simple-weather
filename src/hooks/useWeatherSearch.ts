import { useState } from "react";
import type { FormEvent } from "react";
import type { WeatherResponse } from "../types/weather";

export function useWeatherSearch() {
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

  return {
    city,
    setCity,
    loading,
    error,
    data,
    onSubmit,
  };
}
