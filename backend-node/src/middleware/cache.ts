import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { ValidationError } from '../utils/errors';

const redisClient = new Redis(process.env.REDIS_URI || 'redis://localhost:6379');

redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});

interface CacheOptions {
  expire?: number; // Time in seconds
  key?: (req: Request) => string;
}

const defaultKeyGenerator = (req: Request): string => {
  const path = req.originalUrl || req.url;
  return `api:${path}`;
};

export const cache = (options: CacheOptions = {}) => {
  const ttl = options.expire || 300; // Default 5 minutes
  const keyGenerator = options.key || defaultKeyGenerator;

  return async (req: Request, res: Response, next: NextFunction) => {
    // Skip cache for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    try {
      const key = keyGenerator(req);
      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original send
      const sendResponse = res.json;

      // Override response method to cache the response
      res.json = function(body: unknown): Response {
        try {
          redisClient.setex(key, ttl, JSON.stringify(body));
        } catch (error) {
          console.error('Redis cache error:', error);
        }
        return sendResponse.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = async (pattern: string): Promise<void> => {
  try {
    const keys = await redisClient.keys(`api:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    console.error('Clear cache error:', error);
    throw new ValidationError('Failed to clear cache');
  }
};

export const cacheMiddleware = {
  cache,
  clearCache,
  client: redisClient,
};
