import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryStrategy: () => 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  enableOfflineQueue: false,
});

redis.on('error', (error) => {
  console.error('🔥 Redis connection error:', error);
});

let isRedisConnected = false;

redis.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Redis connected successfully');
});

redis.on('close', () => {
  isRedisConnected = false;
  console.log('❌ Redis connection closed');
});

const isRedisAvailable = () => isRedisConnected;

const checkRedisConnection = async () => {
  try {
    const redisAvailable = await isRedisAvailable();
    if (redisAvailable) {
      console.log("⚡ Redis connected successfully");
    } else {
      console.warn("⚠️ Redis connection failed - continuing without Redis");
    }
  } catch (error) {
    console.warn("💥 Redis connection error - continuing without Redis:", error);
  }
};

export default redis;
export { checkRedisConnection }
