import { useState } from "react";
import type { FormEvent } from "react";
import { toRomaji } from "wanakana";
import type { WeatherResponse } from "../types/weather";

// Normalize romaji long vowels (oo→o, ou→o, uu→u, etc.)
function normalizeRomaji(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/oo/g, "o")
    .replace(/([aiueo])u(?=[a-z]|$)/g, "$1");
}

export function useWeatherSearch() {
  const [city, setCity] = useState("Tokyo");
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
      // Convert Japanese to romaji
      const romajiCity = await convertToRomaji(normalizedCity);

      const response = await fetch(
        `/api/weather?city=${encodeURIComponent(romajiCity)}`,
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
