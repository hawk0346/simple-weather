import { Hono } from "hono";
// @ts-ignore - kuroshiro lacks type definitions
import Kuroshiro from "kuroshiro";
// @ts-ignore - kuroshiro-analyzer-kuromoji lacks type definitions
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { z } from "zod";

const app = new Hono();
const FETCH_TIMEOUT_MS = 5000;
const NOT_FOUND_MESSAGE = "検索結果がヒットしませんでした。";
const GEOCODING_FETCH_ERROR_MESSAGE = "Failed to fetch geocoding data";

// Initialize Kuroshiro with Kuromoji analyzer
const kuroshiro = new Kuroshiro();
let kuroshiroReady = false;
let initError: Error | null = null;

// Initialize kuroshiro on startup with proper error handling
kuroshiro
  .init(new KuromojiAnalyzer())
  .then(() => {
    kuroshiroReady = true;
    console.log("Kuroshiro initialized successfully");
  })
  .catch((error: Error) => {
    initError = error;
    console.error("Failed to initialize Kuroshiro:", error);
  });

// Normalize romaji long vowels
function normalizeRomaji(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/oo/g, "o")
    .replace(/([aiueo])u(?=[a-z]|$)/g, "$1");
}

// Prefecture to representative city mapping (47 prefectures)
const prefectureToCity: Record<string, string> = {
  hokkaido: "sapporo",
  aomori: "aomori",
  iwate: "morioka",
  miyagi: "sendai",
  akita: "akita",
  yamagata: "yamagata",
  fukushima: "fukushima",
  ibaraki: "mito",
  tochigi: "utsunomiya",
  gunma: "maebashi",
  saitama: "saitama",
  chiba: "chiba",
  tokyo: "tokyo",
  kanagawa: "yokohama",
  niigata: "niigata",
  toyama: "toyama",
  ishikawa: "kanazawa",
  fukui: "fukui",
  yamanashi: "kofu",
  nagano: "nagano",
  gifu: "gifu",
  shizuoka: "shizuoka",
  aichi: "nagoya",
  mie: "tsu",
  shiga: "otsu",
  kyoto: "kyoto",
  osaka: "osaka",
  hyogo: "kobe",
  nara: "nara",
  wakayama: "wakayama",
  tottori: "tottori",
  shimane: "matsue",
  okayama: "okayama",
  hiroshima: "hiroshima",
  yamaguchi: "yamaguchi",
  tokushima: "tokushima",
  kagawa: "takamatsu",
  ehime: "matsuyama",
  kochi: "kochi",
  fukuoka: "fukuoka",
  saga: "saga",
  nagasaki: "nagasaki",
  kumamoto: "kumamoto",
  oita: "oita",
  miyazaki: "miyazaki",
  kagoshima: "kagoshima",
  okinawa: "naha",
};

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

const forecastResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number().optional(),
    weather_code: z.number().optional(),
    wind_speed_10m: z.number().optional(),
  }),
});

type SearchLocation = {
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

type SearchResult = SearchSuccess | SearchFailure;

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

function buildFallbackNotice(
  originalCity: string,
  locationName: string,
): string {
  return `「${originalCity}」が見つからなかったため、主要都市（${locationName}）で検索しています。`;
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
  return geocodingParsed.success ? (geocodingParsed.data.results ?? []) : [];
}

app.get("/health", (context) => {
  return context.json({ ok: true });
});

app.post("/convert-to-romaji", async (context) => {
  if (initError) {
    return context.json(
      {
        ok: false,
        message: "Converter initialization failed",
      },
      500,
    );
  }

  if (!kuroshiroReady) {
    return context.json(
      {
        ok: false,
        message: "Converter not ready",
      },
      503,
    );
  }

  const bodySchema = z.object({
    text: z.string().min(1).max(100),
  });

  let body: unknown;
  try {
    body = (await context.req.json()) as unknown;
  } catch {
    return context.json(
      {
        ok: false,
        message: "Invalid JSON",
      },
      400,
    );
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return context.json(
      {
        ok: false,
        message: "Invalid request",
      },
      400,
    );
  }

  try {
    // Convert kanji to hiragana
    const hiragana = await kuroshiro.convert(parsed.data.text, {
      to: "hiragana",
    });

    // Convert hiragana to romaji
    const { toRomaji } = await import("wanakana");
    const romaji = normalizeRomaji(toRomaji(hiragana));

    return context.json({
      ok: true,
      romaji,
    });
  } catch (error) {
    console.error("Conversion error:", error);
    return context.json(
      {
        ok: false,
        message: "Conversion failed",
      },
      500,
    );
  }
});

// Helper function to search for city, with fallback to prefecture representative city
async function searchCityWithFallback(cityName: string): Promise<SearchResult> {
  const normalizedCity = cityName.toLowerCase();
  let isPrefectureSubstitute = false;

  // First attempt: search for the exact city name
  const firstResults = await fetchGeocodingResults(normalizedCity);
  if (!Array.isArray(firstResults)) {
    return firstResults;
  }

  let location = firstResults[0];

  // If no results and the city might be a prefecture, try the representative city
  if (!location && prefectureToCity[normalizedCity]) {
    isPrefectureSubstitute = true;
    const representativeCity = prefectureToCity[normalizedCity];

    // Second attempt: search using the representative city
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

app.get("/weather", async (context) => {
  const querySchema = z.object({
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[\p{L}\p{N}\s\-'.]+$/u, "invalid city format"),
    originalCity: z.string().trim().min(1).max(100).optional(),
  });

  const parsed = querySchema.safeParse({
    city: context.req.query("city"),
    originalCity: context.req.query("originalCity"),
  });

  if (!parsed.success) {
    return context.json(
      {
        ok: false,
        message: "city query is required",
      },
      400,
    );
  }

  const city = parsed.data.city;
  const originalCity = parsed.data.originalCity ?? city;

  // Use the helper function to search for city with prefecture fallback
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
        message: "Failed to fetch weather data",
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
        message: "Invalid weather data response",
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

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
};

if (process.env.BUN_ENV !== "browser") {
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

export default {
  port: Number(process.env.PORT ?? 8787),
  fetch: app.fetch,
};

async function fetchWithGuard(url: URL): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    return await fetch(url, {
      signal: controller.signal,
      redirect: "error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
