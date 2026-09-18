const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const AppError = require("../utils/AppError");
const { getConsultasResumo } = require("./consultaResumo.helper");

async function toResponseDTO(row) {
  const consultas = await getConsultasResumo({ idMedico: row.id_medico });
  return {
    idMedico: row.id_medico,
    nome: row.nome,
    sexo: row.sexo,
    idade: row.idade,
    email: row.email,
    idUsuario: row.id_usuario,
    role: row.papeis,
    consultas,
  };
}

const SELECT_MEDICO_JOIN_USUARIO = `
  SELECT m.id_medico, m.nome, m.sexo, m.idade, m.id_usuario, u.email, u.papeis
  FROM medico m
  JOIN usuario u ON u.id_usuario = m.id_usuario
`;

async function listar(nome) {
  const query = nome
    ? `${SELECT_MEDICO_JOIN_USUARIO} WHERE m.nome ILIKE $1`
    : SELECT_MEDICO_JOIN_USUARIO;
  const params = nome ? [`%${nome}%`] : [];

  const { rows } = await pool.query(query, params);
  return Promise.all(rows.map(toResponseDTO));
}

async function buscarRowPorId(idMedico) {
  const { rows } = await pool.query(
    `${SELECT_MEDICO_JOIN_USUARIO} WHERE m.id_medico = $1`,
    [idMedico]
  );
  if (!rows[0]) throw new AppError("ID nao encontrado", 404);
  return rows[0];
}

function validarAcesso(row, usuarioLogado) {
  if (usuarioLogado.papeis === "ROLE_ADMIN") return;
  if (row.id_usuario !== usuarioLogado.idUsuario) {
    throw new AppError("Acesso negado", 403);
  }
}

async function buscarPorId(idMedico, usuarioLogado) {
  const row = await buscarRowPorId(idMedico);
  if (usuarioLogado) validarAcesso(row, usuarioLogado);
  return toResponseDTO(row);
}

async function buscarRowPorEmail(email) {
  const { rows } = await pool.query(
    `${SELECT_MEDICO_JOIN_USUARIO} WHERE u.email = $1`,
    [email]
  );
  return rows[0];
}

async function buscarPorEmail(email) {
  const row = await buscarRowPorEmail(email);
  if (!row) throw new AppError("Medico nao encontrado", 404);
  return toResponseDTO(row);
}

async function buscarRowPorUsuarioId(idUsuario) {
  const { rows } = await pool.query(
    `${SELECT_MEDICO_JOIN_USUARIO} WHERE m.id_usuario = $1`,
    [idUsuario]
  );
  return rows[0];
}

async function buscarLogado(usuarioLogado) {
  const row = await buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  if (!row) throw new AppError("Médico não encontrado", 404);
  return toResponseDTO(row);
}

async function salvar(dto) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const senhaHash = await bcrypt.hash(dto.password, 10);

    const usuarioResult = await client.query(
      `INSERT INTO usuario (email, password, papeis)
       VALUES ($1, $2, 'ROLE_MEDICO')
       RETURNING id_usuario, email, papeis`,
      [dto.email, senhaHash]
    );
    const usuario = usuarioResult.rows[0];

    const medicoResult = await client.query(
      `INSERT INTO medico (nome, sexo, idade, id_usuario)
       VALUES ($1, $2, $3, $4)
       RETURNING id_medico, nome, sexo, idade, id_usuario`,
      [dto.nome, dto.sexo, dto.idade, usuario.id_usuario]
    );
    const medico = medicoResult.rows[0];

    await client.query("COMMIT");

    return toResponseDTO({ ...medico, email: usuario.email, papeis: usuario.papeis });
  } catch (err) {
    await client.query("ROLLBACK");
    if (err.code === "23505") {
      throw new AppError("Email já cadastrado", 409);
    }
    throw err;
  } finally {
    client.release();
  }
}

async function atualizar(idMedico, dto, usuarioLogado) {
  const existente = await buscarRowPorId(idMedico);
  if (usuarioLogado) validarAcesso(existente, usuarioLogado);

  await pool.query(
    `UPDATE medico SET nome = $1, sexo = $2, idade = $3 WHERE id_medico = $4`,
    [dto.nome, dto.sexo, dto.idade, idMedico]
  );

  return buscarPorId(idMedico);
}

async function deletar(idMedico) {
  await buscarRowPorId(idMedico);
  await pool.query("DELETE FROM medico WHERE id_medico = $1", [idMedico]);
}

module.exports = {
  listar,
  buscarPorId,
  buscarRowPorId,
  buscarPorEmail,
  buscarRowPorUsuarioId,
  buscarLogado,
  salvar,
  atualizar,
  deletar,
};
