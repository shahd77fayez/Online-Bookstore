import Redis from 'ioredis';

const redis = new Redis({
  host: '127.0.0.1', // Redis host (change if necessary)
  port: 6379 // Redis default port
});

// Function to add token to blacklist (expires in 1 day)
export const addToBlackList = async (token, expiry = 86400) => {
  await redis.set(token, 'blacklisted', 'EX', expiry);
};

// Function to check if a token is blacklisted
export const isTokenBlackListed = async (token) => {
  const result = await redis.get(token);
  return result === 'blacklisted';
};

export default redis;
