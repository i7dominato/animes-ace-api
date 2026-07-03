const express      = require('express');
const cors         = require('cors');
const { execSync } = require('child_process');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

// Roda migrations automaticamente ao iniciar o servidor
try {
  console.log('Rodando migrations...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('Migrations concluídas!');
} catch (err) {
  console.error('Erro nas migrations:', err.message);
}

const authRoutes      = require('./routes/auth');
const animeRoutes     = require('./routes/animes');
const episodioRoutes  = require('./routes/episodios');
const listaRoutes     = require('./routes/lista');
const avaliacaoRoutes = require('./routes/avaliacoes');
const adminRoutes     = require('./routes/admin');
const perfilRoutes = require('./routes/perfil');
const progressoRoutes = require('./routes/progresso');
const comentarioRoutes = require('./routes/comentarios');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://animes-ace-web.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',                         authRoutes);
app.use('/api/animes',                       animeRoutes);
app.use('/api/animes/:animeId/episodios',    episodioRoutes);
app.use('/api/episodios/:episodioId/comentarios', comentarioRoutes);
app.use('/api/animes/:animeId/avaliacoes',   avaliacaoRoutes);
app.use('/api/users/lista',                  listaRoutes);
app.use('/api/admin',                        adminRoutes);
app.use('/api/users', perfilRoutes);
app.use('/api/progresso',                    progressoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Animes Ace API rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// v1.7.4