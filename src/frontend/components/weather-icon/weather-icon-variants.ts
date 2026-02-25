import { tv } from "tailwind-variants";

export type WeatherIconSize = "sm" | "md" | "lg";

export const weatherIconVariants = tv({
  slots: {
    container: "inline-flex items-center justify-center rounded-full",
    icon: "",
  },
  variants: {
    size: {
      sm: { container: "p-1.5", icon: "h-5 w-5" },
      md: { container: "p-2", icon: "h-6 w-6" },
      lg: { container: "p-2.5", icon: "h-7 w-7" },
    },
    condition: {
      sunny: { container: "bg-amber-100 text-amber-500" },
      partlyCloudy: { container: "bg-sky-100 text-sky-600" },
      fog: { container: "bg-slate-100 text-slate-500" },
      rain: { container: "bg-blue-100 text-blue-600" },
      snow: { container: "bg-cyan-100 text-cyan-600" },
      thunder: { container: "bg-violet-100 text-violet-600" },
      unknown: { container: "bg-gray-100 text-gray-500" },
    },
  },
  defaultVariants: {
    size: "md",
    condition: "unknown",
  },
});
