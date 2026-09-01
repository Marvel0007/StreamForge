import { fileProcessingWorker } from "./workers/file-processing.worker.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/prisma.js";

async function start(): Promise<void> {
  try {
    await connectDatabase();

    console.log("File processing worker started");
    console.log("Worker status: HEALTHY");
  } catch (error) {
    console.error("Failed to start worker:", error);

    await disconnectDatabase();

    process.exit(1);
  }
}

let isShuttingDown = false;
async function shutdown(signal: string): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`Worker shutdown signal received: ${signal}`);

  await fileProcessingWorker.close();
  await disconnectDatabase();

  process.exit(0);
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});

void start();
