export function normalizeRomaji(romaji: string): string {
  return romaji
    .toLowerCase()
    .replace(/oo/g, "o")
    .replace(/([aiueo])u(?=[a-z]|$)/g, "$1");
}