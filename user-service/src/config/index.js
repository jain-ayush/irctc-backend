const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT || 4001);
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:4000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  serviceName: process.env.SERVICE_NAME || "user-service",
  allowedOrigins,
  redisUrl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL || "info",
  OTP_TTL: process.env.OTP_TTL || 300,
  OTP_RATE_MAX_PER_HOUR: process.env.OTP_RATE_MAX_PER_HOUR || 5,
  OTP_MAX_VERIFY_ATTEMPTS: process.env.OTP_MAX_VERIFY_ATTEMPTS || 5,
  OTP_HMAC_SECRET: process.env.OTP_HMAC_SECRET || "47a53f5db5e30bd6c2ad68d968619f20a17d7d81ed00dd7aff87fccc10b08e1c",
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "6d9e886ef2974d7f22fdf949260f02e832018555c067289d4f32741dfa0c4a4b",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "56d263f054c7b579b55d2ea348c14ee7b213ef37be190435f27188482671f836d77f5ee3753449550ae1f33091ded83222360b3d02028ef21072b231a992b05b",
  ACCESS_TOKEN_EXP: process.env.ACCESS_TOKEN_EXP || "15m",
  REFRESH_TOKEN_EXP: process.env.REFRESH_TOKEN_EXP || "7d",
  ACCESS_TOKEN_EXP_SEC: Number(process.env.ACCESS_TOKEN_EXP_SEC || 900),
  REFRESH_TOKEN_EXP_SEC: Number(process.env.REFRESH_TOKEN_EXP_SEC || 604800),
  REDIS_USER_TTL: Number(process.env.REDIS_USER_TTL || 86400),
};

module.exports = config;