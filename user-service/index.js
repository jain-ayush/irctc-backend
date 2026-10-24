const cookieParser = require("cookie-parser");
const express = require("express");
const helmet = require("helmet");
const config = require("./src/config");
const logger = require("./src/config/logger");
const userController = require("./src/controllers");
const corsMiddleware = require("./src/middleware/cors.middleware");
const errorMiddleware = require("./src/middleware/error.middleware");
const notFoundMiddleware = require("./src/middleware/notFound");
const reqMiddleware = require("./src/middleware/req.middleware");
const authRoutes = require('./src/routes/auth.route')
const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(corsMiddleware);
app.use(express.json());
app.use(cookieParser());
app.use(reqMiddleware);
app.use("/api/v1/auth", authRoutes)

app.get("/", (req, res) => {
  res.json({ message: `${config.serviceName} is running` });
});
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: config.serviceName });
});
app.use("/api", userController);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

if (require.main === module) {
  const server = app.listen(config.port, () => {
    logger.info(`${config.serviceName} listening`, { port: config.port });
  });

  function shutdown() {
    server.close((error) => {
      if (error) {
        logger.error("Failed to shut down cleanly", error);
        process.exitCode = 1;
      }
    });
  }

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

module.exports = app;
