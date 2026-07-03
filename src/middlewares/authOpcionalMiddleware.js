const jwt = require('jsonwebtoken');

// Middleware que tenta autenticar mas NÃO bloqueia se não tiver token
// Usado em rotas públicas que precisam saber se o usuário está logado
function authOpcionalMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token      = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.userId = undefined;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId    = payload.id;
    req.userEmail = payload.email;
  } catch (err) {
    req.userId = undefined;
  }
  next();
}

module.exports = authOpcionalMiddleware;