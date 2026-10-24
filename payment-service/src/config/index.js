const dotenv = require("dotenv");

dotenv.config();

const port = Number(process.env.PORT || 3003);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || "development",
  port,
  serviceName: process.env.SERVICE_NAME || "payment-service"
};
