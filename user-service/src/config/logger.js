const winston = require("winston");
const config = require("./index");

function serializeContext(context) {
  if (context instanceof Error) {
    return {
      error: context.message,
      stack: context.stack
    };
  }

  if (context && context.error instanceof Error) {
    return {
      ...context,
      error: context.error.message,
      stack: context.error.stack
    };
  }

  return context;
}

function log(level, message, context) {
  winstonLogger.log({
    level,
    message,
    ...(context === undefined ? {} : { context: serializeContext(context) })
  });
}

const winstonLogger = winston.createLogger({
  level: config.logLevel,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.Console()]
});

module.exports = {
  info(message, context) {
    log("info", message, context);
  },
  error(message, context) {
    log("error", message, context);
  }
};
