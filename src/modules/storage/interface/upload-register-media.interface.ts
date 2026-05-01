import { Media } from '@prisma/client';
import { StorageReadable } from './storage-driver.interface';
import { EnumStorageBucket } from '../enums/storage.enum';

export interface UploadAndRegisterMedia {
  bucket: EnumStorageBucket;
  objectName?: string;
  file: StorageReadable;
  mimeType?: string;
  size?: number;
  userId: number;
  alt?: string;
  isPublic?: boolean;
}
export interface UploadAndRegisterMediaOption {
  allowedMimeTypes?: string[];

  /**
   * MB Format
   */
  expectedSize?: number;
}
export type UploadAndRegisterMediaDto = Media;
