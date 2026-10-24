const Redis = require("ioredis");
const config = require("./index");
const logger = require("./logger");

class redisClient {
  static instance;

  static getInstance() {
    if (!redisClient.instance) {
      if (!config.redisUrl) {
        throw new Error("REDIS_URL must be configured before connecting to Redis");
      }

      redisClient.instance = new Redis(config.redisUrl, {
        retryStrategy(retries) {
          if (retries > 3) {
            logger.error("Redis connection retries exhausted", { retries });
            return null;
          }

          return retries * 200;
        }
      });

      redisClient.instance.on("ready", () => {
        logger.info("Redis connection established");
      });
      redisClient.instance.on("error", (error) => {
        logger.error("Redis connection error", error);
      });
    }

    return redisClient.instance;
  }
}

module.exports = {
     redis: redisClient.getInstance(),
     redisClient
};
