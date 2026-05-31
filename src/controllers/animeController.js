const prisma = require('../prisma');

// ── LISTAR TODOS ───────────────────────────────────────
// Suporta filtros por gênero, ano e busca por título
async function listar(req, res) {
  const { busca, genero, ano, pagina = 1 } = req.query;
  const porPagina = 12;

  try {
    // Monta os filtros dinamicamente conforme os query params enviados
    const where = {
      ...(busca  && { titulo:  { contains: busca,        mode: 'insensitive' } }),
      ...(genero && { generos: { has: genero } }),
      ...(ano    && { ano:     { equals: Number(ano) } }),
    };

    // Busca os animes e conta o total ao mesmo tempo
    const [animes, total] = await Promise.all([
      prisma.anime.findMany({
        where,
        skip:    (pagina - 1) * porPagina,
        take:    porPagina,
        orderBy: { nota: 'desc' },
        select: {
          id: true, titulo: true, capa: true,
          generos: true, nota: true, ano: true, status: true,
          _count: { select: { episodios: true } },
        },
      }),
      prisma.anime.count({ where }),
    ]);

    return res.json({
      animes,
      total,
      paginas: Math.ceil(total / porPagina),
      paginaAtual: Number(pagina),
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── BUSCAR UM ──────────────────────────────────────────
// Retorna os detalhes completos de um anime pelo ID
async function buscarUm(req, res) {
  const { id } = req.params;

  try {
    const anime = await prisma.anime.findUnique({
      where: { id: Number(id) },
      include: {
        episodios:  { orderBy: { numero: 'asc' } },
        avaliacoes: {
          include: { user: { select: { id: true, nome: true, avatar: true } } },
          orderBy: { criadoEm: 'desc' },
          take: 10,
        },
        _count: { select: { episodios: true, avaliacoes: true } },
      },
    });

    if (!anime) {
      return res.status(404).json({ error: 'Anime não encontrado.' });
    }

    return res.json(anime);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── CRIAR ──────────────────────────────────────────────
// Adiciona um novo anime ao banco (rota de admin)
async function criar(req, res) {
  const { titulo, sinopse, capa, generos, ano, status } = req.body;

  if (!titulo || !sinopse || !ano) {
    return res.status(400).json({ error: 'titulo, sinopse e ano são obrigatórios.' });
  }

  try {
    const anime = await prisma.anime.create({
      data: {
        titulo,
        sinopse,
        capa:    capa    ?? null,
        generos: generos ?? [],
        ano:     Number(ano),
        status:  status  ?? 'em_exibicao',
      },
    });

    return res.status(201).json(anime);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── ATUALIZAR ──────────────────────────────────────────
// Edita os dados de um anime existente
async function atualizar(req, res) {
  const { id } = req.params;
  const dados   = req.body;

  try {
    const anime = await prisma.anime.update({
      where: { id: Number(id) },
      data:  dados,
    });

    return res.json(anime);

  } catch (err) {
    // Código P2025 = registro não encontrado no Prisma
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Anime não encontrado.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

// ── DELETAR ────────────────────────────────────────────
async function deletar(req, res) {
  const { id } = req.params;

  try {
    await prisma.anime.delete({ where: { id: Number(id) } });
    return res.json({ message: 'Anime removido com sucesso.' });

  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Anime não encontrado.' });
    }
    console.error(err);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
}

module.exports = { listar, buscarUm, criar, atualizar, deletar };