import type { FileResponse } from "./file.types.js";

interface FileEntity {
  id: string;
  userId: string;
  originalName: string;
  storageKey: string;
  mimeType: string;
  size: bigint;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toFileResponse(file: FileEntity): FileResponse {
  return {
    id: file.id,
    userId: file.userId,
    originalName: file.originalName,
    storageKey: file.storageKey,
    mimeType: file.mimeType,
    size: file.size.toString(),
    status: file.status,
    createdAt: file.createdAt.toISOString(),
    updatedAt: file.updatedAt.toISOString(),
  };
}