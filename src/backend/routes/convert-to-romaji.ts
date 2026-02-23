import type { Hono } from "hono";
import { convertToRomajiBodySchema } from "../schemas";
import {
  convertToRomaji,
  getRomajiConverterStatus,
} from "../services/romaji-converter";

export function registerConvertToRomajiRoute(app: Hono): void {
  app.post("/convert-to-romaji", async (context) => {
    const converterStatus = getRomajiConverterStatus();

    if (converterStatus.initError) {
      return context.json(
        {
          ok: false,
          message: "Converter initialization failed",
        },
        500,
      );
    }

    if (!converterStatus.ready) {
      return context.json(
        {
          ok: false,
          message: "Converter not ready",
        },
        503,
      );
    }

    let body: unknown;
    try {
      body = (await context.req.json()) as unknown;
    } catch {
      return context.json(
        {
          ok: false,
          message: "Invalid JSON",
        },
        400,
      );
    }

    const parsed = convertToRomajiBodySchema.safeParse(body);
    if (!parsed.success) {
      return context.json(
        {
          ok: false,
          message: "Invalid request",
        },
        400,
      );
    }

    try {
      const romaji = await convertToRomaji(parsed.data.text);

      return context.json({
        ok: true,
        romaji,
      });
    } catch (error) {
      console.error("Conversion error:", error);
      return context.json(
        {
          ok: false,
          message: "Conversion failed",
        },
        500,
      );
    }
  });
}
