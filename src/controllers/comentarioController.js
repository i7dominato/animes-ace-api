const prisma = require('../prisma');

// ── LISTAR COMENTÁRIOS DE UM EPISÓDIO ──────────────────
// Retorna só os comentários principais, com as respostas aninhadas
async function listar(req, res) {
  const { episodioId } = req.params;
  const userId = req.userId; // pode ser undefined se não estiver logado (rota pública)

  try {
    const comentarios = await prisma.comentario.findMany({
      where: { episodioId: Number(episodioId), respostaDeId: null },
      include: {
        user: { select: { id: true, nome: true, avatar: true } },
        _count: { select: { likes: true } },
        likes: userId ? { where: { userId } } : false,
        respostas: {
          include: {
            user: { select: { id: true, nome: true, avatar: true } },
            _count: { select: { likes: true } },
            likes: userId ? { where: { userId } } : false,
          },
          orderBy: { criadoEm: 'asc' },
        },
      },
      orderBy: { criadoEm: 'desc' },
    });

    // Formata a resposta pra já vir com curtidoPorMim pronto
    function formatar(c) {
      return {
        ...c,
        totalLikes:    c._count.likes,
        curtidoPorMim: userId ? c.likes.length > 0 : false,
        likes:         undefined,
        _count:        undefined,
        respostas:     c.respostas ? c.respostas.map(formatar) : undefined,
      };
    }

    return res.json(comentarios.map(formatar));
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

// ── TOGGLE DE LIKE ──────────────────────────────────────
async function toggleLike(req, res) {
  const { comentarioId } = req.params;

  try {
    const likeExistente = await prisma.likeComentario.findUnique({
      where: { userId_comentarioId: { userId: req.userId, comentarioId: Number(comentarioId) } },
    });

    if (likeExistente) {
      // Já curtiu — remove o like
      await prisma.likeComentario.delete({ where: { id: likeExistente.id } });
      const total = await prisma.likeComentario.count({ where: { comentarioId: Number(comentarioId) } });
      return res.json({ curtido: false, totalLikes: total });
    } else {
      // Ainda não curtiu — adiciona o like
      await prisma.likeComentario.create({
        data: { userId: req.userId, comentarioId: Number(comentarioId) },
      });
      const total = await prisma.likeComentario.count({ where: { comentarioId: Number(comentarioId) } });
      return res.json({ curtido: true, totalLikes: total });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { listar, criar, deletar, toggleLike }