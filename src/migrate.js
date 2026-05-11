const { createPool } = require("./db");
const logger = require("./logger");

const createIncidentsTable = `
  CREATE TABLE IF NOT EXISTS incidents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(120) NOT NULL,
    severity ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'low',
    status ENUM('open', 'investigating', 'resolved') NOT NULL DEFAULT 'open',
    description TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_severity (severity),
    INDEX idx_service_name (service_name)
  )
`;

async function migrate(pool = createPool()) {
  await pool.query(createIncidentsTable);
}

if (require.main === module) {
  const pool = createPool();

  migrate(pool)
    .then(async () => {
      logger.info("database migration completed");
      await pool.end();
    })
    .catch(async (error) => {
      logger.error({ error }, "database migration failed");
      await pool.end();
      process.exit(1);
    });
}

module.exports = {
  migrate
};
