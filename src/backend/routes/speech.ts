import type { Hono } from "hono";
import { speechQuerySchema } from "../schemas";

const DEFAULT_SPEAKER = 1;
const DEFAULT_ENGINE_URL = "http://voicevox-engine:50021";

function buildEngineUrl(path: string): URL {
  const base = process.env.VOICEVOX_ENGINE_URL ?? DEFAULT_ENGINE_URL;
  return new URL(path, base.endsWith("/") ? base : `${base}/`);
}

export function registerSpeechRoute(app: Hono): void {
  app.get("/speech", async (context) => {
    const parsed = speechQuerySchema.safeParse({
      text: context.req.query("text"),
      speaker: context.req.query("speaker"),
    });

    if (!parsed.success) {
      return context.json(
        {
          ok: false,
          message: "読み上げテキストが不正です。",
        },
        400,
      );
    }

    const speaker = parsed.data.speaker ?? DEFAULT_SPEAKER;
    const text = parsed.data.text;

    const audioQueryUrl = buildEngineUrl("audio_query");
    audioQueryUrl.searchParams.set("speaker", String(speaker));
    audioQueryUrl.searchParams.set("text", text);

    const audioQueryResponse = await fetch(audioQueryUrl, {
      method: "POST",
    });

    if (!audioQueryResponse.ok) {
      return context.json(
        {
          ok: false,
          message: "VOICEVOXエンジンへの接続に失敗しました。",
        },
        502,
      );
    }

    const queryJson = await audioQueryResponse.text();

    const synthesisUrl = buildEngineUrl("synthesis");
    synthesisUrl.searchParams.set("speaker", String(speaker));

    const synthesisResponse = await fetch(synthesisUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: queryJson,
    });

    if (!synthesisResponse.ok) {
      return context.json(
        {
          ok: false,
          message: "音声の生成に失敗しました。",
        },
        502,
      );
    }

    const audioBuffer = await synthesisResponse.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Cache-Control": "no-store",
      },
    });
  });
}
