import type { HistoryItem } from "../hooks/useSearchHistory";

type HistoryPanelProps = {
  history: HistoryItem[];
  onSelect: (city: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
};

export default function HistoryPanel({
  history,
  onSelect,
  onRemove,
  onClear,
}: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <section className="history-area" aria-label="検索履歴">
      <div className="history-header">
        <h2 className="section-title">検索履歴</h2>
        <button type="button" className="history-clear-btn" onClick={onClear}>
          全削除
        </button>
      </div>
      <ul className="history-list">
        {history.map((item) => (
          <li key={item.id} className="history-item">
            <button
              type="button"
              className="history-city-btn"
              onClick={() => onSelect(item.city)}
            >
              {item.city}
            </button>
            <button
              type="button"
              className="history-remove-btn"
              onClick={() => onRemove(item.id)}
              aria-label={`${item.city}の履歴を削除`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
