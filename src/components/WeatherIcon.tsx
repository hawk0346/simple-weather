import { getWeatherCondition } from "../weather/weather-condition";
import { renderIconShape } from "./weather-icon/render-icon-shape";
import { toneClassMap } from "./weather-icon/tone-class-map";

type WeatherIconProps = {
  weatherCode?: number;
  size?: "sm" | "md" | "lg";
};

type IconSizeClass = {
  container: string;
  icon: string;
};

const sizeClassMap = {
  sm: { container: "p-1.5", icon: "h-5 w-5" },
  md: { container: "p-2", icon: "h-6 w-6" },
  lg: { container: "p-2.5", icon: "h-7 w-7" },
} satisfies Record<NonNullable<WeatherIconProps["size"]>, IconSizeClass>;

export default function WeatherIcon({
  weatherCode,
  size = "md",
}: WeatherIconProps) {
  const condition = getWeatherCondition(weatherCode);
  const sizeClasses = sizeClassMap[size];

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full ${toneClassMap[condition]} ${sizeClasses.container}`}
    >
      <svg
        className={sizeClasses.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {renderIconShape(condition)}
      </svg>
    </span>
  );
}
