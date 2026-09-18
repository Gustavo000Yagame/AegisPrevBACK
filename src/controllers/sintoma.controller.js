const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const sintomaService = require("../services/sintoma.service");

function validarSintomaDTO(body) {
  const errors = {};
  if (!body.nomeSintoma || !String(body.nomeSintoma).trim()) {
    errors.nomeSintoma = " O sintoma deve conter um nome";
  }
  if (!body.descricaoSintoma || !String(body.descricaoSintoma).trim()) {
    errors.descricaoSintoma = "O sitoma deve conter uma descricao";
  }
  if (Object.keys(errors).length) throw new ValidationError(errors);

  return { nomeSintoma: body.nomeSintoma, descricaoSintoma: body.descricaoSintoma };
}

const listar = asyncHandler(async (req, res) => {
  res.json(await sintomaService.listar());
});

const buscarPorId = asyncHandler(async (req, res) => {
  res.json(await sintomaService.buscarPorId(Number(req.params.id)));
});

const cadastrar = asyncHandler(async (req, res) => {
  const dto = validarSintomaDTO(req.body || {});
  res.status(201).json(await sintomaService.cadastrar(dto));
});

const atualizar = asyncHandler(async (req, res) => {
  const dto = validarSintomaDTO(req.body || {});
  res.json(await sintomaService.atualizar(Number(req.params.id), dto));
});

const deletar = asyncHandler(async (req, res) => {
  await sintomaService.deletar(Number(req.params.id));
  res.status(200).send();
});

module.exports = { listar, buscarPorId, cadastrar, atualizar, deletar };
