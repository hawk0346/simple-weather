// @ts-ignore - kuroshiro lacks type definitions
import Kuroshiro from "kuroshiro";
// @ts-ignore - kuroshiro-analyzer-kuromoji lacks type definitions
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";

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

function normalizeRomaji(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/oo/g, "o")
    .replace(/([aiueo])u(?=[a-z]|$)/g, "$1");
}

export function getRomajiConverterStatus(): {
  ready: boolean;
  initError: Error | null;
} {
  return {
    ready: kuroshiroReady,
    initError,
  };
}

export async function convertToRomaji(text: string): Promise<string> {
  const hiragana = await kuroshiro.convert(text, {
    to: "hiragana",
  });

  const { toRomaji } = await import("wanakana");
  return normalizeRomaji(toRomaji(hiragana));
}
