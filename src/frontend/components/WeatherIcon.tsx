import { getWeatherCondition } from "../weather/weather-condition";
import { renderIconShape } from "./weather-icon/render-icon-shape";
import {
  type WeatherIconSize,
  weatherIconVariants,
} from "./weather-icon/weather-icon-variants";

type WeatherIconProps = {
  weatherCode?: number;
  size?: WeatherIconSize;
};

export default function WeatherIcon({
  weatherCode,
  size = "md",
}: WeatherIconProps) {
  const condition = getWeatherCondition(weatherCode);
  const classes = weatherIconVariants({ size, condition });

  return (
    <span className={classes.container()}>
      <svg
        className={classes.icon()}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        {renderIconShape(condition)}
      </svg>
    </span>
  );
}
