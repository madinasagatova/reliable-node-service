const express = require("express");
const pinoHttp = require("pino-http");
const logger = require("./logger");

function createApp() {
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

  return app;
}

module.exports = createApp;

