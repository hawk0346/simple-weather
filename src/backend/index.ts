import { Hono } from "hono";
import { registerConvertToRomajiRoute } from "./routes/convert-to-romaji";
import { registerHealthRoute } from "./routes/health";
import { registerSpeechRoute } from "./routes/speech";
import { registerWeatherRoute } from "./routes/weather";
import { jsonError } from "./services/api-response";

const app = new Hono();

// Global error handler
app.onError((err, context) => {
  console.error("[unhandled error]", err);
  return jsonError(context, 500, "サーバーエラーが発生しました。");
});

registerHealthRoute(app);
registerConvertToRomajiRoute(app);
registerWeatherRoute(app);
registerSpeechRoute(app);

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
};

if (process.env.BUN_ENV !== "browser") {
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
  process.on("uncaughtException", (err) => {
    console.error("[uncaughtException]", err);
  });
  process.on("unhandledRejection", (reason) => {
    console.error("[unhandledRejection]", reason);
  });
}

export default {
  port: Number(process.env.PORT ?? 8787),
  fetch: app.fetch,
};
