const prisma = require('../prisma');

// ── PERFIL PÚBLICO DE UM USUÁRIO ───────────────────────
async function perfilPublico(req, res) {
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where:  { id: Number(id) },
      select: { id: true, nome: true, avatar: true, criadoEm: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const lista = await prisma.userLista.findMany({
      where:   { userId: Number(id) },
      include: {
        anime: {
          select: {
            id: true, titulo: true, capa: true, generos: true,
            nota: true, ano: true, _count: { select: { episodios: true } },
          },
        },
      },
      orderBy: { id: 'desc' },
    });

    const avaliacoes = await prisma.avaliacao.findMany({
      where:   { userId: Number(id) },
      include: { anime: { select: { id: true, titulo: true, capa: true } } },
      orderBy: { criadoEm: 'desc' },
      take:    20,
    });

    return res.json({
      user,
      lista,
      avaliacoes,
      stats: {
        totalNaLista:  lista.length,
        concluidos:    lista.filter(i => i.status === 'concluido').length,
        favoritos:     lista.filter(i => i.favoritado).length,
        totalAvaliacoes: avaliacoes.length,
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { perfilPublico };