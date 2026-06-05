const prisma = require('../prisma');

// ── SALVAR PROGRESSO ───────────────────────────────────
// Chamado pelo player a cada 10 segundos automaticamente
async function salvar(req, res) {
  const { episodioId, animeId, segundos, concluido } = req.body;

  if (!episodioId || !animeId) {
    return res.status(400).json({ error: 'episodioId e animeId são obrigatórios.' });
  }

  try {
    const progresso = await prisma.progresso.upsert({
      where: {
        userId_episodioId: { userId: req.userId, episodioId: Number(episodioId) },
      },
      update: {
        segundos:  Number(segundos ?? 0),
        concluido: Boolean(concluido),
      },
      create: {
        userId:     req.userId,
        episodioId: Number(episodioId),
        animeId:    Number(animeId),
        segundos:   Number(segundos ?? 0),
        concluido:  Boolean(concluido),
      },
    });

    return res.json(progresso);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── BUSCAR PROGRESSO DE UM EPISÓDIO ───────────────────
async function buscarEpisodio(req, res) {
  const { episodioId } = req.params;

  try {
    const progresso = await prisma.progresso.findUnique({
      where: {
        userId_episodioId: { userId: req.userId, episodioId: Number(episodioId) },
      },
    });

    return res.json(progresso ?? { segundos: 0, concluido: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── CONTINUAR ASSISTINDO ───────────────────────────────
// Retorna os episódios em andamento do usuário (não concluídos)
async function continuarAssistindo(req, res) {
  try {
    const progressos = await prisma.progresso.findMany({
      where: {
        userId:   req.userId,
        concluido: false,
        segundos: { gt: 5 }, // Só conta se assistiu mais de 5 segundos
      },
      orderBy: { atualizadoEm: 'desc' },
      take:    10,
      include: {
        episodio: {
          select: { id: true, numero: true, titulo: true, duracao: true },
        },
        anime: {
          select: { id: true, titulo: true, capa: true },
        },
      },
    });

    return res.json(progressos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { salvar, buscarEpisodio, continuarAssistindo };