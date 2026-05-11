const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./logger");
const { ping } = require("./db");


function createApp(pool) {

  const app = express();

  app.use(express.json());

  app.use(
    pinoHttp({
      logger
    })
  );

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "reliable-node-service"
    });
  });

  app.get("/ready", async (req, res) => {
  try {
    const databaseOk = await ping(pool);

    res.status(databaseOk ? 200 : 503).json({
      status: databaseOk ? "ready" : "not_ready",
      dependencies: {
        mysql: databaseOk ? "ok" : "unavailable"
      }
    });
  } catch (error) {
    res.status(503).json({
      status: "not_ready",
      dependencies: {
        mysql: "unavailable"
      }
    });
  }
});


  return app;
}

module.exports = createApp;

