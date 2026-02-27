import type { Hono } from "hono";
import { speechQuerySchema } from "../schemas";
import { jsonError } from "../services/api-response";
import { synthesizeVoiceByVoicevox } from "../services/voicevox-speech";

const DEFAULT_SPEAKER = 1;

export function registerSpeechRoute(app: Hono): void {
  app.get("/speech", async (context) => {
    const parsed = speechQuerySchema.safeParse({
      text: context.req.query("text"),
      speaker: context.req.query("speaker"),
    });

    if (!parsed.success) {
      return jsonError(context, 400, "読み上げテキストが不正です。");
    }

    const speaker = parsed.data.speaker ?? DEFAULT_SPEAKER;
    const text = parsed.data.text;
    const result = await synthesizeVoiceByVoicevox(text, speaker);

    if (!result.ok) {
      return jsonError(context, result.status, result.message);
    }

    return new Response(result.audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  });
}
