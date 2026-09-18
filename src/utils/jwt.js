const jwt = require("jsonwebtoken");

function getKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET não configurado. Defina a variável de ambiente JWT_SECRET (uma string em Base64)."
    );
  }
  // O segredo é armazenado em Base64 (mesmo formato usado no backend Java original)
  return Buffer.from(secret, "base64");
}

function gerarToken(usuario) {
  const expirationMs = Number(process.env.JWT_EXPIRATION || 86400000);

  return jwt.sign(
    { role: usuario.papeis },
    getKey(),
    {
      subject: usuario.email,
      algorithm: "HS256",
      expiresIn: Math.floor(expirationMs / 1000),
    }
  );
}

function verificarToken(token) {
  // Lança se inválido/expirado
  return jwt.verify(token, getKey(), { algorithms: ["HS256"] });
}

module.exports = { gerarToken, verificarToken };
