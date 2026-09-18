const { pool } = require("../db");
const AppError = require("../utils/AppError");
const { getConsultasResumo } = require("./consultaResumo.helper");

async function toResponseDTO(row) {
  const consultas = await getConsultasResumo({ idPaciente: row.id_paciente });
  return {
    idPaciente: row.id_paciente,
    nomePaciente: row.nome_paciente,
    cpfPaciente: row.cpf_paciente,
    dataNascimento: row.data_nascimento,
    consultas,
  };
}

async function buscarRowPorId(idPaciente) {
  const { rows } = await pool.query(
    "SELECT * FROM paciente WHERE id_paciente = $1",
    [idPaciente]
  );
  if (!rows[0]) throw new AppError("ID do paciente nao encontrado", 404);
  return rows[0];
}

async function listar(nomePaciente, cpfPaciente) {
  let query = "SELECT * FROM paciente";
  const params = [];

  if (nomePaciente) {
    query += " WHERE nome_paciente ILIKE $1";
    params.push(`%${nomePaciente}%`);
  } else if (cpfPaciente) {
    query += " WHERE cpf_paciente = $1";
    params.push(cpfPaciente);
  }

  const { rows } = await pool.query(query, params);

  if (cpfPaciente && rows.length === 0) {
    throw new AppError("CPF nao encontrado", 404);
  }

  return Promise.all(rows.map(toResponseDTO));
}

async function buscarPorId(idPaciente) {
  return toResponseDTO(await buscarRowPorId(idPaciente));
}

async function cadastrarPaciente(dto) {
  const existe = await pool.query(
    "SELECT 1 FROM paciente WHERE cpf_paciente = $1",
    [dto.cpfPaciente]
  );
  if (existe.rows.length > 0) {
    throw new AppError("CPF já cadastrado", 409);
  }

  const { rows } = await pool.query(
    `INSERT INTO paciente (nome_paciente, cpf_paciente, data_nascimento)
     VALUES ($1, $2, $3) RETURNING *`,
    [dto.nomePaciente, dto.cpfPaciente, dto.dataNascimento || null]
  );

  return toResponseDTO(rows[0]);
}

async function atualizarPaciente(idPaciente, dto) {
  await buscarRowPorId(idPaciente);

  const { rows } = await pool.query(
    `UPDATE paciente SET nome_paciente = $1, cpf_paciente = $2, data_nascimento = $3
     WHERE id_paciente = $4 RETURNING *`,
    [dto.nomePaciente, dto.cpfPaciente, dto.dataNascimento || null, idPaciente]
  );

  return toResponseDTO(rows[0]);
}

async function deletar(idPaciente) {
  await buscarRowPorId(idPaciente);
  await pool.query("DELETE FROM paciente WHERE id_paciente = $1", [idPaciente]);
}

module.exports = {
  listar,
  buscarPorId,
  cadastrarPaciente,
  atualizarPaciente,
  deletar,
};
