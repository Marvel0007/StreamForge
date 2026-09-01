import { fileProcessingWorker } from "./file-processing.worker.js";

console.log("StreamForge file processing worker started");
console.log("Worker status: HEALTHY");

let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`[worker] Received ${signal}. Shutting down...`);

  await fileProcessingWorker.close();

  console.log("[worker] Worker shut down cleanly");

  process.exit(0);
}

process.once("SIGINT", () => {
  void shutdown("SIGINT");
});

process.once("SIGTERM", () => {
  void shutdown("SIGTERM");
});