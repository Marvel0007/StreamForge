import { fileProcessingQueue } from "./file-processing.queue.js";

export async function getFileProcessingQueueStats() {
  const [
    waiting,
    active,
    completed,
    failed,
    delayed,
  ] = await Promise.all([
    fileProcessingQueue.getWaitingCount(),
    fileProcessingQueue.getActiveCount(),
    fileProcessingQueue.getCompletedCount(),
    fileProcessingQueue.getFailedCount(),
    fileProcessingQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
  };
}

export async function pauseFileProcessingQueue(): Promise<void> {
  await fileProcessingQueue.pause();
}

export async function resumeFileProcessingQueue(): Promise<void> {
  await fileProcessingQueue.resume();
}

export async function getFileProcessingQueueStatus(): Promise<{
  paused: boolean;
}> {
  const paused = await fileProcessingQueue.isPaused();

  return {
    paused,
  };
}