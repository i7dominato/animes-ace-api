const prisma = require('../prisma');

// ── VER MINHA LISTA ────────────────────────────────────
async function verLista(req, res) {
  try {
    const lista = await prisma.userLista.findMany({
      where:   { userId: req.userId },
      include: {
        anime: {
          select: {
            id: true, titulo: true, capa: true,
            generos: true, nota: true, ano: true,
            _count: { select: { episodios: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    return res.json(lista);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── ADICIONAR À LISTA ──────────────────────────────────
async function adicionar(req, res) {
  const { animeId, status, favoritado } = req.body;

  if (!animeId) {
    return res.status(400).json({ error: 'animeId é obrigatório.' });
  }

  try {
    // Verifica se o anime existe
    const anime = await prisma.anime.findUnique({ where: { id: Number(animeId) } });
    if (!anime) {
      return res.status(404).json({ error: 'Anime não encontrado.' });
    }

    // upsert = atualiza se já existir, cria se não existir
    const item = await prisma.userLista.upsert({
      where: {
        userId_animeId: { userId: req.userId, animeId: Number(animeId) },
      },
      update: {
        status:     status     ?? 'quero_ver',
        favoritado: favoritado ?? false,
      },
      create: {
        userId:     req.userId,
        animeId:    Number(animeId),
        status:     status     ?? 'quero_ver',
        favoritado: favoritado ?? false,
      },
    });

    return res.status(201).json(item);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── ATUALIZAR STATUS ───────────────────────────────────
// Ex: mudar de "quero_ver" para "assistindo" ou "concluido"
async function atualizar(req, res) {
  const { id }               = req.params;
  const { status, favoritado } = req.body;

  try {
    // Garante que o item pertence ao usuário logado
    const item = await prisma.userLista.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado na sua lista.' });
    }

    const atualizado = await prisma.userLista.update({
      where: { id: Number(id) },
      data: {
        ...(status     !== undefined && { status }),
        ...(favoritado !== undefined && { favoritado }),
      },
    });

    return res.json(atualizado);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── REMOVER DA LISTA ───────────────────────────────────
async function remover(req, res) {
  const { id } = req.params;

  try {
    // Garante que o item pertence ao usuário logado
    const item = await prisma.userLista.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!item) {
      return res.status(404).json({ error: 'Item não encontrado na sua lista.' });
    }

    await prisma.userLista.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Anime removido da lista.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { verLista, adicionar, atualizar, remover };