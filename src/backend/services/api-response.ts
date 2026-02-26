import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiErrorResponse = {
  ok: false;
  message: string;
};

export function jsonError(
  context: Context,
  status: ContentfulStatusCode,
  message: string,
): Response {
  return context.json({ ok: false, message } satisfies ApiErrorResponse, status);
}
