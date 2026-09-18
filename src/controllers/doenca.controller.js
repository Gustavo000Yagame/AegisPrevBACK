const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const doencaService = require("../services/doenca.service");

function validarDoencaDTO(body) {
  const errors = {};
  if (!body.nomeDoenca || !String(body.nomeDoenca).trim()) {
    errors.nomeDoenca = "O nome nao pode estar vazio";
  }
  if (!body.descricaoDoenca || !String(body.descricaoDoenca).trim()) {
    errors.descricaoDoenca = "A descrição nao pode estar vazio";
  }
  if (body.hereditaria === undefined || body.hereditaria === null) {
    errors.hereditaria = "Deve ser true ou false";
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);

  return {
    nomeDoenca: body.nomeDoenca,
    descricaoDoenca: body.descricaoDoenca,
    hereditaria: Boolean(body.hereditaria),
    idSintomas: body.idSintomas,
  };
}

const listar = asyncHandler(async (req, res) => {
  res.json(await doencaService.listar(req.query.nomeDoenca, req.query.isHereditaria));
});

const pegarId = asyncHandler(async (req, res) => {
  res.json(await doencaService.pegarPorId(Number(req.params.id)));
});

const salvar = asyncHandler(async (req, res) => {
  const dto = validarDoencaDTO(req.body || {});
  res.status(201).json(await doencaService.salvar(dto));
});

const atualizar = asyncHandler(async (req, res) => {
  const dto = validarDoencaDTO(req.body || {});
  res.json(await doencaService.atualizar(Number(req.params.id), dto));
});

const deletar = asyncHandler(async (req, res) => {
  await doencaService.deletar(Number(req.params.id));
  res.status(200).send();
});

module.exports = { listar, pegarId, salvar, atualizar, deletar };
