import type { WeatherCondition } from "../../weather/weather-condition";

export const toneClassMap: Record<WeatherCondition, string> = {
  sunny: "bg-amber-100 text-amber-500",
  partlyCloudy: "bg-sky-100 text-sky-600",
  fog: "bg-slate-100 text-slate-500",
  rain: "bg-blue-100 text-blue-600",
  snow: "bg-cyan-100 text-cyan-600",
  thunder: "bg-violet-100 text-violet-600",
  unknown: "bg-gray-100 text-gray-500",
};
