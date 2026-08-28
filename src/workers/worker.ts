import { fileProcessingWorker } from "./file-processing.worker.js";

console.log(
  "StreamForge file processing worker started",
);

async function shutdown(signal: string) {
  console.log(
    `[worker] Received ${signal}. Shutting down...`,
  );

  await fileProcessingWorker.close();

  console.log(
    "[worker] Worker shut down cleanly",
  );

  process.exit(0);
}

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});