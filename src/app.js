const express = require("express");

function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "reliable-node-service"
    });
  });

  return app;
}

module.exports = createApp;
