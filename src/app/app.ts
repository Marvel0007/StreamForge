import Fastify from "fastify";
import { registerErrorHandler } from "./error-handler.js";
import { registerRoutes } from "./routes/index.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
    requestIdHeader: "x-request-id",
  });

  registerErrorHandler(app);

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "streamforge",
    };
  });

  app.register(registerRoutes);

  return app;
}