const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const AppError = require("../utils/AppError");
const { gerarToken } = require("../utils/jwt");

async function login({ email, password }) {
  const { rows } = await pool.query(
    "SELECT * FROM usuario WHERE email = $1",
    [email]
  );
  const usuario = rows[0];

  // Mensagem genérica de propósito: não revelar se foi o email ou a senha
  // que estava errada.
  if (!usuario) {
    throw new AppError("Email ou senha inválidos.", 401);
  }

  const senhaCorreta = await bcrypt.compare(password, usuario.password);

  if (!senhaCorreta) {
    throw new AppError("Email ou senha inválidos.", 401);
  }

  const token = gerarToken({ email: usuario.email, papeis: usuario.papeis });

  return { token };
}

module.exports = { login };
