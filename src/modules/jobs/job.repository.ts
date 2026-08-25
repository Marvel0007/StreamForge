import { prisma } from "../../infrastructure/database/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function createJob(
  data: Prisma.JobCreateInput,
) {
  return prisma.job.create({
    data,
  });
}

export async function findJobById(id: string) {
  return prisma.job.findUnique({
    where: {
      id,
    },
  });
}

export async function findJobsByFileId(
  fileId: string,
) {
  return prisma.job.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function incrementJobAttempts(
  id: string,
) {
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

export async function markJobFailed(
  id: string,
  error: string,
) {
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