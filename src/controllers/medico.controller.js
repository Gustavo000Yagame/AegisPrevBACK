const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const medicoService = require("../services/medico.service");

function validarMedicoDTO(body, { senhaObrigatoria } = { senhaObrigatoria: true }) {
  const errors = {};
  if (!body.nome || !String(body.nome).trim()) errors.nome = "O nome do medico nao pode ser vazio";
  if (!body.sexo || !String(body.sexo).trim()) errors.sexo = "Nao pode ser vazio";

  const idade = Number(body.idade);
  if (body.idade === undefined || body.idade === null || Number.isNaN(idade)) {
    errors.idade = "nao pode ser nula";
  } else if (idade < 18 || idade > 120) {
    errors.idade = idade < 18 ? "deve ser no minimo 18" : "deve ser no maximo 120";
  }

  if (senhaObrigatoria) {
    if (!body.email || !String(body.email).trim()) errors.email = "Email nao pode estar vazio";
    if (!body.password || !String(body.password).trim()) errors.password = "Senha nao pode estar vazio";
  }

  if (Object.keys(errors).length) throw new ValidationError(errors);

  return {
    nome: body.nome,
    sexo: body.sexo,
    idade,
    email: body.email,
    password: body.password,
  };
}

const listar = asyncHandler(async (req, res) => {
  const resultado = await medicoService.listar(req.query.nome);
  res.json(resultado);
});

const buscarPorEmail = asyncHandler(async (req, res) => {
  const resultado = await medicoService.buscarPorEmail(req.query.email);
  res.json(resultado);
});

const buscarPorId = asyncHandler(async (req, res) => {
  const resultado = await medicoService.buscarPorId(Number(req.params.idMedico), req.user);
  res.json(resultado);
});

const me = asyncHandler(async (req, res) => {
  const resultado = await medicoService.buscarLogado(req.user);
  res.json(resultado);
});

const criar = asyncHandler(async (req, res) => {
  const dto = validarMedicoDTO(req.body || {});
  const resultado = await medicoService.salvar(dto);
  res.status(201).json(resultado);
});

const atualizar = asyncHandler(async (req, res) => {
  const dto = validarMedicoDTO(req.body || {}, { senhaObrigatoria: false });
  const resultado = await medicoService.atualizar(Number(req.params.idMedico), dto, req.user);
  res.json(resultado);
});

const deletar = asyncHandler(async (req, res) => {
  await medicoService.deletar(Number(req.params.idMedico));
  res.status(200).send();
});

module.exports = { listar, buscarPorEmail, buscarPorId, me, criar, atualizar, deletar };
