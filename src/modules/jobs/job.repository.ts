import { prisma } from "../../infrastructure/database/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function createJob(data: Prisma.JobCreateInput) {
  return prisma.job.create({
    data,
  });
}

export async function findJobById(id: string) {
  return prisma.job.findUnique({
    where: {
      id,
    },
    include: {
      file: true,
    },
  });
}

export async function findJobsByFileId(fileId: string) {
  return prisma.job.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function findActiveJobByFileId(fileId: string) {
  return prisma.job.findFirst({
    where: {
      fileId,
      status: {
        in: ["PENDING", "PROCESSING"],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function incrementJobAttempts(id: string) {
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      attempts: {
        increment: 1,
      },
    },
  });
}

export async function resetJobAttempts(id: string) {
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      attempts: 0,
      error: null,
    },
  });
}

export async function updateJobStatus(
  id: string,
  status: NonNullable<Prisma.JobUpdateInput["status"]>,
) {
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function markJobFailed(id: string, error: string) {
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      status: "FAILED",
      error,
    },
  });
}

export async function updateJobProcessingMetadata(
  id: string,
  processedBytes: bigint,
  processingTimeMs: number,
) {
  return prisma.job.update({
    where: {
      id,
    },
    data: {
      processedBytes,
      processingTimeMs,
    },
  });
}

export async function updateJobAndFileStatus(
  jobId: string,
  fileId: string,
  status: NonNullable<Prisma.JobUpdateInput["status"]>,
  error?: string,
) {
  return prisma.$transaction(async (tx) => {
    const job = await tx.job.update({
      where: {
        id: jobId,
      },
      data: {
        status,
        ...(error !== undefined
          ? {
              error,
            }
          : {}),
      },
    });

    await tx.file.update({
      where: {
        id: fileId,
      },
      data: {
        status,
      },
    });

    return job;
  });
}
