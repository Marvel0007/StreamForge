export interface StorageObject {
  key: string;
  size: number;
  mimeType: string;
}

export interface StorageProvider {
  put(
    key: string,
    data: Buffer,
    mimeType: string,
  ): Promise<StorageObject>;

  get(key: string): Promise<Buffer>;

  delete(key: string): Promise<void>;

  exists(key: string): Promise<boolean>;
}