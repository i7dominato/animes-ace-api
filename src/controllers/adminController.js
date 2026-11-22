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

// ── VERIFICAR LINKS DO STREAMTAPE ──────────────────────
// Confere na API do Streamtape se cada vídeo cadastrado ainda existe.
// Login/key são opcionais para este endpoint; se definir STREAMTAPE_LOGIN e STREAMTAPE_KEY no Render, são enviados.
function extrairIdStreamtape(url) {
  if (!url) return null;
  const m = url.trim().match(/(?:tape|stape)[^/]*\/[ve]\/([A-Za-z0-9_-]+)/i);
  return m ? m[1] : null;
}

async function verificarLinks(req, res) {
  try {
    const episodios = await prisma.episodio.findMany({
      orderBy: [{ animeId: 'asc' }, { numero: 'asc' }],
      select: {
        id: true, numero: true, titulo: true, animeId: true, urlVideo: true, urlVideoAlt: true,
        anime: { select: { titulo: true } },
      },
    });

    // Monta a lista de (episódio, campo, id do arquivo)
    const itens = [];
    let naoVerificaveis = 0;
    for (const ep of episodios) {
      for (const campo of ['urlVideo', 'urlVideoAlt']) {
        const url = ep[campo];
        if (!url) continue;
        const fileId = extrairIdStreamtape(url);
        if (fileId) itens.push({ ep, campo, fileId });
        else naoVerificaveis++; // YouTube, Dailymotion ou link inválido
      }
    }

    // Consulta o Streamtape em lotes de até 100 IDs
    const status = {};
    const ids = [...new Set(itens.map(i => i.fileId))];
    const auth = (process.env.STREAMTAPE_LOGIN && process.env.STREAMTAPE_KEY)
      ? `&login=${encodeURIComponent(process.env.STREAMTAPE_LOGIN)}&key=${encodeURIComponent(process.env.STREAMTAPE_KEY)}`
      : '';

    for (let i = 0; i < ids.length; i += 100) {
      const lote = ids.slice(i, i + 100);
      const resp = await fetch(
        `https://api.streamtape.com/file/info?file=${lote.join(',')}${auth}`,
        { signal: AbortSignal.timeout(20000) }
      );
      const json = await resp.json();
      if (json.status !== 200) {
        return res.status(502).json({ error: `Streamtape respondeu ${json.status}: ${json.msg ?? 'erro'}` });
      }
      for (const id of lote) status[id] = json.result?.[id] ?? null;
    }

    // Separa os problemas
    const problemas = [];
    for (const { ep, campo, fileId } of itens) {
      const info = status[fileId];
      let motivo = null;
      if (!info || info.status === 404) motivo = 'Arquivo não encontrado (apagado ou link errado)';
      else if (info.status === 451) motivo = 'Indisponível por motivos legais';
      else if (info.status !== 200) motivo = `Status ${info.status}`;
      else if (info.converted === false) motivo = 'Vídeo ainda em conversão';

      if (motivo) {
        problemas.push({
          episodioId: ep.id, animeId: ep.animeId, anime: ep.anime.titulo,
          numero: ep.numero, titulo: ep.titulo,
          campo: campo === 'urlVideo' ? 'Principal' : 'Backup', motivo,
        });
      }
    }

    return res.json({
      totalEpisodios:  episodios.length,
      verificados:     itens.length,
      naoVerificaveis,
      problemas,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao verificar links.' });
  }
}

module.exports = { dashboard, listarUsers, deletarUser, deletarAnime, verificarLinks };