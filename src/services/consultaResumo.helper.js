const { pool } = require("../db");

async function getDoencasDaConsulta(idConsulta) {
  const { rows } = await pool.query(
    `SELECT d.id_doenca, d.nome_doenca
     FROM consulta_doenca cd
     JOIN doenca d ON d.id_doenca = cd.doenca_id
     WHERE cd.consulta_id = $1`,
    [idConsulta]
  );
  return rows.map((r) => ({ idDoenca: r.id_doenca, nomeDoenca: r.nome_doenca }));
}

// Equivalente ao ConsultaResumoDTO usado dentro de MedicoResponseDTO / PacienteResponseDTO
async function getConsultasResumo({ idMedico, idPaciente }) {
  const where = idMedico ? "id_medico = $1" : "id_paciente = $1";
  const value = idMedico || idPaciente;

  const { rows } = await pool.query(
    `SELECT id_consulta, id_medico, id_paciente, data_consulta
     FROM consulta
     WHERE ${where}`,
    [value]
  );

  const resumos = [];
  for (const row of rows) {
    const doencas = await getDoencasDaConsulta(row.id_consulta);
    resumos.push({
      idConsulta: row.id_consulta,
      idMedico: row.id_medico,
      idPaciente: row.id_paciente,
      dataConsulta: row.data_consulta,
      doencas,
    });
  }
  return resumos;
}

module.exports = { getConsultasResumo, getDoencasDaConsulta };
