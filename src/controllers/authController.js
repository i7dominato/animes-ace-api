const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const prisma  = require('../prisma');

// ── REGISTRO ──────────────────────────────────────────
// Recebe nome, email e senha → salva o usuário no banco
async function register(req, res) {
  const { nome, email, senha } = req.body;

  try {
    // Verifica se o email já está cadastrado
    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    // Criptografa a senha (nunca salvar senha pura no banco!)
    // O número 10 é o "custo" da criptografia — quanto maior, mais seguro e mais lento
    const senhaHash = await bcrypt.hash(senha, 10);

    // Salva o usuário no banco
    const user = await prisma.user.create({
      data: { nome, email, senha: senhaHash },
    });

    // Gera o token JWT — válido por 7 dias
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Retorna os dados do usuário (sem a senha) e o token
    return res.status(201).json({
      user:  { id: user.id, nome: user.nome, email: user.email },
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── LOGIN ──────────────────────────────────────────────
// Recebe email e senha → valida e retorna o token
async function login(req, res) {
  const { email, senha } = req.body;

  try {
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    // Compara a senha enviada com o hash salvo no banco
    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    // Gera o token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      user:  { id: user.id, nome: user.nome, email: user.email },
      token,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── ME ────────────────────────────────────────────────
// Retorna os dados do usuário logado (rota protegida)
async function me(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where:  { id: req.userId },
      select: { id: true, nome: true, email: true, avatar: true, criadoEm: true },
    });

    // Informa ao frontend se o usuário logado é admin
    return res.json({
      ...user,
      isAdmin: user.email === process.env.ADMIN_EMAIL,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}
module.exports = { register, login, me };