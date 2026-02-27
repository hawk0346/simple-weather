import { useEffect, useState } from "react";
import type { ApiErrorResponse } from "../types/api";
import type { WeatherResponse } from "../types/weather";

const SPEECH_ERROR_MESSAGE = "読み上げ音声の生成に失敗しました";

async function resolveSpeechErrorMessage(
  response: Response,
): Promise<string> {
  try {
    const payload = (await response.json()) as ApiErrorResponse;
    return payload.message || SPEECH_ERROR_MESSAGE;
  } catch {
    return SPEECH_ERROR_MESSAGE;
  }
}

function resolveWeatherLabel(weatherCode?: number): string {
  if (weatherCode == null) return "不明";
  if (weatherCode === 0) return "晴れ";
  if (weatherCode <= 3) return "くもり";
  if (weatherCode === 45 || weatherCode === 48) return "霧";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return "雨";
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "雪";
  if ([95, 96, 99].includes(weatherCode)) return "雷雨";
  return "くもり";
}

function buildSpeechText(payload: WeatherResponse): string {
  const weatherLabel = resolveWeatherLabel(payload.current.weatherCode);
  const humidity = payload.current.humidity ?? "不明";
  const wind = payload.current.windSpeed ?? "不明";

  return `${payload.city}の現在の天気をお知らせします。天気は${weatherLabel}、気温は${payload.current.temperatureC}度、湿度は${humidity}パーセント、風速は${wind}キロメートル毎時です。`;
}

export function useWeatherSpeech(data: WeatherResponse | null) {
  const [speaking, setSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  useEffect(() => {
    setSpeechError(null);
  }, [data?.city, data?.current.time]);

  useEffect(() => {
    if (!speechError) return;

    const timeout = setTimeout(() => {
      setSpeechError(null);
    }, 4000);

    return () => {
      clearTimeout(timeout);
    };
  }, [speechError]);

  async function speakWeather() {
    if (!data || speaking) return;

    setSpeaking(true);
    try {
      const params = new URLSearchParams({
        text: buildSpeechText(data),
      });
      const response = await fetch(`/api/speech?${params.toString()}`);

      if (!response.ok) {
        setSpeechError(await resolveSpeechErrorMessage(response));
        return;
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch {
      setSpeechError(SPEECH_ERROR_MESSAGE);
    } finally {
      setSpeaking(false);
    }
  }

  return {
    speaking,
    speechError,
    speakWeather,
  };
}
