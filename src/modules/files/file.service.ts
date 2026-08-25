import { Prisma, PrismaClient } from "../../generated/prisma/client.js";
import { AppError } from "../../shared/errors/app-error.js";
import { enqueueFileProcessing } from "../jobs/job.queue-service.js";

import {
  createFile,
  deleteFileById,
  findFileById,
  findFileByIdAndUserId,
  findFilesByUserId,
  updateFileStatus,
  createFileWithJob,
} from "./file.repository.js";

type FileStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const VALID_STATUS_TRANSITIONS: Record<FileStatus, FileStatus[]> = {
  PENDING: ["PROCESSING", "FAILED"],
  PROCESSING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
};

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "text/plain",
]);

export async function createFileRecord(data: Prisma.FileCreateInput) {
  validateFileType(data.mimeType);
  validateFileSize(data.size);

  const result = await createFileWithJob(data, {
    type: "FILE_PROCESSING",
  });

  await enqueueFileProcessing(result.job.id, result.file.id);

  return result.file;
}
export async function getFileById(id: string) {
  const file = await findFileById(id);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  return file;
}

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function getFilesByUserId(
  userId: string,
  limit = DEFAULT_PAGE_SIZE,
  cursor?: string,
) {
  const pageSize = Math.min(Math.max(limit, 1), MAX_PAGE_SIZE);

  try {
    const files = await findFilesByUserId(userId, pageSize, cursor);

    const hasMore = files.length > pageSize;

    const data = hasMore ? files.slice(0, pageSize) : files;

    const nextCursor = hasMore ? (data[data.length - 1]?.id ?? null) : null;

    return {
      data,
      pagination: {
        limit: pageSize,
        hasMore,
        nextCursor,
      },
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new AppError("Invalid pagination cursor", 400, "INVALID_CURSOR");
    }

    throw error;
  }
}

export async function getFileByIdForUser(id: string, userId: string) {
  const file = await findFileByIdAndUserId(id, userId);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  return file;
}

export async function removeFile(id: string) {
  const file = await findFileById(id);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  await deleteFileById(id);

  return file;
}

export async function removeFileForUser(id: string, userId: string) {
  const file = await findFileByIdAndUserId(id, userId);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  try {
    await deleteFileById(id);
  } catch {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  return file;
}

function validateFileType(mimeType: string): void {
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new AppError(
      `Unsupported file type: ${mimeType}`,
      400,
      "UNSUPPORTED_FILE_TYPE",
    );
  }
}

function validateFileSize(size: number | bigint): void {
  if (size <= 0) {
    throw new AppError(
      "File size must be greater than zero",
      400,
      "INVALID_FILE_SIZE",
    );
  }

  if (BigInt(size) > BigInt(MAX_FILE_SIZE)) {
    throw new AppError(
      "File size exceeds the 50 MB limit",
      400,
      "FILE_TOO_LARGE",
    );
  }
}

export async function changeFileStatus(id: string, status: FileStatus) {
  const file = await findFileById(id);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  const currentStatus = file.status as FileStatus;

  if (!VALID_STATUS_TRANSITIONS[currentStatus].includes(status)) {
    throw new AppError(
      `Invalid file status transition: ${currentStatus} -> ${status}`,
      409,
      "INVALID_FILE_STATUS_TRANSITION",
    );
  }

  return updateFileStatus(id, status);
}
