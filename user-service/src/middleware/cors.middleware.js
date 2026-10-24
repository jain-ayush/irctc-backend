const cors = require("cors");
const config = require("../config");
const { ForbiddenError } = require("../utils/error");

module.exports = cors({
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Accept", "Authorization", "Content-Type", "X-Request-Id"],
  origin(origin, callback) {
    if (!origin || config.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ForbiddenError("Origin is not allowed by CORS"));
  },
  credentials: true
});
