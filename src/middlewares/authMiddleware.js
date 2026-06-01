const jwt = require('jsonwebtoken');

// Esse middleware protege rotas privadas
// Ele roda ANTES do controller e verifica se o token é válido
function authMiddleware(req, res, next) {
  // O token vem no header assim: "Authorization: Bearer SEU_TOKEN"
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    // Verifica e decodifica o token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Adiciona o id do usuário na requisição para usar nos controllers
    req.userId = payload.id;
    req.userEmail = payload.email;
    // Passa para o próximo passo (o controller)
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
}

module.exports = authMiddleware;