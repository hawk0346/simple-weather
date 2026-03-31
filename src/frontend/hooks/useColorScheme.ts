import { useEffect, useState } from "react";

const SCHEME_KEY = "weather-color-scheme";

type ColorScheme = "light" | "dark";

function loadScheme(): ColorScheme {
  try {
    const stored = localStorage.getItem(SCHEME_KEY) as ColorScheme | null;
    if (stored === "light" || stored === "dark") return stored;
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // ignore
  }
  return "light";
}

export function useColorScheme() {
  const [scheme, setScheme] = useState<ColorScheme>(loadScheme);

  useEffect(() => {
    document.documentElement.dataset.theme = scheme;
    try {
      localStorage.setItem(SCHEME_KEY, scheme);
    } catch {
      // ignore
    }
  }, [scheme]);

  const toggleScheme = () => {
    setScheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return { scheme, toggleScheme };
}
