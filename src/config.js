require("dotenv").config();

const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  mysql: {
    host: process.env.MYSQL_HOST || "localhost",
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || "app_user",
    password: process.env.MYSQL_PASSWORD || "app_password",
    database: process.env.MYSQL_DATABASE || "incident_service",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
};

module.exports = config;

