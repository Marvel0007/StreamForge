import { Queue } from "bullmq";
import { env } from "../../config/env.js";

export const FILE_PROCESSING_QUEUE = "file-processing";

export const fileProcessingQueue = new Queue(
  FILE_PROCESSING_QUEUE,
  {
    connection: {
      url: env.REDIS_URL,
    },
  },
);