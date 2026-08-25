import { Worker } from "bullmq";
import { redis } from "../infrastructure/redis/redis.js";
import { prisma } from "../infrastructure/database/prisma.js";

import type { FileProcessingJobData } from "../modules/jobs/job.types.js";

export const fileProcessingWorker = new Worker<FileProcessingJobData>(
  "file-processing",
  async (job) => {
    const { jobId, fileId } = job.data;

    const file = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!file) {
      throw new Error(`File not found: ${fileId}`);
    }

    try {
      await prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          status: "PROCESSING",
        },
      });

      await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          status: "PROCESSING",
        },
      });

      console.log(`Processing file ${file.id}: ${file.originalName}`);

      // Temporary processing simulation.
      await new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

      await prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          status: "COMPLETED",
        },
      });

      await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          status: "COMPLETED",
        },
      });

      console.log(`Completed file ${file.id}: ${file.originalName}`);

      return {
        fileId: file.id,
        status: "COMPLETED",
      };
    } catch (error) {
      await prisma.file.update({
        where: {
          id: file.id,
        },
        data: {
          status: "FAILED",
        },
      });

      await prisma.job.update({
        where: {
          id: jobId,
        },
        data: {
          status: "FAILED",
          error:
            error instanceof Error ? error.message : "Unknown processing error",
        },
      });

      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  },
);

fileProcessingWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

fileProcessingWorker.on("failed", (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed:`, error);
});

fileProcessingWorker.on("error", (error) => {
  console.error("File processing worker error:", error);
});
