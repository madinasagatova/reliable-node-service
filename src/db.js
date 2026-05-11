const mysql = require("mysql2/promise");
const config = require("./config");

function createPool(overrides = {}) {
  return mysql.createPool({
    ...config.mysql,
    ...overrides
  });
}

async function ping(pool) {
  const [rows] = await pool.query("SELECT 1 AS ok");
  return rows[0]?.ok === 1;
}

module.exports = {
  createPool,
  ping
};
