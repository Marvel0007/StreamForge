import type { FastifyPluginAsync } from "fastify";
import { getJobById } from "./job.service.js";
import { getJobSchema } from "./job.schema.js";
import { toJobResponse } from "./job.mapper.js";

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
};