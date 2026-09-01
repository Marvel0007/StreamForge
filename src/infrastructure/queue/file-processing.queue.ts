import { Queue } from "bullmq";
import { env } from "../../config/env.js";

export const FILE_PROCESSING_QUEUE = "file-processing";

export const fileProcessingQueue = new Queue(FILE_PROCESSING_QUEUE, {
  connection: {
    url: env.REDIS_URL,
  },
  defaultJobOptions: {
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400,
      count: 5000,
    },
  },
});
