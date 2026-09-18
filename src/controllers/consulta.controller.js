const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const consultaService = require("../services/consulta.service");

function validarConsultaDTO(body) {
  const errors = {};
  if (body.idPaciente === undefined || body.idPaciente === null) {
    errors.idPaciente = "O id paciente nao pode estar vazio";
  }
  if (!body.descricao || !String(body.descricao).trim()) {
    errors.descricao = "Não pode estar vazio";
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);

  return {
    idPaciente: Number(body.idPaciente),
    descricao: body.descricao,
    sintomasIds: Array.isArray(body.sintomasIds) ? body.sintomasIds.map(Number) : body.sintomasIds,
  };
}

const listarAdmin = asyncHandler(async (req, res) => {
  res.json(await consultaService.listarTodasComoAdmin());
});

const listarMedico = asyncHandler(async (req, res) => {
  res.json(await consultaService.listarDoMedicoLogado(req.user));
});

const pegarId = asyncHandler(async (req, res) => {
  res.json(await consultaService.buscarPorId(Number(req.params.id), req.user));
});

const cadastrar = asyncHandler(async (req, res) => {
  const dto = validarConsultaDTO(req.body || {});
  res.status(201).json(await consultaService.salvar(dto, req.user));
});

const atualizar = asyncHandler(async (req, res) => {
  const dto = validarConsultaDTO(req.body || {});
  res.json(await consultaService.atualizar(Number(req.params.id), dto, req.user));
});

const deletar = asyncHandler(async (req, res) => {
  await consultaService.deletar(Number(req.params.id), req.user);
  res.status(200).send();
});

module.exports = { listarAdmin, listarMedico, pegarId, cadastrar, atualizar, deletar };
