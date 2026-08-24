import type { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "../shared/errors/app-error";

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler(
    (error: FastifyError, request, reply) => {
      if (error instanceof AppError) {
        request.log.warn(
          {
            code: error.code,
            statusCode: error.statusCode,
          },
          error.message,
        );

        return reply.status(error.statusCode).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }

      if (error.code === "FST_ERR_VALIDATION") {
        request.log.warn(
          {
            code: error.code,
            validation: error.validation,
          },
          "Request validation failed",
        );

        return reply.status(400).send({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
          },
        });
      }

      request.log.error(error);

      return reply.status(500).send({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      });
    },
  );
}