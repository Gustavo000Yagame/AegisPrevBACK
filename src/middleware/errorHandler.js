const AppError = require("../utils/AppError");

function notFoundHandler(req, res) {
  res.status(404).json({ message: "Rota não encontrada" });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === "ValidationError" && err.errors) {
    return res.status(400).json(err.errors);
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Erro do Postgres: violação de unicidade (ex: email/cpf duplicado)
  if (err.code === "23505") {
    return res.status(409).json({ message: "Recurso já existente" });
  }

  console.error("Erro não tratado:", err);
  return res
    .status(500)
    .json({ message: "Ocorreu um erro interno. Tente novamente mais tarde." });
}

module.exports = { errorHandler, notFoundHandler };
