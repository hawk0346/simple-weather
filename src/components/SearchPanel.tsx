import type { FormEvent } from "react";

type SearchPanelProps = {
  city: string;
  loading: boolean;
  error: string | null;
  onCityChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function SearchPanel({
  city,
  loading,
  error,
  onCityChange,
  onSubmit,
}: SearchPanelProps) {
  return (
    <section className="search-area" aria-label="検索エリア">
      <h2 className="section-title">都市を検索</h2>
      <form onSubmit={onSubmit} className="search-form">
        <label htmlFor="city">都市名</label>
        <input
          id="city"
          value={city}
          onChange={(event) => onCityChange(event.target.value)}
          placeholder="Tokyo"
        />
        <button type="submit" disabled={loading}>
          {loading ? "取得中..." : "天気を取得"}
        </button>
      </form>
      {error ? <p className="error-text">{error}</p> : null}
    </section>
  );
}
