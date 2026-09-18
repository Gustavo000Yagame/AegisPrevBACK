const { pool } = require("../db");
const AppError = require("../utils/AppError");
const medicoService = require("./medico.service");
const doencaService = require("./doenca.service");

async function getSintomasDaConsulta(idConsulta) {
  const { rows } = await pool.query(
    `SELECT s.id_sintoma, s.nome_sintoma
     FROM consulta_sintoma cs
     JOIN sintoma s ON s.id_sintoma = cs.sintoma_id
     WHERE cs.consulta_id = $1`,
    [idConsulta]
  );
  return rows.map((r) => ({ idSintoma: r.id_sintoma, nomeSintoma: r.nome_sintoma }));
}

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

// Compatibilidade = (sintomas da doença que também estão na consulta) / (total de sintomas da consulta) * 100
function calcularCompatibilidade(sintomaIdsDaDoenca, sintomaIdsDaConsulta) {
  if (sintomaIdsDaConsulta.length === 0) return 0;
  const setDoenca = new Set(sintomaIdsDaDoenca);
  const coincidencias = sintomaIdsDaConsulta.filter((id) => setDoenca.has(id)).length;
  return (coincidencias / sintomaIdsDaConsulta.length) * 100;
}

async function calcularPrevisoes(sintomaIdsDaConsulta) {
  const { rows: doencas } = await pool.query("SELECT * FROM doenca");

  const previsoes = [];
  for (const doenca of doencas) {
    const sintomasDoenca = await doencaService.getSintomasDaDoenca(doenca.id_doenca);
    const sintomaIdsDoenca = sintomasDoenca.map((s) => s.idSintoma);
    const compatibilidade = calcularCompatibilidade(sintomaIdsDoenca, sintomaIdsDaConsulta);

    if (compatibilidade >= 10) {
      previsoes.push({
        id: doenca.id_doenca,
        nome: doenca.nome_doenca,
        compatibilidade,
      });
    }
  }

  return previsoes.sort((a, b) => b.compatibilidade - a.compatibilidade);
}

async function preverDoencasParaSalvar(sintomaIdsDaConsulta) {
  const { rows: doencas } = await pool.query("SELECT * FROM doenca");
  const idsCompatíveis = [];

  for (const doenca of doencas) {
    const sintomasDoenca = await doencaService.getSintomasDaDoenca(doenca.id_doenca);
    const sintomaIdsDoenca = sintomasDoenca.map((s) => s.idSintoma);
    const compatibilidade = calcularCompatibilidade(sintomaIdsDoenca, sintomaIdsDaConsulta);
    if (compatibilidade >= 70) {
      idsCompatíveis.push(doenca.id_doenca);
    }
  }

  return idsCompatíveis;
}

async function toResponseDTO(row) {
  const [sintomas, doencas, medicoRow, pacienteRow] = await Promise.all([
    getSintomasDaConsulta(row.id_consulta),
    getDoencasDaConsulta(row.id_consulta),
    pool.query("SELECT id_medico, nome FROM medico WHERE id_medico = $1", [row.id_medico]),
    pool.query(
      "SELECT id_paciente, nome_paciente, cpf_paciente FROM paciente WHERE id_paciente = $1",
      [row.id_paciente]
    ),
  ]);

  const sintomaIds = sintomas.map((s) => s.idSintoma);
  const previsoes = await calcularPrevisoes(sintomaIds);

  return {
    idConsulta: row.id_consulta,
    medico: medicoRow.rows[0]
      ? { idMedico: medicoRow.rows[0].id_medico, nome: medicoRow.rows[0].nome }
      : null,
    paciente: pacienteRow.rows[0]
      ? {
          idPaciente: pacienteRow.rows[0].id_paciente,
          nomePaciente: pacienteRow.rows[0].nome_paciente,
          cpfPaciente: pacienteRow.rows[0].cpf_paciente,
        }
      : null,
    dataConsulta: row.data_consulta,
    descricao: row.descricao,
    sintomas,
    doencas,
    previsoes,
  };
}

async function buscarRowId(id) {
  const { rows } = await pool.query(
    "SELECT * FROM consulta WHERE id_consulta = $1",
    [id]
  );
  if (!rows[0]) throw new AppError("ID não encontrado", 404);
  return rows[0];
}

function validarAcesso(row, usuarioLogado, medicoDoUsuario) {
  if (usuarioLogado.papeis === "ROLE_ADMIN") return;
  if (!medicoDoUsuario || row.id_medico !== medicoDoUsuario.id_medico) {
    throw new AppError("Acesso negado", 404);
  }
}

