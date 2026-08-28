import type { Job } from "../../generated/prisma/client.js";

export function toJobResponse(job: Job) {
  return {
    id: job.id,
    fileId: job.fileId,
    type: job.type,
    status: job.status,
    attempts: job.attempts,
    maxAttempts: job.maxAttempts,
    error: job.error,
    processedBytes: job.processedBytes?.toString() ?? null,
    processingTimeMs: job.processingTimeMs,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}
