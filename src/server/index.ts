import { Hono } from "hono";
// @ts-ignore - kuroshiro lacks type definitions
import Kuroshiro from "kuroshiro";
// @ts-ignore - kuroshiro-analyzer-kuromoji lacks type definitions
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { z } from "zod";

const app = new Hono();
const FETCH_TIMEOUT_MS = 5000;

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

app.get("/weather", async (context) => {
  const querySchema = z.object({
    city: z
      .string()
      .trim()
      .min(1)
      .max(100)
      .regex(/^[\p{L}\p{N}\s\-'.]+$/u, "invalid city format"),
  });

  const parsed = querySchema.safeParse({
    city: context.req.query("city"),
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

  const geocodingUrl = new URL(
    "https://geocoding-api.open-meteo.com/v1/search",
  );
  geocodingUrl.searchParams.set("name", city);
  geocodingUrl.searchParams.set("count", "1");
  geocodingUrl.searchParams.set("language", "ja");
  geocodingUrl.searchParams.set("format", "json");

  const geocodingResponse = await fetchWithGuard(geocodingUrl);
  if (!geocodingResponse.ok) {
    return context.json(
      {
        ok: false,
        message: "Failed to fetch geocoding data",
      },
      502,
    );
  }

  const geocodingJson = await geocodingResponse.json();
  const geocodingParsed = geocodingResponseSchema.safeParse(geocodingJson);
  if (!geocodingParsed.success || !geocodingParsed.data.results?.length) {
    return context.json(
      {
        ok: false,
        message: "City not found",
      },
      404,
    );
  }

  const location = geocodingParsed.data.results?.[0];
  if (!location) {
    return context.json(
      {
        ok: false,
        message: "City not found",
      },
      404,
    );
  }

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
