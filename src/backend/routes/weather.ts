import type { Hono } from "hono";
import { forecastResponseSchema, weatherQuerySchema } from "../schemas";
import { fetchWithGuard } from "../services/http";
import {
  buildFallbackNotice,
  searchCityWithFallback,
} from "../services/weather-search";

export function registerWeatherRoute(app: Hono): void {
  app.get("/weather", async (context) => {
    const parsed = weatherQuerySchema.safeParse({
      city: context.req.query("city"),
      originalCity: context.req.query("originalCity"),
    });

    if (!parsed.success) {
      return context.json(
        {
          ok: false,
          message: "市区町村のクエリは必須です。",
        },
        400,
      );
    }

    const city = parsed.data.city;
    const originalCity = parsed.data.originalCity ?? city;

    const searchResult = await searchCityWithFallback(city);
    if (!searchResult.ok) {
      return context.json(
        {
          ok: false,
          message: searchResult.error,
        },
        searchResult.status,
      );
    }

    const location = searchResult.location;

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(location.latitude));
    forecastUrl.searchParams.set("longitude", String(location.longitude));
    forecastUrl.searchParams.set(
      "current",
      "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    );
    forecastUrl.searchParams.set("timezone", "Asia/Tokyo");

    const forecastResponse = await fetchWithGuard(forecastUrl);
    if (!forecastResponse.ok) {
      return context.json(
        {
          ok: false,
          message:
            "天気情報サービスへの接続に失敗しました。しばらくしてから再度お試しください。",
        },
        502,
      );
    }

    const forecastJson = await forecastResponse.json();
    const forecastParsed = forecastResponseSchema.safeParse(forecastJson);
    if (!forecastParsed.success) {
      return context.json(
        {
          ok: false,
          message:
            "天気情報サービスの応答形式が不正です。しばらくしてから再度お試しください。",
        },
        502,
      );
    }

    return context.json({
      ok: true,
      city: location.name,
      country: location.country,
      notice: searchResult.isPrefectureSubstitute
        ? buildFallbackNotice(originalCity, location.name)
        : undefined,
      current: {
        time: forecastParsed.data.current.time,
        temperatureC: forecastParsed.data.current.temperature_2m,
        humidity: forecastParsed.data.current.relative_humidity_2m,
        weatherCode: forecastParsed.data.current.weather_code,
        windSpeed: forecastParsed.data.current.wind_speed_10m,
      },
    });
  });
}
