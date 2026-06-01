const prisma = require('../prisma');

// ── DASHBOARD ─────────────────────────────────────────
// Retorna estatísticas gerais do site
async function dashboard(req, res) {
  try {
    const [totalAnimes, totalEpisodios, totalUsers, totalAvaliacoes] = await Promise.all([
      prisma.anime.count(),
      prisma.episodio.count(),
      prisma.user.count(),
      prisma.avaliacao.count(),
    ]);

    // Últimos 5 usuários cadastrados
    const ultimosUsers = await prisma.user.findMany({
      orderBy: { criadoEm: 'desc' },
      take:    5,
      select:  { id: true, nome: true, email: true, criadoEm: true },
    });

    return res.json({ totalAnimes, totalEpisodios, totalUsers, totalAvaliacoes, ultimosUsers });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── LISTAR USUÁRIOS ────────────────────────────────────
async function listarUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { criadoEm: 'desc' },
      select: {
        id: true, nome: true, email: true, criadoEm: true,
        _count: { select: { lista: true, avaliacoes: true } },
      },
    });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR USUÁRIO ────────────────────────────────────
async function deletarUser(req, res) {
  const { id } = req.params;

  // Impede que o admin delete a própria conta
  if (Number(id) === req.userId) {
    return res.status(400).json({ error: 'Você não pode deletar sua própria conta.' });
  }

  try {
    // Deleta na ordem certa para não violar foreign keys
    await prisma.avaliacao.deleteMany({ where: { userId: Number(id) } });
    await prisma.userLista.deleteMany({ where: { userId: Number(id) } });
    await prisma.user.delete({ where: { id: Number(id) } });

    return res.json({ message: 'Usuário removido com sucesso.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR ANIME (com tudo que depende dele) ──────────
async function deletarAnime(req, res) {
  const { id } = req.params;

  try {
    // Deleta dependências antes do anime
    await prisma.avaliacao.deleteMany({ where: { animeId: Number(id) } });
    await prisma.userLista.deleteMany({ where: { animeId: Number(id) } });
    await prisma.episodio.deleteMany({  where: { animeId: Number(id) } });
    await prisma.anime.delete({         where: { id:      Number(id) } });

    return res.json({ message: 'Anime removido com sucesso.' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Anime não encontrado.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { dashboard, listarUsers, deletarUser, deletarAnime };