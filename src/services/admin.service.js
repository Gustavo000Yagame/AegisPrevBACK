const { pool } = require("../db");
const AppError = require("../utils/AppError");

async function tornarAdmin(idUsuario, dataFim) {
  const { rows } = await pool.query(
    "SELECT * FROM usuario WHERE id_usuario = $1",
    [idUsuario]
  );
  if (!rows[0]) throw new AppError("Usuário não encontrado", 404);

  await pool.query(
    "UPDATE usuario SET papeis = 'ROLE_ADMIN', admin_date = $1 WHERE id_usuario = $2",
    [dataFim, idUsuario]
  );
}

async function removerAdmin(idUsuario) {
  const { rows } = await pool.query(
    "SELECT * FROM usuario WHERE id_usuario = $1",
    [idUsuario]
  );
  if (!rows[0]) throw new AppError("Usuário não encontrado", 404);

  await pool.query(
    "UPDATE usuario SET papeis = 'ROLE_MEDICO', admin_date = NULL WHERE id_usuario = $1",
    [idUsuario]
  );
}

function tornarAdminPorUmaSemana(id) {
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + 7);
  return tornarAdmin(id, dataFim);
}

function tornarAdminPorUmMes(id) {
  const dataFim = new Date();
  dataFim.setMonth(dataFim.getMonth() + 1);
  return tornarAdmin(id, dataFim);
}

function tornarAdminPermanente(id) {
  return tornarAdmin(id, null);
}

async function top10Doencas() {
  const { rows } = await pool.query(`
    SELECT d.nome_doenca, COUNT(*) AS quantidade
    FROM consulta_doenca cd
    JOIN doenca d ON d.id_doenca = cd.doenca_id
    GROUP BY d.nome_doenca
    ORDER BY quantidade DESC
    LIMIT 10
  `);

  const totalResult = await pool.query("SELECT COUNT(*) FROM consulta_doenca");
  const total = Number(totalResult.rows[0].count);

  return rows.map((row) => ({
    idDoenca: null,
    nomeDoenca: row.nome_doenca,
    quantidade: Number(row.quantidade),
    porcentagem: total === 0 ? 0 : (Number(row.quantidade) * 100) / total,
  }));
}

async function rankingMedicos() {
  const { rows } = await pool.query(`
    SELECT m.id_medico, m.nome, COUNT(c.id_consulta) AS quantidade
    FROM consulta c
    JOIN medico m ON m.id_medico = c.id_medico
    GROUP BY m.id_medico, m.nome
    ORDER BY quantidade DESC
    LIMIT 10
  `);

  const totalResult = await pool.query("SELECT COUNT(*) FROM consulta");
  const total = Number(totalResult.rows[0].count);

  return rows.map((row) => ({
    idMedico: row.id_medico,
    nomeMedico: row.nome,
    totalConsultas: Number(row.quantidade),
    porcentagem: total === 0 ? 0 : (Number(row.quantidade) * 100) / total,
  }));
}

module.exports = {
  removerAdmin,
  tornarAdminPorUmaSemana,
  tornarAdminPorUmMes,
  tornarAdminPermanente,
  top10Doencas,
  rankingMedicos,
};
