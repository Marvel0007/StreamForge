import Fastify from "fastify";
import { registerErrorHandler } from "./error-handler.js";
import { registerRoutes } from "./routes/index.js";
import multipart from "@fastify/multipart";

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

  app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024,
      files: 1,
    },
  });

  app.register(registerRoutes);

  return app;
}
