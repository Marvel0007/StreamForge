import type { FastifyPluginAsync } from "fastify";
import {
  createFileRecord,
  getFileByIdForUser,
  getFilesByUserId,
  removeFileForUser,
  removeFile,
  getFileById,
} from "./file.service.js";
import {
  createFileSchema,
  fileOwnershipSchema,
  listFilesSchema,
} from "./file.schema.js";
import { toFileResponse } from "./file.mapper.js";
interface CreateFileBody {
  userId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: number;
}

interface ListFilesQuery {
  userId: string;
  limit?: number;
  cursor?: string;
}

interface FileOwnershipQuery {
  userId: string;
}

export const fileRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/v1/files/test", async () => {
    return {
      status: "ok",
      module: "files",
    };
  });

  app.post<{ Body: CreateFileBody }>(
    "/api/v1/files",
    {
      schema: createFileSchema,
    },
    async (request, reply) => {
      const file = await createFileRecord({
        originalName: request.body.originalName,
        storageKey: request.body.storageKey,
        mimeType: request.body.mimeType,
        size: BigInt(request.body.size),
        user: {
          connect: {
            id: request.body.userId,
          },
        },
      });

      return reply.code(201).send(toFileResponse(file));
    },
  );

  app.get<{ Querystring: ListFilesQuery }>(
    "/api/v1/files",
    {
      schema: listFilesSchema,
    },
    async (request, reply) => {
      const result = await getFilesByUserId(
        request.query.userId,
        request.query.limit,
        request.query.cursor,
      );

      return reply.send({
        data: result.data.map(toFileResponse),
        pagination: result.pagination,
      });
    },
  );

  app.get<{
    Params: { id: string };
    Querystring: FileOwnershipQuery;
  }>(
    "/api/v1/files/:id",
    {
      schema: fileOwnershipSchema,
    },
    async (request, reply) => {
      const file = await getFileByIdForUser(
        request.params.id,
        request.query.userId,
      );

      return reply.send(toFileResponse(file));
    },
  );

  app.delete<{
    Params: { id: string };
    Querystring: FileOwnershipQuery;
  }>(
    "/api/v1/files/:id",
    {
      schema: fileOwnershipSchema,
    },
    async (request, reply) => {
      const file = await removeFileForUser(
        request.params.id,
        request.query.userId,
      );

      return reply.send({
        data: toFileResponse(file),
      });
    },
  );
};


// cmt5zoook00017srihq2bt0y5