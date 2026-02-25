import { Hono } from "hono";
import { registerConvertToRomajiRoute } from "./routes/convert-to-romaji";
import { registerHealthRoute } from "./routes/health";
import { registerWeatherRoute } from "./routes/weather";

const app = new Hono();

registerHealthRoute(app);
registerConvertToRomajiRoute(app);
registerWeatherRoute(app);

// Graceful shutdown handling
const gracefulShutdown = () => {
  console.log("\nShutting down gracefully...");
  process.exit(0);
};

if (process.env.BUN_ENV !== "browser") {
  process.on("SIGINT", gracefulShutdown);
  process.on("SIGTERM", gracefulShutdown);
}

export default {
  port: Number(process.env.PORT ?? 8787),
  fetch: app.fetch,
};
