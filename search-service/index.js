const app = require("./src/app");
const config = require("./src/config");

const server = app.listen(config.port, () => {
  console.log(`${config.serviceName} listening on port ${config.port}`);
});

function shutdown() {
  server.close((error) => {
    if (error) {
      console.error("Failed to shut down cleanly", error);
      process.exitCode = 1;
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
