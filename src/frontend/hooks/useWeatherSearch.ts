import { useState } from "react";
import type { FormEvent } from "react";
import { toRomaji } from "wanakana";
import type { WeatherResponse } from "../types/weather";
import { normalizeRomaji } from "../../shared/normalize-romaji";

const NOT_FOUND_MESSAGE = "検索結果がヒットしませんでした。";
const WEATHER_FETCH_ERROR_MESSAGE = "天気情報の取得に失敗しました";
const API_CONNECTION_ERROR_MESSAGE = "API サーバーへ接続できませんでした";

function buildWeatherQuery(romajiCity: string, originalCity: string): string {
  const params = new URLSearchParams({
    city: romajiCity,
    originalCity,
  });
  return `/api/weather?${params.toString()}`;
}

function resolveErrorMessage(
  responseStatus: number,
  payload: WeatherResponse,
): string {
  if (responseStatus === 404) {
    return NOT_FOUND_MESSAGE;
  }

  return payload.message ?? WEATHER_FETCH_ERROR_MESSAGE;
}

export function useWeatherSearch() {
  const [city, setCity] = useState("東京");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<WeatherResponse | null>(null);

  async function convertToRomaji(input: string): Promise<string> {
    try {
      // Try to convert kanji to hiragana via server
      const response = await fetch("/api/convert-to-romaji", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (response.ok) {
        const data = (await response.json()) as { romaji: string };
        return data.romaji;
      }
    } catch {
      // Fallback to client-side conversion
    }

    // Client-side fallback: use wanakana for hiragana/katakana
    return normalizeRomaji(toRomaji(input));
  }

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
      const originalCity = normalizedCity;
      // Convert Japanese to romaji
      const romajiCity = await convertToRomaji(normalizedCity);

      const response = await fetch(buildWeatherQuery(romajiCity, originalCity));
      const json = (await response.json()) as WeatherResponse;

      if (!response.ok || !json.ok) {
        setData(null);
        setError(resolveErrorMessage(response.status, json));
        return;
      }

      setData(json);
    } catch {
      setData(null);
      setError(API_CONNECTION_ERROR_MESSAGE);
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
