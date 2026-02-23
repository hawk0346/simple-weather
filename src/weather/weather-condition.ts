export type WeatherCondition =
  | "unknown"
  | "sunny"
  | "partlyCloudy"
  | "fog"
  | "rain"
  | "snow"
  | "thunder";

export function getWeatherCondition(weatherCode?: number): WeatherCondition {
  if (weatherCode == null) return "unknown";
  if (weatherCode === 0) return "sunny";
  if (weatherCode <= 3) return "partlyCloudy";
  if (weatherCode === 45 || weatherCode === 48) return "fog";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  ) {
    return "rain";
  }
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) return "snow";
  if ([95, 96, 99].includes(weatherCode)) return "thunder";
  return "partlyCloudy";
}
