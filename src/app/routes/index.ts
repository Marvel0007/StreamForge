import type { FastifyPluginAsync } from "fastify";
import { fileRoutes } from "../../modules/files/file.routes.js";

export const registerRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/v1/health", async () => {
    return {
      status: "ok",
      service: "streamforge",
      version: "v1",
    };
  });

  await app.register(fileRoutes);
};