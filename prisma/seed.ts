import "dotenv/config";
import { prisma } from "../src/infrastructure/database/prisma.js";

async function main(): Promise<void> {
  const user = await prisma.user.upsert({
    where: {
      email: "dev@streamforge.local",
    },
    update: {},
    create: {
      email: "dev@streamforge.local",
      name: "StreamForge Developer",
    },
  });

  console.log("Development user ready:");
  console.log({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}

main()
  .catch((error: unknown) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });