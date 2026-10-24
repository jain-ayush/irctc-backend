const { randomUUID } = require("node:crypto");

module.exports = function requestId(req, res, next) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};
