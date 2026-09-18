const { pool } = require("../db");
const AppError = require("../utils/AppError");

async function getSintomasDaDoenca(idDoenca) {
  const { rows } = await pool.query(
    `SELECT s.id_sintoma, s.nome_sintoma
     FROM doenca_sintoma ds
     JOIN sintoma s ON s.id_sintoma = ds.id_sintoma
     WHERE ds.id_doenca = $1`,
    [idDoenca]
  );
  return rows.map((r) => ({ idSintoma: r.id_sintoma, nomeSintoma: r.nome_sintoma }));
}

async function toResponseDTO(row) {
  const sintomas = await getSintomasDaDoenca(row.id_doenca);
  return {
    idDoenca: row.id_doenca,
    nomeDoenca: row.nome_doenca,
    descricaoDoenca: row.descricao_doenca,
    hereditaria: row.hereditaria,
    sintomas,
  };
}

async function buscarRowId(id) {
  const { rows } = await pool.query(
    "SELECT * FROM doenca WHERE id_doenca = $1",
    [id]
  );
  if (!rows[0]) throw new AppError("ID nao encontrado", 404);
  return rows[0];
}

async function setSintomasDaDoenca(client, idDoenca, idSintomas) {
  await client.query("DELETE FROM doenca_sintoma WHERE id_doenca = $1", [idDoenca]);
  if (idSintomas && idSintomas.length > 0) {
    const values = idSintomas.map((_, i) => `($1, $${i + 2})`).join(", ");
    await client.query(
      `INSERT INTO doenca_sintoma (id_doenca, id_sintoma) VALUES ${values}`,
      [idDoenca, ...idSintomas]
    );
  }
}

async function listar(nomeDoenca, isHereditaria) {
  let query = "SELECT * FROM doenca";
  const params = [];

  if (nomeDoenca) {
    query += " WHERE nome_doenca ILIKE $1";
    params.push(`%${nomeDoenca}%`);
  } else if (isHereditaria === true || isHereditaria === "true") {
    query += " WHERE hereditaria = true";
  }

  const { rows } = await pool.query(query, params);
  return Promise.all(rows.map(toResponseDTO));
}

async function pegarPorId(id) {
  return toResponseDTO(await buscarRowId(id));
}

async function salvar(dto) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO doenca (nome_doenca, descricao_doenca, hereditaria)
       VALUES ($1, $2, $3) RETURNING *`,
      [dto.nomeDoenca, dto.descricaoDoenca, dto.hereditaria]
    );
    const doenca = rows[0];
    await setSintomasDaDoenca(client, doenca.id_doenca, dto.idSintomas);
    await client.query("COMMIT");
    return toResponseDTO(doenca);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function atualizar(id, dto) {
  await buscarRowId(id);

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `UPDATE doenca SET nome_doenca = $1, descricao_doenca = $2, hereditaria = $3
       WHERE id_doenca = $4 RETURNING *`,
      [dto.nomeDoenca, dto.descricaoDoenca, dto.hereditaria, id]
    );
    if (dto.idSintomas !== undefined) {
      await setSintomasDaDoenca(client, id, dto.idSintomas);
    }
    await client.query("COMMIT");
    return toResponseDTO(rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function deletar(id) {
  await buscarRowId(id);
  await pool.query("DELETE FROM doenca WHERE id_doenca = $1", [id]);
}

module.exports = { listar, pegarPorId, salvar, atualizar, deletar, getSintomasDaDoenca };
