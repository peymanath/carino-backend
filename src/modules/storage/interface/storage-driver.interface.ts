import type { Readable } from 'stream';

export type StorageHealthStatus = {
  ok: boolean;
  message?: string;
  latencyMs?: number;
};
export type PutObjectOptions = {
  contentType?: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
  isPublicBucket?: boolean;
};
export type MinioConfig = {
  endPoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
};
export type StorageObjectInfo = {
  objectName: string;
  size: number;
  etag?: string;
  contentType?: string;
  lastModified?: Date;
  metadata?: Record<string, string>;
};
// export type StorageReadable = Readable;
export type StorageReadable = any;
export interface StorageDriver {
  /**
   * Check real connectivity to storage provider
   * Must NOT be a fake or static check
   */
  healthCheck(): Promise<StorageHealthStatus>;
  /**
   * Bucket operations
   */
  bucketExists(bucketName: string): Promise<boolean>;
  createBucket(bucketName: string, isPublic?: boolean): Promise<boolean>;
  removeBucket(bucketName: string): Promise<boolean>;
  putObject(bucketName: string, objectName: string, data: StorageReadable, size?: number, options?: PutObjectOptions): Promise<void>;
  getObject(bucketName: string, objectName: string): Promise<StorageReadable>;
  removeObject(bucketName: string, objectName: string): Promise<void>;
}
