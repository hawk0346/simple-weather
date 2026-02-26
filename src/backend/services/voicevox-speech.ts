import type { ContentfulStatusCode } from "hono/utils/http-status";

const DEFAULT_SPEAKER = 1;
const DEFAULT_ENGINE_URL = "http://voicevox-engine:50021";

export type VoicevoxSynthesisResult =
  | { ok: true; audio: ArrayBuffer }
  | { ok: false; status: ContentfulStatusCode; message: string };

function buildEngineUrl(path: string): URL {
  const base = process.env.VOICEVOX_ENGINE_URL ?? DEFAULT_ENGINE_URL;
  return new URL(path, base.endsWith("/") ? base : `${base}/`);
}

export async function synthesizeVoiceByVoicevox(
  text: string,
  speaker = DEFAULT_SPEAKER,
): Promise<VoicevoxSynthesisResult> {
  const audioQueryUrl = buildEngineUrl("audio_query");
  audioQueryUrl.searchParams.set("speaker", String(speaker));
  audioQueryUrl.searchParams.set("text", text);

  const audioQueryResponse = await fetch(audioQueryUrl, {
    method: "POST",
  });

  if (!audioQueryResponse.ok) {
    return {
      ok: false,
      status: 502,
      message: "VOICEVOXエンジンへの接続に失敗しました。",
    };
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
    return {
      ok: false,
      status: 502,
      message: "音声の生成に失敗しました。",
    };
  }

  return {
    ok: true,
    audio: await synthesisResponse.arrayBuffer(),
  };
}
