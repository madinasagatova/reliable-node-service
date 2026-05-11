const createApp = require("./app");
const config = require("./config");
const logger = require("./logger");

const { createPool } = require("./db");

const pool = createPool();
const app = createApp(pool);


app.listen(config.port, () => {
  logger.info({ port: config.port }, "reliable-node-service started");
});

