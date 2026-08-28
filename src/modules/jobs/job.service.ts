import { AppError } from "../../shared/errors/app-error.js";
import {
  createJob,
  findJobById,
  findJobsByFileId,
  incrementJobAttempts,
  markJobFailed,
  updateJobAndFileStatus,
} from "./job.repository.js";
import { findFileById } from "../files/file.repository.js";
import { fileProcessingQueue } from "../../infrastructure/queue/file-processing.queue.js";

type JobStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";

const VALID_STATUS_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  PENDING: ["PROCESSING", "FAILED"],
  PROCESSING: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: [],
};

export async function createFileProcessingJob(fileId: string) {
  const file = await findFileById(fileId);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  const job = await createJob({
    type: "FILE_PROCESSING",
    file: {
      connect: {
        id: fileId,
      },
    },
  });

  await fileProcessingQueue.add(
    "file-processing",
    {
      jobId: job.id,
      fileId: file.id,
    },
    {
      attempts: job.maxAttempts,
      backoff: {
        type: "exponential",
        delay: 1000,
      },
      removeOnComplete: false,
      removeOnFail: false,
    },
  );

  return job;
}

export async function getJobById(id: string) {
  const job = await findJobById(id);

  if (!job) {
    throw new AppError("Job not found", 404, "JOB_NOT_FOUND");
  }

  return job;
}

export async function getJobsByFileId(fileId: string) {
  const file = await findFileById(fileId);

  if (!file) {
    throw new AppError("File not found", 404, "FILE_NOT_FOUND");
  }

  return findJobsByFileId(fileId);
}

export async function changeJobStatus(id: string, status: JobStatus) {
  const job = await getJobById(id);

  const currentStatus = job.status as JobStatus;

  if (!VALID_STATUS_TRANSITIONS[currentStatus].includes(status)) {
    throw new AppError(
      `Invalid job status transition: ${currentStatus} -> ${status}`,
      409,
      "INVALID_JOB_STATUS_TRANSITION",
    );
  }

  return updateJobAndFileStatus(id, job.fileId, status);
}

export async function recordJobAttempt(id: string) {
  const job = await getJobById(id);

  if (job.attempts >= job.maxAttempts) {
    throw new AppError(
      "Maximum job attempts exceeded",
      409,
      "MAX_JOB_ATTEMPTS_EXCEEDED",
    );
  }

  return incrementJobAttempts(id);
}

export async function failJob(id: string, error: string) {
  const job = await getJobById(id);

  if (job.status === "FAILED") {
    return job;
  }

  return markJobFailed(id, error);
}
