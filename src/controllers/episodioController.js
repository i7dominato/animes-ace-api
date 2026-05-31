const prisma = require('../prisma');

// ── LISTAR EPISÓDIOS DE UM ANIME ───────────────────────
async function listar(req, res) {
  const { animeId } = req.params;

  try {
    const episodios = await prisma.episodio.findMany({
      where:   { animeId: Number(animeId) },
      orderBy: { numero: 'asc' },
    });

    return res.json(episodios);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── BUSCAR UM EPISÓDIO ─────────────────────────────────
async function buscarUm(req, res) {
  const { id } = req.params;

  try {
    const episodio = await prisma.episodio.findUnique({
      where:   { id: Number(id) },
      include: { anime: { select: { id: true, titulo: true, capa: true } } },
    });

    if (!episodio) {
      return res.status(404).json({ error: 'Episódio não encontrado.' });
    }

    return res.json(episodio);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── ADICIONAR EPISÓDIO ─────────────────────────────────
async function criar(req, res) {
  const { animeId }                          = req.params;
  const { numero, titulo, descricao, urlVideo, duracao } = req.body;

  if (!numero || !titulo || !urlVideo) {
    return res.status(400).json({ error: 'numero, titulo e urlVideo são obrigatórios.' });
  }

  try {
    const episodio = await prisma.episodio.create({
      data: {
        animeId:  Number(animeId),
        numero:   Number(numero),
        titulo,
        descricao: descricao ?? null,
        urlVideo,
        duracao:  duracao ? Number(duracao) : null,
      },
    });

    return res.status(201).json(episodio);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR EPISÓDIO ───────────────────────────────────
async function deletar(req, res) {
  const { id } = req.params;

  try {
    await prisma.episodio.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Episódio removido com sucesso.' });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Episódio não encontrado.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { listar, buscarUm, criar, deletar };