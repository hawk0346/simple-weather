import SearchPanel from "./components/SearchPanel";
import WeatherResultPanel from "./components/WeatherResultPanel";
import { useWeatherSearch } from "./hooks/useWeatherSearch";

export default function App() {
  const { city, setCity, loading, error, data, onSubmit } = useWeatherSearch();

  return (
    <main className="app">
      <h1 className="app-title">Weather App</h1>
      <SearchPanel
        city={city}
        loading={loading}
        error={error}
        onCityChange={setCity}
        onSubmit={onSubmit}
      />
      <WeatherResultPanel data={data} />
    </main>
  );
}
