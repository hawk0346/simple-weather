export type WeatherResponse = {
  ok: boolean;
  city: string;
  country?: string;
  current: {
    time: string;
    temperatureC: number;
    humidity?: number;
    weatherCode?: number;
    windSpeed?: number;
  };
  message?: string;
};
