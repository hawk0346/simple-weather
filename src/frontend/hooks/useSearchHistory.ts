import { useCallback, useState } from "react";

const HISTORY_KEY = "weather-search-history";
const MAX_HISTORY = 10;

export type HistoryItem = {
  id: string;
  city: string;
  timestamp: number;
};

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryItem[];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);

  const addHistory = useCallback((city: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.city !== city);
      const next = [
        { id: Date.now().toString(), city, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((item) => item.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addHistory, removeHistory, clearHistory };
}
