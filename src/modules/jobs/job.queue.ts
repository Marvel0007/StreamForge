import { Queue } from "bullmq";
import { redis } from "../../infrastructure/redis/redis.js";
import type { FileProcessingJobData } from "./job.types.js";

export const fileProcessingQueue = new Queue<FileProcessingJobData>(
  "file-processing",
  {
    connection: redis,
  },
);