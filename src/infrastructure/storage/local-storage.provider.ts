import { promises as fs } from "node:fs";
import path from "node:path";
import type { StorageObject, StorageProvider } from "./storage.types.js";
import { env } from "../../config/env.js";

const STORAGE_ROOT = path.resolve(process.cwd(), env.LOCAL_STORAGE_ROOT);

export class LocalStorageProvider implements StorageProvider {
  async put(
    key: string,
    data: Buffer,
    mimeType: string,
  ): Promise<StorageObject> {
    const filePath = this.resolvePath(key);

    await fs.mkdir(path.dirname(filePath), {
      recursive: true,
    });

    await fs.writeFile(filePath, data);

    return {
      key,
      size: data.length,
      mimeType,
    };
  }

  async get(key: string): Promise<Buffer> {
    const filePath = this.resolvePath(key);

    return fs.readFile(filePath);
  }

  async delete(key: string): Promise<void> {
    const filePath = this.resolvePath(key);

    await fs.rm(filePath, {
      force: true,
    });
  }

  async exists(key: string): Promise<boolean> {
    const filePath = this.resolvePath(key);

    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private resolvePath(key: string): string {
    const normalizedKey = key.replace(/\\/g, "/");

    const filePath = path.resolve(STORAGE_ROOT, normalizedKey);

    if (
      filePath !== STORAGE_ROOT &&
      !filePath.startsWith(`${STORAGE_ROOT}${path.sep}`)
    ) {
      throw new Error("Invalid storage key");
    }

    return filePath;
  }
}
