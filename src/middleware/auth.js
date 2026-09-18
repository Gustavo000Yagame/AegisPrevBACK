const { verificarToken } = require("../utils/jwt");
const { pool } = require("../db");

// Equivalente ao JwtFilter do backend Java: se vier um Bearer token válido,
// popula req.user; caso contrário, segue sem autenticar (as rotas decidem
// se exigem ou não autenticação).
async function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.substring(7);

  try {
    const payload = verificarToken(token);
    const email = payload.sub;

    const { rows } = await pool.query(
      "SELECT id_usuario, email, papeis FROM usuario WHERE email = $1",
      [email]
    );
    const usuario = rows[0];

    if (usuario) {
      req.user = {
        idUsuario: usuario.id_usuario,
        email: usuario.email,
        papeis: usuario.papeis,
      };
    }
  } catch (err) {
    // token inválido ou expirado: apenas ignora, segue sem req.user
  }

  next();
}

function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: "Não autenticado" });
  }
  next();
}

// Uso: requireRole("ROLE_ADMIN") ou requireRole("ROLE_ADMIN", "ROLE_MEDICO")
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    if (!roles.includes(req.user.papeis)) {
      return res.status(403).json({ message: "Acesso negado" });
    }
    next();
  };
}

module.exports = { authMiddleware, requireAuth, requireRole };
