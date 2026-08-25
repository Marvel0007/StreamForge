import type { StorageObject } from "./storage.types.js";
import { LocalStorageProvider } from "./local-storage.provider.js";

const storageProvider = new LocalStorageProvider();

export async function putObject(
  key: string,
  data: Buffer,
  mimeType: string,
): Promise<StorageObject> {
  return storageProvider.put(key, data, mimeType);
}

export async function getObject(
  key: string,
): Promise<Buffer> {
  return storageProvider.get(key);
}

export async function deleteObject(
  key: string,
): Promise<void> {
  return storageProvider.delete(key);
}

export async function objectExists(
  key: string,
): Promise<boolean> {
  return storageProvider.exists(key);
}

export async function checkStorage(): Promise<boolean> {
  const key = "health/storage-check.txt";
  const data = Buffer.from("ok");

  await putObject(key, data, "text/plain");

  const exists = await objectExists(key);

  await deleteObject(key);

  return exists;
}

