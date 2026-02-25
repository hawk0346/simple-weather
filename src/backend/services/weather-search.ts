import { z } from "zod";
import { fetchWithGuard } from "./http";
import { prefectureToCity } from "./prefecture-to-city";

const NOT_FOUND_MESSAGE = "検索結果がヒットしませんでした。";
const GEOCODING_FETCH_ERROR_MESSAGE =
  "位置情報サービスへの接続に失敗しました。しばらくしてから再度お試しください。";
const GEOCODING_PARSE_ERROR_MESSAGE =
  "位置情報サービスの応答形式が不正です。しばらくしてから再度お試しください。";

const geocodingResponseSchema = z.object({
  results: z
    .array(
      z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        country: z.string().optional(),
      }),
    )
    .optional(),
});

export type SearchLocation = {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
};

type SearchSuccess = {
  ok: true;
  location: SearchLocation;
  isPrefectureSubstitute: boolean;
};

type SearchFailure = {
  ok: false;
  error: string;
  status: 404 | 502;
};

export type SearchResult = SearchSuccess | SearchFailure;

function buildGeocodingUrl(cityName: string): URL {
  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );
  geocodingUrl.searchParams.set("name", cityName);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "ja");
  geocodingUrl.searchParams.set("format", "json");
  geocodingUrl.searchParams.set("countryCode", "JP");
  return geocodingUrl;
}

async function fetchGeocodingResults(
  cityName: string,
): Promise<SearchLocation[] | SearchFailure> {
  const geocodingResponse = await fetchWithGuard(buildGeocodingUrl(cityName));
  if (!geocodingResponse.ok) {
    return {
      ok: false,
      error: GEOCODING_FETCH_ERROR_MESSAGE,
      status: 502,
    };
  }

  const geocodingJson = await geocodingResponse.json();
  const geocodingParsed = geocodingResponseSchema.safeParse(geocodingJson);
  if (!geocodingParsed.success) {
    return {
      ok: false,
      error: GEOCODING_PARSE_ERROR_MESSAGE,
      status: 502,
    };
  }

  return geocodingParsed.data.results ?? [];
}

export async function searchCityWithFallback(
  cityName: string,
): Promise<SearchResult> {
  const normalizedCity = cityName.toLowerCase();
  let isPrefectureSubstitute = false;

  const firstResults = await fetchGeocodingResults(normalizedCity);
  if (!Array.isArray(firstResults)) {
    return firstResults;
  }

  let location = firstResults[0];

  if (!location && prefectureToCity[normalizedCity]) {
    isPrefectureSubstitute = true;
    const representativeCity = prefectureToCity[normalizedCity];

    const secondResults = await fetchGeocodingResults(representativeCity);
    if (!Array.isArray(secondResults)) {
      return secondResults;
    }

    location = secondResults[0];
  }

  if (!location) {
    return {
      ok: false,
      error: NOT_FOUND_MESSAGE,
      status: 404,
    };
  }

  return {
    ok: true,
    location,
    isPrefectureSubstitute,
  };
}

export function buildFallbackNotice(
  originalCity: string,
  locationName: string,
): string {
  return `「${originalCity}」が見つからなかったため、主要都市（${locationName}）で検索しています。`;
}
