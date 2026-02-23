import type { ReactNode } from "react";
import type { WeatherCondition } from "../../weather/weather-condition";

export function renderIconShape(condition: WeatherCondition): ReactNode {
  if (condition === "sunny") {
    return (
      <>
        <circle cx="12" cy="12" r="4" fill="currentColor" />
        <path
          d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (condition === "partlyCloudy") {
    return (
      <>
        <circle
          cx="9"
          cy="9"
          r="3"
          fill="currentColor"
          className="opacity-70"
        />
        <path
          d="M8 17h8a3 3 0 100-6 4.5 4.5 0 00-8.7-1.6A3.5 3.5 0 008 17z"
          fill="currentColor"
        />
      </>
    );
  }

  if (condition === "fog") {
    return (
      <path
        d="M4 9h16M3 13h18M5 17h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    );
  }

  if (condition === "rain") {
    return (
      <>
        <path
          d="M7 12.5h9a3 3 0 100-6 4.8 4.8 0 00-9.3-1.5A3.8 3.8 0 007 12.5z"
          fill="currentColor"
        />
        <path
          d="M9 15.5l-1 2M13 15.5l-1 2M17 15.5l-1 2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (condition === "snow") {
    return (
      <>
        <path
          d="M7 12h10a3 3 0 100-6 4.8 4.8 0 00-9.4-1.2A3.8 3.8 0 007 12z"
          fill="currentColor"
        />
        <path
          d="M12 14v6M9.5 15.5l5 3M14.5 15.5l-5 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </>
    );
  }

  if (condition === "thunder") {
    return (
      <>
        <path
          d="M7 12h9a3 3 0 100-6 4.8 4.8 0 00-9.3-1.5A3.8 3.8 0 007 12z"
          fill="currentColor"
        />
        <path d="M12 13l-2 4h2l-1 4 3-5h-2l2-3z" fill="currentColor" />
      </>
    );
  }

  return (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16" r="1" fill="currentColor" />
    </>
  );
}
