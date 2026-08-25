import IORedis from "ioredis";
import { env } from "../../config/env.js";

export const redis = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error);
});