import process from 'node:process';
import redis from 'redis';

const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

redisClient.on('error', (err) => console.error('Redis Error:', err));

(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

export default redisClient;
