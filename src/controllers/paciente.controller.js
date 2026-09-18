const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const pacienteService = require("../services/paciente.service");
const { isValidCpf } = require("../utils/cpf");

function validarPacienteDTO(body) {
  const errors = {};
  if (!body.nomePaciente || !String(body.nomePaciente).trim()) {
    errors.nomePaciente = "O paciente deve conter um nome";
  }
  if (!body.cpfPaciente || !String(body.cpfPaciente).trim()) {
    errors.cpfPaciente = "CPF nao pode estar vazio";
  } else if (!isValidCpf(body.cpfPaciente)) {
    errors.cpfPaciente = "O CPF informado é inválido";
  }

  if (Object.keys(errors).length) throw new ValidationError(errors);

  return {
    nomePaciente: body.nomePaciente,
    cpfPaciente: body.cpfPaciente,
    dataNascimento: body.dataNascimento || null,
  };
}

const listar = asyncHandler(async (req, res) => {
  const resultado = await pacienteService.listar(req.query.nomePaciente, req.query.cpfPaciente);
  res.json(resultado);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const resultado = await pacienteService.buscarPorId(Number(req.params.idPaciente));
  res.json(resultado);
});

const cadastrarPaciente = asyncHandler(async (req, res) => {
  const dto = validarPacienteDTO(req.body || {});
  const resultado = await pacienteService.cadastrarPaciente(dto);
  res.status(201).json(resultado);
});

const atualizarPaciente = asyncHandler(async (req, res) => {
  const dto = validarPacienteDTO(req.body || {});
  const resultado = await pacienteService.atualizarPaciente(Number(req.params.idPaciente), dto);
  res.json(resultado);
});

const deletarPaciente = asyncHandler(async (req, res) => {
  await pacienteService.deletar(Number(req.params.idPaciente));
  res.status(200).send();
});

module.exports = { listar, buscarPorId, cadastrarPaciente, atualizarPaciente, deletarPaciente };
