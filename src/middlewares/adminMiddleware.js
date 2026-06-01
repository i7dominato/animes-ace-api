// Verifica se o usuário logado é o admin definido no .env
// Deve ser usado DEPOIS do authMiddleware
function adminMiddleware(req, res, next) {
  if (req.userEmail !== process.env.ADMIN_EMAIL) {
    return res.status(403).json({ error: 'Acesso negado. Rota exclusiva para admin.' });
  }
  next();
}

module.exports = adminMiddleware;