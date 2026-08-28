import type { FastifyPluginAsync } from "fastify";
import { getJobSchema, updateJobStatusSchema } from "./job.schema.js";
import { toJobResponse } from "./job.mapper.js";
import { getFileProcessingQueueStats } from "../../infrastructure/queue/queue.service.js";
import { changeJobStatus, getJobById, getJobsByFileId } from "./job.service.js";
interface GetJobParams {
  id: string;
}

export const jobRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: GetJobParams }>(
    "/api/v1/jobs/:id",
    {
      schema: getJobSchema,
    },
    async (request, reply) => {
      const job = await getJobById(request.params.id);

      return reply.send(toJobResponse(job));
    },
  );
  app.get("/api/v1/jobs/queue/stats", async (_request, reply) => {
    const stats = await getFileProcessingQueueStats();

    return reply.send({
      data: stats,
    });
  });
  app.patch<{
    Params: {
      id: string;
    };
    Body: {
      status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
    };
  }>(
    "/api/v1/jobs/:id/status",
    {
      schema: updateJobStatusSchema,
    },
    async (request, reply) => {
      const job = await changeJobStatus(request.params.id, request.body.status);

      return reply.send({
        data: job,
      });
    },
  );
};
