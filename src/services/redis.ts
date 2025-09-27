
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
    this.redis.on('connect', () => {
      this.isRedisConnected = true;
      console.log('✅ Redis connected');
    });
    this.redis.on('ready', () => {
      this.isRedisConnected = true;
      console.log('🟢 Redis ready');
    });
    this.redis.on('error', (error) => {
      // Jika error fatal, set isRedisConnected ke false
      if (error && error.message && error.message.match(/ECONNREFUSED|Connection is closed/)) {
        this.isRedisConnected = false;
      }

    });
    this.redis.on('close', () => {
      this.isRedisConnected = false;

    });
    this.redis.on('end', () => {
      this.isRedisConnected = false;
      console.log('🔴 Redis connection ended');
    });
    this.redis.on('reconnecting', () => {
      this.isRedisConnected = false;

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



  // isAvailable hanya mengandalkan event, bukan real-time ping. Jika ingin real-time, bisa gunakan ping atau get/set test.
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

  /**
   * Mengecek ketersediaan Redis secara real-time (ping/set-get test).
   * Return true jika Redis benar-benar aktif.
   */
  async isReallyAvailable(): Promise<boolean> {
    try {
      // Gunakan ping jika didukung, fallback ke set/get test
      if (typeof this.redis?.ping === 'function') {
        const pong = await this.redis.ping();
        return pong === 'PONG';
      } else {
        await this.redis.set('test_is_really_available', '1', 'EX', 2);
        const val = await this.redis.get('test_is_really_available');
        return val === '1';
      }
    } catch {
      return false;
    }
  }
}
