import { Injectable, Logger, BadRequestException, NotFoundException, PayloadTooLargeException, InternalServerErrorException } from '@nestjs/common';
import { StorageClient } from './storage.client';
import { RedisService } from '../cache/redis.service';
import { PrismaService } from '../database/prisma.service';
import { StorageHealthStatus } from './interface/storage-driver.interface';
import { EnumRedisKey } from '@/shared/enums/EnumRedisKey';
import { buildRedisKey } from '@/shared/utils';
import { UploadAndRegisterMedia, UploadAndRegisterMediaDto, UploadAndRegisterMediaOption } from './interface/upload-register-media.interface';
import { EnumStorageBucket, StorageEnvPrefix } from './enums/storage.enum';
import { randomBytes, createHash } from 'crypto';
import { registerEnv } from '@/config/env.config';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly BUCKET_CACHE_TTL = 60 * 5;
  private readonly DEFAULT_MAX_SIZE = 10 * 1024 * 1024;
  private readonly SAFE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);

  constructor(
    private readonly client: StorageClient,
    private readonly redis: RedisService,
    private readonly prisma: PrismaService
  ) {}

  private _bucketExistsCacheKey(bucketName: string): string {
    return buildRedisKey(EnumRedisKey.STORAGE_BUCKET_EXIST, [bucketName]);
  }
  private _resolveBucket(input: UploadAndRegisterMedia): EnumStorageBucket {
    if (!Object.values(EnumStorageBucket).includes(input.bucket)) throw new BadRequestException('Invalid storage bucket');

    return input.bucket;
  }
  private _resolveVisibilityPrefix(isPublic?: boolean): 'p' | 'r' {
    return isPublic
      ? // public
        'p'
      : // private
        'r';
  }
  private _mimeToExtensionSafe(mime?: string): string {
    if (!mime) return randomBytes(16).toString('hex');
    const safeMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/bmp': 'bmp',
      'application/pdf': 'pdf',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'video/mp4': 'mp4',
      'video/webm': 'webm',
      'video/ogg': 'ogv',
    };
    return safeMap[mime] ?? randomBytes(8).toString('hex');
  }

  private _resolveEnvPrefix(): StorageEnvPrefix {
    return registerEnv.IS_DEVELOPMENT ? StorageEnvPrefix.SANDBOX : StorageEnvPrefix.LIVE;
  }
  private _generateObjectPath(input: Pick<UploadAndRegisterMedia, 'bucket' | 'userId' | 'mimeType' | 'isPublic'>): string {
    const envPrefix = this._resolveEnvPrefix();
    const visibility = this._resolveVisibilityPrefix(input.isPublic);
    const salt = randomBytes(16).toString('hex');
    const entropy = [input.userId, input.bucket, visibility, input.mimeType ?? 'unknown', Date.now(), salt].join('|');
    const hash = createHash('sha256').update(entropy).digest('hex');

    const dir1 = hash.slice(0, 2);
    const dir2 = hash.slice(2, 4);
    const dir3 = hash.slice(4, 6);

    const ext = this._mimeToExtensionSafe(input.mimeType);

    return `${envPrefix}/${visibility}/${dir1}/${dir2}/${dir3}/${hash}${ext ? '.' + ext : ''}`;
  }
  private _validateMime(inputMime?: string, detectedMime?: string, options?: UploadAndRegisterMediaOption): string {
    const mime = inputMime ?? detectedMime;

    if (!mime) throw new BadRequestException('MimeType is required');

    if (!this.SAFE_MIME_TYPES.has(mime)) throw new BadRequestException(`MimeType "${mime}" is not allowed`);

    if (options?.allowedMimeTypes?.length) {
      for (const m of options.allowedMimeTypes) {
        if (!this.SAFE_MIME_TYPES.has(m)) throw new BadRequestException(`Caller MimeType "${m}" is not allowed`);
      }

      if (!options.allowedMimeTypes.includes(mime)) throw new BadRequestException('MimeType does not match allowedMimeTypes');
    }

    if (inputMime && detectedMime && inputMime !== detectedMime)
      throw new BadRequestException({
        message: 'Provided mimeType does not match file mimeType',
        inputMime,
        detectedMime,
      });

    return mime;
  }
  private _validateSize(inputSize?: number, detectedSize?: number, options?: UploadAndRegisterMediaOption) {
    const size = inputSize ?? detectedSize;

    if (!size || size <= 0) throw new BadRequestException('Invalid file size');

    if (options?.expectedSize !== undefined) {
      const calcSize = options.expectedSize * 1024 * 1024;
      if (size > calcSize) {
        throw new PayloadTooLargeException(`File size exceeds maximum limit (${options.expectedSize}MB)`);
      }
      return true;
    }

    if (size > this.DEFAULT_MAX_SIZE) throw new PayloadTooLargeException('File size exceeds maximum limit (10MB)');
  }

  async isReady(): Promise<StorageHealthStatus> {
    return this.client.healthCheck();
  }
  async bucketExists(bucketName: string): Promise<boolean> {
    const cacheKey = this._bucketExistsCacheKey(bucketName);

    const cached = await this.redis.get(cacheKey);
    if (cached !== null) {
      return +cached === 1;
    }

    const exists = await this.client.bucketExists(bucketName);

    await this.redis.set(cacheKey, exists ? '1' : '0', this.BUCKET_CACHE_TTL);

    return exists;
  }
  async createBucket(bucketName: string, isPublic: boolean = false): Promise<boolean> {
    const created = await this.client.createBucket(bucketName, isPublic);

    // cache sync
    await this.redis.delete(this._bucketExistsCacheKey(bucketName));

    if (created) {
      this.logger.log(`Bucket created: ${bucketName}`);
    }

    return created;
  }
  async removeBucket(bucketName: string): Promise<boolean> {
    const removed = await this.client.removeBucket(bucketName);

    // cache sync
    await this.redis.delete(this._bucketExistsCacheKey(bucketName));

    if (removed) {
      this.logger.log(`Bucket removed: ${bucketName}`);
    }

    return removed;
  }
  async uploadAndRegisterMedia(input: UploadAndRegisterMedia, options?: UploadAndRegisterMediaOption): Promise<UploadAndRegisterMediaDto> {
    /**
     * Resolve & validate bucket
     */
    const bucket = this._resolveBucket(input);
    const bucketExists = await this.client.bucketExistsAndCreate(bucket, input.isPublic ?? false);
    if (!bucketExists) throw new NotFoundException('Bucket does not exist');

    /**
     * Validate file existence
     */
    if (!input.file) throw new BadRequestException('File is required');

    /**
     * Validate mime & size
     */
    const detectedMime = (input.file as any)?.mimeType;
    const detectedSize = (input.file as any)?.size;
    const finalMime = this._validateMime(input.mimeType, detectedMime, options);
    this._validateSize(input.size, detectedSize, options);

    /**
     * Generate object path
     */
    const objectName =
      input.objectName ??
      this._generateObjectPath({
        bucket,
        userId: input.userId,
        mimeType: finalMime,
        isPublic: input.isPublic,
      });

    /**
     * Upload to MinIO
     */
    await this.client.putObject(bucket, objectName, input.file, detectedSize, {
      contentType: finalMime,
    });

    /**
     * Verify object exists (metadata)
     */
    const objectInfo = await this.client.getObjectInfo(bucket, objectName);
    if (!objectInfo) throw new InternalServerErrorException('Upload failed: object not found after upload');

    /**
     * Save to database
     */
    try {
      return await this.prisma.media.create({
        data: {
          url: objectInfo.objectName,
          mimeType: finalMime,
          size: objectInfo.size,
          type: input.bucket,
          alt: input.alt,
          isPublic: input.isPublic ?? true,
          userId: input.userId,
        },
      });
    } catch (error) {
      try {
        await this.client.removeObject(bucket, objectName);
        this.logger.warn(`Rollback: object removed after DB failure -> ${bucket}/${objectName}`);
      } catch (rollbackError) {
        this.logger.error(`Rollback failed: could not remove object ${bucket}/${objectName}`, (rollbackError as any)?.stack);
      }

      throw error;
    }
  }
}
