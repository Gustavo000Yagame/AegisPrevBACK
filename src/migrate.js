require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { pool } = require("./db");

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  console.log("Aplicando schema.sql no banco...");
  await pool.query(sql);
  console.log("Schema aplicado com sucesso.");
  await pool.end();
}

migrate().catch((err) => {
  console.error("Erro ao aplicar schema:", err);
  process.exit(1);
});
