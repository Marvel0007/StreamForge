import { buildApp } from "./app/app.js";
import { env } from "./config/env.js";
import {
  connectDatabase,
  disconnectDatabase,
} from "./infrastructure/database/prisma.js";

const app = buildApp();

async function start(): Promise<void> {
  try {
    await connectDatabase();

    await app.listen({
      host: env.HOST,
      port: env.PORT,
    });
  } catch (error) {
    app.log.error(error, "Failed to start StreamForge");

    await disconnectDatabase();

    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, "Shutdown signal received");

  await app.close();
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