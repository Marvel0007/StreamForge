import { Worker } from "bullmq";
import { env } from "../config/env";
import { FILE_PROCESSING_QUEUE } from "../infrastructure/queue/file-processing.queue.js";
import {
  changeJobStatus,
  failJob,
} from "../modules/jobs/job.service.js";

interface FileProcessingJobData {
  jobId: string;
  fileId: string;
}

export const fileProcessingWorker =
  new Worker<FileProcessingJobData>(
    FILE_PROCESSING_QUEUE,
    async (job) => {
      const { jobId } = job.data;

      await changeJobStatus(jobId, "PROCESSING");

      try {
        // Actual file processing will be implemented
        // in the next stage.
        await Promise.resolve();

        await changeJobStatus(jobId, "COMPLETED");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown processing error";

        await failJob(jobId, message);

        throw error;
      }
    },
    {
      connection: {
        url: env.REDIS_URL,
      },
      concurrency: 2,
    },
  );

fileProcessingWorker.on("completed", (job) => {
  console.log(
    `[worker] Job completed: ${job.id}`,
  );
});

fileProcessingWorker.on("failed", (job, error) => {
  console.error(
    `[worker] Job failed: ${job?.id ?? "unknown"}`,
    error,
  );
});