const { pool } = require("../db");
const AppError = require("../utils/AppError");

function toResponseDTO(row) {
  return {
    idSintoma: row.id_sintoma,
    nomeSintoma: row.nome_sintoma,
    descricaoSintoma: row.descricao_sintoma,
  };
}

async function pegarRowId(id) {
  const { rows } = await pool.query(
    "SELECT * FROM sintoma WHERE id_sintoma = $1",
    [id]
  );
  if (!rows[0]) throw new AppError("ID do sintoma nao encontrado", 404);
  return rows[0];
}

async function listar() {
  const { rows } = await pool.query("SELECT * FROM sintoma ORDER BY id_sintoma");
  return rows.map(toResponseDTO);
}

async function buscarPorId(id) {
  return toResponseDTO(await pegarRowId(id));
}

async function cadastrar(dto) {
  const { rows } = await pool.query(
    `INSERT INTO sintoma (nome_sintoma, descricao_sintoma) VALUES ($1, $2) RETURNING *`,
    [dto.nomeSintoma, dto.descricaoSintoma]
  );
  return toResponseDTO(rows[0]);
}

async function atualizar(id, dto) {
  await pegarRowId(id);
  const { rows } = await pool.query(
    `UPDATE sintoma SET nome_sintoma = $1, descricao_sintoma = $2 WHERE id_sintoma = $3 RETURNING *`,
    [dto.nomeSintoma, dto.descricaoSintoma, id]
  );
  return toResponseDTO(rows[0]);
}

async function deletar(id) {
  await pegarRowId(id);
  await pool.query("DELETE FROM sintoma WHERE id_sintoma = $1", [id]);
}

module.exports = { listar, buscarPorId, cadastrar, atualizar, deletar };
