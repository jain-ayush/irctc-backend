const { randomUUID } = require("node:crypto");
const { performance } = require("node:perf_hooks");
const logger = require("../config/logger");

const reqLogger = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.once("finish", () => {
    logger.info("HTTP request completed", {
      requestId,
      method: req.method,
      statusCode: res.statusCode,
      originalUrl: req.originalUrl,
      responseTimeMs: `${Date.now() - startedAt}ms`
    });
  });

  next();
};

module.exports = reqLogger;
