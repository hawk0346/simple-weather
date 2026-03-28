import type { HistoryItem } from "../hooks/useSearchHistory";
import CollapsibleSection from "./CollapsibleSection";

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
    <CollapsibleSection
      title="検索履歴"
      defaultOpen={false}
      className="history-area"
      actions={
        <button type="button" className="history-clear-btn" onClick={onClear}>
          全削除
        </button>
      }
    >
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
    </CollapsibleSection>
  );
}
