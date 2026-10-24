const express = require("express");
const config = require("./config");
const searchController = require("./controllers");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const requestId = require("./middleware/requestId");

const app = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "1mb" }));
app.use(requestId);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: config.serviceName });
});
app.use("/api", searchController);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
