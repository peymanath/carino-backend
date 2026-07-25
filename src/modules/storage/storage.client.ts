import { Logger, BadRequestException, NotFoundException, InternalServerErrorException, ServiceUnavailableException } from '@nestjs/common';
import { Client as MinioClient } from 'minio';
import { MinioConfig, PutObjectOptions, StorageHealthStatus, StorageObjectInfo, StorageReadable } from './interface/storage-driver.interface';
import { registerEnv } from '../../config/env.config';

export class StorageClient {
  private readonly client: MinioClient;
  private readonly loggerContext = StorageClient.name;
  private readonly isEnableLogger = registerEnv.ENABLE_LOGGER;

  constructor(private readonly config: MinioConfig) {
    this._validateConfig(this.config);
    this.client = new MinioClient({
      endPoint: this.config.endPoint,
      port: this.config.port,
      useSSL: this.config.useSSL,
      accessKey: this.config.accessKey,
      secretKey: this.config.secretKey,
      region: this.config.region,
    });
  }

  private _validateConfig(config: MinioConfig) {
    const required = ['endPoint', 'port', 'accessKey', 'secretKey'] as const;
    for (const key of required) {
      if (!config[key]) throw new InternalServerErrorException(`MinIO config "${key}" is required`);
    }
  }
  private _validateBucketName(bucketName: string) {
    if (!bucketName || typeof bucketName !== 'string') throw new BadRequestException('Bucket name must be a non-empty string');

    const normalized = bucketName.trim();

    if (normalized.length < 3 || normalized.length > 63) throw new BadRequestException('Bucket name must be between 3 and 63 characters');

    const bucketRegex = /^[a-z0-9][a-z0-9.-]+[a-z0-9]$/;
    if (!bucketRegex.test(normalized)) throw new BadRequestException('Invalid bucket name format (lowercase, alphanumeric, dot, dash)');

    if (normalized.includes('..')) throw new BadRequestException('Bucket name must not contain consecutive dots');
  }
  private _normalizeMetadata(metadata?: Record<string, string>): Record<string, string> | undefined {
    if (!metadata) return undefined;

    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata)) {
      result[`x-amz-meta-${key}`] = value;
    }
    return result;
  }
  private _publicBucketPolicy(bucket: string): string {
    return JSON.stringify({
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicRead',
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${bucket}/*`],
        },
      ],
    });
  }
  private _objectNameGenerator(bucket: string, objectName: string): string {
    if (!bucket || typeof bucket !== 'string') throw new BadRequestException('Bucket name must be a non-empty string');
    if (!objectName || typeof objectName !== 'string') throw new BadRequestException('Object name must be a non-empty string');
    return `${bucket}/${objectName}`;
  }

  async healthCheck(): Promise<StorageHealthStatus> {
    const start = Date.now();

    try {
      await this.client.listBuckets();
      const latency = Date.now() - start;

      this.isEnableLogger && Logger.log(`Storage health check successful +${latency}ms`, this.loggerContext);

      return { ok: true, latencyMs: latency };
    } catch (error: any) {
      this.isEnableLogger && Logger.error('Storage health check failed', error?.stack, this.loggerContext);

      return {
        ok: false,
        message: error?.message ?? 'Storage health check failed',
      };
    }
  }
  async bucketExists(bucketName: string): Promise<boolean> {
    this._validateBucketName(bucketName);
    return this.client.bucketExists(bucketName);
  }
  async createBucket(bucketName: string, isPublic: boolean = false): Promise<boolean> {
    this._validateBucketName(bucketName);

    const exists = await this.client.bucketExists(bucketName);
    if (exists) return false;

    await this.client.makeBucket(bucketName);

    if (isPublic) {
      await this.client.setBucketPolicy(bucketName, this._publicBucketPolicy(bucketName));
    }

    return true;
  }
  async removeBucket(bucketName: string): Promise<boolean> {
    this._validateBucketName(bucketName);

    const exists = await this.client.bucketExists(bucketName);
    if (!exists) return false;

    await this.client.removeBucket(bucketName);
    return true;
  }
  async bucketExistsAndCreate(bucketName: string, isPublic: boolean): Promise<boolean> {
    const isExist = await this.bucketExists(bucketName);
    if (isExist) return true;
    return this.createBucket(bucketName, isPublic);
  }
  async putObject(bucket: string, objectName: string, data: StorageReadable, size?: number, options?: PutObjectOptions): Promise<StorageObjectInfo> {
    /**
     * Check Bucket Name and Exist Bucket
     */
    this.bucketExistsAndCreate(bucket, options?.isPublicBucket ?? false);

    const start = Date.now();

    const file = 'stream' in data ? data.stream : 'buffer' in data ? data.buffer : undefined;

    if (!file) {
      throw new BadRequestException('File is required in Client');
    }
    try {
      await this.client.putObject(bucket, objectName, file, size, {
        'Content-Type': options?.contentType,
        'Cache-Control': options?.cacheControl,
        ...this._normalizeMetadata(options?.metadata),
      });

      this.isEnableLogger && Logger.log(`Object uploaded: ${this._objectNameGenerator(bucket, objectName)} +${Date.now() - start}ms`, this.loggerContext);

      return await this.getObjectInfo(bucket, objectName);
    } catch (error: any) {
      this.isEnableLogger && Logger.error(`Failed to upload object: ${this._objectNameGenerator(bucket, objectName)}`, error?.stack, this.loggerContext);
      throw new ServiceUnavailableException(error?.message ?? 'Failed to upload object to storage');
    }
  }
  async getObject(bucket: string, objectName: string): Promise<StorageReadable> {
    this._validateBucketName(bucket);

    const start = Date.now();

    try {
      const stream = await this.client.getObject(bucket, objectName);

      this.isEnableLogger && Logger.log(`Object fetched: ${this._objectNameGenerator(bucket, objectName)} +${Date.now() - start}ms`, this.loggerContext);

      return stream;
    } catch (error: any) {
      this.isEnableLogger && Logger.error(`Failed to get object: ${this._objectNameGenerator(bucket, objectName)}`, error?.stack, this.loggerContext);
      throw new NotFoundException('Object not found');
    }
  }
  async getObjectInfo(bucket: string, objectName: string): Promise<StorageObjectInfo> {
    this._validateBucketName(bucket);

    const start = Date.now();

    try {
      const stat = await this.client.statObject(bucket, objectName);

      this.isEnableLogger && Logger.log(`Object info fetched: ${this._objectNameGenerator(bucket, objectName)} +${Date.now() - start}ms`, this.loggerContext);

      return {
        objectName: this._objectNameGenerator(bucket, objectName),
        size: stat.size,
        etag: stat.etag,
        contentType: stat.metaData?.['content-type'],
        lastModified: stat.lastModified,
        metadata: this._normalizeMetadata(stat.metaData),
      };
    } catch (error: any) {
      this.isEnableLogger && Logger.error(`Failed to get object info: ${this._objectNameGenerator(bucket, objectName)}`, error?.stack, this.loggerContext);
      throw new NotFoundException('Object info not found');
    }
  }
  async removeObject(bucket: string, objectName: string): Promise<StorageObjectInfo> {
    this._validateBucketName(bucket);

    const start = Date.now();

    let objectInfo: StorageObjectInfo;

    try {
      objectInfo = await this.getObjectInfo(bucket, objectName);
    } catch (error) {
      throw new NotFoundException('File does not exist');
    }

    try {
      await this.client.removeObject(bucket, objectName);

      this.isEnableLogger && Logger.log(`Object removed: ${this._objectNameGenerator(bucket, objectName)} +${Date.now() - start}ms`, this.loggerContext);

      return objectInfo;
    } catch (error: any) {
      this.isEnableLogger && Logger.error(`Failed to remove object: ${this._objectNameGenerator(bucket, objectName)}`, error?.stack, this.loggerContext);
      throw new InternalServerErrorException('Failed to remove object');
    }
  }
}
