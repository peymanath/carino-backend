import { EnumRedisDatabase } from '../../shared/enums/EnumRedisDatabase';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis, { RedisKey } from 'ioredis';
import { Callback } from 'tough-cookie';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private static redisClient: Redis | null = null;
  private static currentDb: number | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    if (!RedisService.redisClient) {
      const host = this.configService.get<string>('redis.host');
      const port = this.configService.get<number>('redis.port');
      const username = this.configService.get<string>('redis.username');
      const password = this.configService.get<string>('redis.password');
      const db = this.configService.get<number>('redis.db') || 0;

      RedisService.redisClient = new Redis({
        host,
        port,
        username,
        password,
        db,
      });

      RedisService.redisClient.on('connect', () => {});
      RedisService.redisClient.on('error', err => console.error('❌ Redis error:', err));

      try {
        await RedisService.redisClient.ping();
      } catch (err) {
        console.error('❌ Failed to connect to Redis:', err);
      }
    }
  }

  switchDatabase(db: EnumRedisDatabase): void {
    if (RedisService.redisClient) {
      RedisService.redisClient.select(db); // Switch to the desired database
    } else {
      throw new Error('❌ Redis client is not initialized');
    }
  }

  async switchDatabaseIfNeeded(db: EnumRedisDatabase): Promise<void> {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }

    // Avoid switching if already on the desired DB
    if (RedisService.currentDb === Number(db)) {
      return;
    }

    this.switchDatabase(db);
    RedisService.currentDb = Number(db);
  }

  async set(key: string, value: string, expiry?: number): Promise<void> {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }

    if (expiry) {
      await RedisService.redisClient.set(key, value, 'EX', expiry);
    } else {
      await RedisService.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }

    return RedisService.redisClient.get(key);
  }

  async delete(key: string): Promise<number> {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }

    return RedisService.redisClient.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (RedisService.redisClient) {
      await RedisService.redisClient.quit();
      RedisService.redisClient = null;
    }
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }
    return RedisService.redisClient.mget(...keys);
  }
  async rpush(key: string | Buffer, ...elements: (string | Buffer | number)[]) {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }
    return RedisService.redisClient.rpush(key, ...elements);
  }

  getClient(): Redis {
    if (!RedisService.redisClient) {
      throw new Error('❌ Redis client is not initialized');
    }
    return RedisService.redisClient;
  }
}
