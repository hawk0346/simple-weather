// @ts-ignore - kuroshiro lacks type definitions
import Kuroshiro from "kuroshiro";
// @ts-ignore - kuroshiro-analyzer-kuromoji lacks type definitions
import KuromojiAnalyzer from "kuroshiro-analyzer-kuromoji";
import { normalizeRomaji } from "../../shared/normalize-romaji";

const kuroshiro = new Kuroshiro();
let kuroshiroReady = false;
let initError: Error | null = null;

// Initialize kuroshiro on startup with proper error handling
const kuroshiroInitialization = kuroshiro
  .init(new KuromojiAnalyzer())
  .then(() => {
    kuroshiroReady = true;
    console.log("Kuroshiro initialized successfully");
  })
  .catch((error: Error) => {
    initError = error;
    console.error("Failed to initialize Kuroshiro:", error);
  });

export async function waitForRomajiConverterInitialization(): Promise<void> {
  await kuroshiroInitialization;
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
  const { toRomaji } = await import("wanakana");

  try {
    const hiragana = await kuroshiro.convert(text, {
      to: "hiragana",
    });
    return normalizeRomaji(toRomaji(hiragana));
  } catch (error) {
    console.warn(
      "Kuroshiro conversion failed. Falling back to wanakana-only conversion:",
      error,
    );
    return normalizeRomaji(toRomaji(text));
  }
}
