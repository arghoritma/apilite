// src/services/redisClient.ts
import { createClient } from 'redis';
import 'dotenv/config';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Hubungkan klien di awal
(async () => {
  await redisClient.connect();
})();

console.log('Terhubung ke Redis...');

export default redisClient;