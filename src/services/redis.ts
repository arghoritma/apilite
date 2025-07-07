import Redis from 'ioredis';

interface RedisConfig {
  host?: string;
  port?: number;
  retryStrategy?: () => number;
  maxRetriesPerRequest?: number;
  lazyConnect?: boolean;
  enableOfflineQueue?: boolean;
}

type ExpireMode = "EX"

export class RedisService {
  private redis: Redis;
  private isRedisConnected: boolean = false;

  constructor(config?: RedisConfig) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy: () => 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: true,
      ...config
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.redis.on('error', (error) => {
      console.error('🔥 Redis connection error:', error);
    });

    this.redis.on('close', () => {
      this.isRedisConnected = false;
      console.log('❌ Redis connection closed');
    });
  }

  private async testRedisConnection(): Promise<boolean> {
    try {
      await this.redis.set("test_connection", "ping", "EX", 3);
      const result = await this.redis.get("test_connection");
      this.isRedisConnected = result === "ping";
      return this.isRedisConnected;
    } catch (error) {
      this.isRedisConnected = false;
      return false;
    }
  }

  async checkConnection(): Promise<void> {
    try {
      const redisAvailable = await this.testRedisConnection();
      if (redisAvailable) {
        console.log("⚡ Redis connected successfully");
      } else {
        console.warn("⚠️ Redis connection failed - continuing without Redis");
      }
    } catch (error) {
      console.warn("💥 Redis connection error - continuing without Redis:", error);
    }
  }

  isAvailable(): boolean {
    return this.isRedisConnected;
  }

  getClient(): Redis {
    return this.redis;
  }

  async set(key: string, value: string, expireMode?: ExpireMode, duration?: number): Promise<string | null> {
    try {
      if (expireMode && duration) {
        return await this.redis.set(key, value, expireMode, duration);
      }
      return await this.redis.set(key, value);
    } catch (error) {
      throw new Error(`Failed to set Redis key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.redis.get(key);
    } catch (error) {
      throw new Error(`Failed to get Redis key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
