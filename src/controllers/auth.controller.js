const asyncHandler = require("../utils/asyncHandler");
const ValidationError = require("../utils/ValidationError");
const authService = require("../services/auth.service");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const errors = {};

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = "Email inválido";
  if (!password) errors.password = "não pode estar vazio";

  if (Object.keys(errors).length) throw new ValidationError(errors);

  const result = await authService.login({ email, password });
  res.json(result);
});

module.exports = { login };
