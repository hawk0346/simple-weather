import { z } from "zod";

export const convertToRomajiBodySchema = z.object({
  text: z.string().min(1).max(100),
});

export const weatherQuerySchema = z.object({
  city: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[\p{L}\p{N}\s\-'.]+$/u, "invalid city format"),
  originalCity: z.string().trim().min(1).max(100).optional(),
});

export const speechQuerySchema = z.object({
  text: z.string().trim().min(1).max(300),
  speaker: z.coerce.number().int().positive().max(999999).optional(),
});

export const forecastResponseSchema = z.object({
  current: z.object({
    time: z.string(),
    temperature_2m: z.number(),
    relative_humidity_2m: z.number().optional(),
    weather_code: z.number().optional(),
    wind_speed_10m: z.number().optional(),
  }),
});
