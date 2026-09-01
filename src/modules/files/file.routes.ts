import type { FastifyPluginAsync } from "fastify";
import { AppError } from "../../shared/errors/app-error.js";
import {
  createFileRecord,
  getFileByIdForUser,
  getFilesByUserId,
  removeFileForUser,
  removeFile,
  getFileById,
  downloadFile,
} from "./file.service.js";
import {
  createFileSchema,
  fileOwnershipSchema,
  listFilesSchema,
} from "./file.schema.js";
import { toFileResponse } from "./file.mapper.js";
import { randomUUID } from "node:crypto";
import { putObject } from "../../infrastructure/storage/storage.service.js";
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

  app.post("/api/v1/files/upload", async (request, reply) => {
    const data = await request.file();

    if (!data) {
      throw new AppError("File is required", 400, "FILE_REQUIRED");
    }

    const userIdField = data.fields.userId;

    if (
      !userIdField ||
      Array.isArray(userIdField) ||
      !("value" in userIdField)
    ) {
      throw new AppError("userId is required", 400, "USER_ID_REQUIRED");
    }

    const userId = userIdField.value;

    if (typeof userId !== "string" || userId.length === 0) {
      throw new AppError("userId is required", 400, "USER_ID_REQUIRED");
    }

    const buffer = await data.toBuffer();

    if (buffer.length === 0) {
      throw new AppError("File must not be empty", 400, "EMPTY_FILE");
    }

    const storageKey = `users/${userId}/files/${randomUUID()}`;

    await putObject(storageKey, buffer, data.mimetype);

    const file = await createFileRecord({
      originalName: data.filename,
      storageKey,
      mimeType: data.mimetype,
      size: BigInt(buffer.length),
      user: {
        connect: {
          id: userId,
        },
      },
    });

    return reply.code(201).send(toFileResponse(file));
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
    Params: {
      id: string;
    };
    Querystring: {
      userId: string;
    };
  }>(
    "/api/v1/files/:id/download",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              minLength: 1,
            },
          },
          additionalProperties: false,
        },
        querystring: {
          type: "object",
          required: ["userId"],
          properties: {
            userId: {
              type: "string",
              minLength: 1,
            },
          },
          additionalProperties: false,
        },
      },
    },
    async (request, reply) => {
      const { file, data } = await downloadFile(
        request.params.id,
        request.query.userId,
      );

      return reply
        .header("Content-Type", file.mimeType)
        .header(
          "Content-Disposition",
          `attachment; filename="${encodeURIComponent(file.originalName)}"`,
        )
        .send(data);
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

// cmtbxg7x30000tsri8427kpu5
// users/cmt5z66z70000fkri9w02objd/files/8c35a1e3-31e7-4266-8e91-ff8e7644086f
// cmt5z66z70000fkri9w02objd
