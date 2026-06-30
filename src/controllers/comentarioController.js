const prisma = require('../prisma');

// ── LISTAR COMENTÁRIOS DE UM EPISÓDIO ──────────────────
// Retorna só os comentários principais, com as respostas aninhadas
async function listar(req, res) {
  const { episodioId } = req.params;

  try {
    const comentarios = await prisma.comentario.findMany({
      where: { episodioId: Number(episodioId), respostaDeId: null },
      include: {
        user: { select: { id: true, nome: true, avatar: true } },
        respostas: {
          include: { user: { select: { id: true, nome: true, avatar: true } } },
          orderBy: { criadoEm: 'asc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    return res.json(comentarios);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── CRIAR COMENTÁRIO ────────────────────────────────────
async function criar(req, res) {
  const { episodioId }       = req.params;
  const { texto, respostaDeId } = req.body;

  if (!texto || !texto.trim()) {
    return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
  }

  try {
    // Se for resposta, confirma que o comentário pai existe e pertence ao mesmo episódio
    if (respostaDeId) {
      const pai = await prisma.comentario.findUnique({ where: { id: Number(respostaDeId) } });
      if (!pai || pai.episodioId !== Number(episodioId)) {
        return res.status(400).json({ error: 'Comentário pai inválido.' });
      }
    }

    const comentario = await prisma.comentario.create({
      data: {
        userId:       req.userId,
        episodioId:   Number(episodioId),
        respostaDeId: respostaDeId ? Number(respostaDeId) : null,
        texto:        texto.trim(),
      },
      include: { user: { select: { id: true, nome: true, avatar: true } } },
    });

    return res.status(201).json(comentario);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR COMENTÁRIO ──────────────────────────────────
async function deletar(req, res) {
  const { id } = req.params;

  try {
    const comentario = await prisma.comentario.findUnique({ where: { id: Number(id) } });
    if (!comentario) {
      return res.status(404).json({ error: 'Comentário não encontrado.' });
    }

    // Só o autor ou o admin pode deletar
    const isAutor = comentario.userId === req.userId;
    const isAdmin = req.userEmail === process.env.ADMIN_EMAIL;

    if (!isAutor && !isAdmin) {
      return res.status(403).json({ error: 'Você não pode deletar este comentário.' });
    }

    // Deleta as respostas primeiro (se houver) e depois o comentário
    await prisma.comentario.deleteMany({ where: { respostaDeId: Number(id) } });
    await prisma.comentario.delete({ where: { id: Number(id) } });

    return res.json({ message: 'Comentário removido.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { listar, criar, deletar };