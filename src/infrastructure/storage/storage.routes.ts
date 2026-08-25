import type { FastifyPluginAsync } from "fastify";
import { checkStorage } from "./storage.service.js";

export const storageRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/v1/storage/health", async (_request, reply) => {
    const healthy = await checkStorage();

    return reply.send({
      status: healthy ? "ok" : "error",
      storage: "local",
    });
  });
};