async function listarTodasComoAdmin() {
  const { rows } = await pool.query("SELECT * FROM consulta ORDER BY id_consulta DESC");
  return Promise.all(rows.map(toResponseDTO));
}

async function listarDoMedicoLogado(usuarioLogado) {
  const medico = await medicoService.buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  if (!medico) throw new AppError("Médico não encontrado", 404);

  const { rows } = await pool.query(
    "SELECT * FROM consulta WHERE id_medico = $1 ORDER BY id_consulta DESC",
    [medico.id_medico]
  );
  return Promise.all(rows.map(toResponseDTO));
}

async function buscarPorId(id, usuarioLogado) {
  const row = await buscarRowId(id);
  const medico = await medicoService.buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  validarAcesso(row, usuarioLogado, medico);
  return toResponseDTO(row);
}

async function salvar(dto, usuarioLogado) {
  const medico = await medicoService.buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  if (!medico) throw new AppError("ID do usuario nao encontrado", 404);

  const pacienteResult = await pool.query(
    "SELECT id_paciente FROM paciente WHERE id_paciente = $1",
    [dto.idPaciente]
  );
  if (!pacienteResult.rows[0]) {
    throw new AppError("ID do paciente nao encontrado", 404);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      `INSERT INTO consulta (id_medico, id_paciente, data_consulta, descricao)
       VALUES ($1, $2, now(), $3) RETURNING *`,
      [medico.id_medico, dto.idPaciente, dto.descricao]
    );
    const consulta = rows[0];

    const sintomasIds = dto.sintomasIds || [];
    if (sintomasIds.length > 0) {
      const values = sintomasIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO consulta_sintoma (consulta_id, sintoma_id) VALUES ${values}`,
        [consulta.id_consulta, ...sintomasIds]
      );
    }

    const doencaIds = await preverDoencasParaSalvar(sintomasIds);
    if (doencaIds.length > 0) {
      const values = doencaIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO consulta_doenca (consulta_id, doenca_id) VALUES ${values}`,
        [consulta.id_consulta, ...doencaIds]
      );
    }

    await client.query("COMMIT");
    return toResponseDTO(consulta);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function atualizar(idConsulta, dto, usuarioLogado) {
  const consultaAtual = await buscarRowId(idConsulta);
  const medicoLogado = await medicoService.buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  validarAcesso(consultaAtual, usuarioLogado, medicoLogado);

  if (!medicoLogado) throw new AppError("ID do medico nao encontrado", 404);

  const pacienteResult = await pool.query(
    "SELECT id_paciente FROM paciente WHERE id_paciente = $1",
    [dto.idPaciente]
  );
  if (!pacienteResult.rows[0]) {
    throw new AppError("ID do paciente nao encontrado", 404);
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    await client.query(
      `UPDATE consulta SET id_medico = $1, id_paciente = $2, descricao = $3 WHERE id_consulta = $4`,
      [medicoLogado.id_medico, dto.idPaciente, dto.descricao, idConsulta]
    );

    let sintomasIds = (await getSintomasDaConsulta(idConsulta)).map((s) => s.idSintoma);
    if (dto.sintomasIds !== undefined) {
      sintomasIds = dto.sintomasIds || [];
      await client.query("DELETE FROM consulta_sintoma WHERE consulta_id = $1", [idConsulta]);
      if (sintomasIds.length > 0) {
        const values = sintomasIds.map((_, i) => `($1, $${i + 2})`).join(", ");
        await client.query(
          `INSERT INTO consulta_sintoma (consulta_id, sintoma_id) VALUES ${values}`,
          [idConsulta, ...sintomasIds]
        );
      }
    }

    const doencaIds = await preverDoencasParaSalvar(sintomasIds);
    await client.query("DELETE FROM consulta_doenca WHERE consulta_id = $1", [idConsulta]);
    if (doencaIds.length > 0) {
      const values = doencaIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `INSERT INTO consulta_doenca (consulta_id, doenca_id) VALUES ${values}`,
        [idConsulta, ...doencaIds]
      );
    }

    await client.query("COMMIT");
    const atualizada = await buscarRowId(idConsulta);
    return toResponseDTO(atualizada);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function deletar(id, usuarioLogado) {
  const row = await buscarRowId(id);
  const medico = await medicoService.buscarRowPorUsuarioId(usuarioLogado.idUsuario);
  validarAcesso(row, usuarioLogado, medico);
  await pool.query("DELETE FROM consulta WHERE id_consulta = $1", [id]);
}

module.exports = {
  listarTodasComoAdmin,
  listarDoMedicoLogado,
  buscarPorId,
  salvar,
  atualizar,
  deletar,
};
