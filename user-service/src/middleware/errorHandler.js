const logger = require("../config/logger");
const { AppError } = require("../utils/error");

module.exports = function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const isOperationalError = error instanceof AppError;
  const status = isOperationalError ? error.statusCode : 500;
  const code = isOperationalError ? error.code : "INTERNAL_SERVER_ERROR";
  logger.error("Request failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    status,
    error
  });

  res.status(status).json({
    error: isOperationalError ? error.message : "Internal server error",
    code,
    requestId: req.requestId
  });
};
