const prisma = require('../prisma');

// ── VER AVALIAÇÕES DE UM ANIME ─────────────────────────
async function listar(req, res) {
  const { animeId } = req.params;

  try {
    const avaliacoes = await prisma.avaliacao.findMany({
      where:   { animeId: Number(animeId) },
      include: { user: { select: { id: true, nome: true, avatar: true } } },
      orderBy: { criadoEm: 'desc' },
    });

    return res.json(avaliacoes);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── AVALIAR UM ANIME ───────────────────────────────────
async function avaliar(req, res) {
  const { animeId }        = req.params;
  const { nota, comentario } = req.body;

  if (!nota || nota < 1 || nota > 10) {
    return res.status(400).json({ error: 'nota deve ser um número entre 1 e 10.' });
  }

  try {
    // upsert = atualiza se já avaliou, cria se for a primeira vez
    const avaliacao = await prisma.avaliacao.upsert({
      where: {
        userId_animeId: { userId: req.userId, animeId: Number(animeId) },
      },
      update: { nota: Number(nota), comentario: comentario ?? null },
      create: {
        userId:     req.userId,
        animeId:    Number(animeId),
        nota:       Number(nota),
        comentario: comentario ?? null,
      },
    });

    // Recalcula a nota média do anime com base em todas as avaliações
    const media = await prisma.avaliacao.aggregate({
      where:   { animeId: Number(animeId) },
      _avg:    { nota: true },
    });

    // Atualiza a nota do anime
    await prisma.anime.update({
      where: { id: Number(animeId) },
      data:  { nota: media._avg.nota ?? 0 },
    });

    return res.status(201).json(avaliacao);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR AVALIAÇÃO ──────────────────────────────────
async function deletar(req, res) {
  const { id } = req.params;

  try {
    // Garante que a avaliação pertence ao usuário logado
    const avaliacao = await prisma.avaliacao.findFirst({
      where: { id: Number(id), userId: req.userId },
    });

    if (!avaliacao) {
      return res.status(404).json({ error: 'Avaliação não encontrada.' });
    }

    await prisma.avaliacao.delete({ where: { id: Number(id) } });

    // Recalcula a nota do anime após deletar
    const media = await prisma.avaliacao.aggregate({
      where: { animeId: avaliacao.animeId },
      _avg:  { nota: true },
    });

    await prisma.anime.update({
      where: { id: avaliacao.animeId },
      data:  { nota: media._avg.nota ?? 0 },
    });

    return res.json({ message: 'Avaliação removida.' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { listar, avaliar, deletar };