const prisma = require('../prisma');

// ── VALIDAÇÃO DOS CAMPOS DO ANIME ──────────────────────
// Devolve { erro } se algo estiver inválido, ou { dados } com SÓ os campos permitidos.
// parcial = true (atualizar): só valida os campos que vieram no corpo.
function validarAnime(body, parcial) {
  const dados = {};

  if (body.titulo !== undefined || !parcial) {
    const v = String(body.titulo ?? '').trim();
    if (!v || v.length > 200) return { erro: 'titulo é obrigatório e deve ter até 200 caracteres.' };
    dados.titulo = v;
  }
  if (body.sinopse !== undefined || !parcial) {
    const v = String(body.sinopse ?? '').trim();
    if (!v || v.length > 5000) return { erro: 'sinopse é obrigatória e deve ter até 5000 caracteres.' };
    dados.sinopse = v;
  }
  if (body.ano !== undefined || !parcial) {
    const v = Number(body.ano);
    if (!Number.isInteger(v) || v < 1900 || v > 2100) return { erro: 'ano inválido.' };
    dados.ano = v;
  }
  if (body.capa !== undefined) {
    const v = body.capa ? String(body.capa).trim() : null;
    // Só URL externa: imagens em base64 incham o banco e deixam todas as listagens lentas
    if (v && (!/^https?:\/\//i.test(v) || v.length > 2000)) {
      return { erro: 'capa deve ser uma URL http(s) (imagens em base64 não são aceitas).' };
    }
    dados.capa = v;
  }
  if (body.generos !== undefined) {
    if (!Array.isArray(body.generos) || body.generos.length > 20 || body.generos.some(g => typeof g !== 'string' || g.length > 50)) {
      return { erro: 'generos deve ser uma lista de até 20 textos.' };
    }
    dados.generos = body.generos;
  }
  if (body.status !== undefined) {
    const permitidos = ['em_exibicao', 'finalizado', 'em_breve'];
    if (!permitidos.includes(body.status)) return { erro: `status deve ser um de: ${permitidos.join(', ')}.` };
    dados.status = body.status;
  }
  return { dados };
}

// ── LISTAR TODOS ───────────────────────────────────────
// Suporta filtros por gênero, ano e busca por título
async function listar(req, res) {
  const { busca, genero, ano, notaMin, ordenar, pagina = 1 } = req.query;
  const porPagina = 12;

  try {
    const where = {
      ...(busca   && { titulo:  { contains: busca,        mode: 'insensitive' } }),
      ...(genero  && { generos: { has: genero } }),
      ...(ano     && { ano:     { equals: Number(ano) } }),
      ...(notaMin && { nota:    { gte: Number(notaMin) } }),
    };

    // Define a ordenação com base no parâmetro recebido
    const ordenacoes = {
      nota:      { nota: 'desc' },
      recentes:  { id: 'desc' },       // mais recém-cadastrados primeiro
      alfabetico:{ titulo: 'asc' },
      ano:       { ano: 'desc' },
    };
    const orderBy = ordenacoes[ordenar] ?? ordenacoes.nota;

    const [animes, total] = await Promise.all([
      prisma.anime.findMany({
        where,
        skip:    (pagina - 1) * porPagina,
        take:    porPagina,
        orderBy,
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
  const { erro, dados } = validarAnime(req.body, false);
  if (erro) return res.status(400).json({ error: erro });

  try {
    const anime = await prisma.anime.create({
      data: {
        titulo:  dados.titulo,
        sinopse: dados.sinopse,
        capa:    dados.capa    ?? null,
        generos: dados.generos ?? [],
        ano:     dados.ano,
        status:  dados.status  ?? 'em_exibicao',
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

  // Só os campos permitidos passam (nada de mexer em id, nota, etc. pelo corpo da requisição)
  const { erro, dados } = validarAnime(req.body, true);
  if (erro) return res.status(400).json({ error: erro });

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