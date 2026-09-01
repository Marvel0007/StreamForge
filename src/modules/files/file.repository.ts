import { AppError } from "../../shared/errors/app-error.js";

import { prisma } from "../../infrastructure/database/prisma.js";
import type { Prisma } from "../../generated/prisma/client.js";

export async function createFile(data: Prisma.FileCreateInput) {
  return prisma.file.create({
    data,
  });
}

export async function findFileById(id: string) {
  return prisma.file.findUnique({
    where: {
      id,
    },
  });
}

export async function findFileByIdAndUserId(id: string, userId: string) {
  return prisma.file.findFirst({
    where: {
      id,
      userId,
    },
  });
}

export async function findFilesByUserId(
  userId: string,
  limit: number,
  cursor?: string,
) {
  if (cursor) {
    const cursorFile = await prisma.file.findFirst({
      where: {
        id: cursor,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!cursorFile) {
      throw new AppError("Invalid pagination cursor", 400, "INVALID_CURSOR");
    }
  }

  return prisma.file.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        id: "desc",
      },
    ],
    take: limit + 1,
    ...(cursor
      ? {
          cursor: {
            id: cursor,
          },
          skip: 1,
        }
      : {}),
  });
}

export async function deleteFileById(id: string) {
  return prisma.file.delete({
    where: {
      id,
    },
  });
}

export async function updateFileStatus(
  id: string,
  status: Prisma.FileUpdateInput["status"],
) {
  if (status === undefined) {
    throw new Error("File status is required");
  }

  return prisma.file.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });
}

export async function createFileWithJob(
  fileData: Prisma.FileCreateInput,
  jobData: Prisma.JobCreateWithoutFileInput,
) {
  return prisma.$transaction(async (tx) => {
    const file = await tx.file.create({
      data: fileData,
    });

    const job = await tx.job.create({
      data: {
        ...jobData,
        file: {
          connect: {
            id: file.id,
          },
        },
      },
    });

    return {
      file,
      job,
    };
  });
}
