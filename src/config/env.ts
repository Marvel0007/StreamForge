import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),

  HOST: z.string(),

  PORT: z.coerce.number().int().positive(),

  DATABASE_URL: z.string().min(1),

  REDIS_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
