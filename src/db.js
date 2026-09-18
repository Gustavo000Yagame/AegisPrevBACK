const { Pool } = require("pg");

const useSsl = process.env.PGSSL !== "false";

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    })
  : new Pool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT || 5432),
      user: process.env.DB_USERNAME || "postgres",
      password: process.env.DB_PASSWORD || "root",
      database: process.env.DB_NAME || "AegisPrev",
      ssl: useSsl ? { rejectUnauthorized: false } : false,
    });

module.exports = { pool };
