const express      = require('express');
const cors         = require('cors');
if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const adminRoutes = require('./routes/admin');
const authRoutes      = require('./routes/auth');
const animeRoutes     = require('./routes/animes');
const episodioRoutes  = require('./routes/episodios');
const listaRoutes     = require('./routes/lista');
const avaliacaoRoutes = require('./routes/avaliacoes');
const progressoRoutes = require('./routes/progresso');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: [
    'http://localhost:5173',                    // desenvolvimento local
    'https://animes-ace-web.vercel.app',        // produção — troque pela URL real do Vercel
  ],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth',                         authRoutes);
app.use('/api/animes',                       animeRoutes);
app.use('/api/animes/:animeId/episodios',    episodioRoutes);
app.use('/api/animes/:animeId/avaliacoes',   avaliacaoRoutes);
app.use('/api/users/lista',                  listaRoutes);
app.use('/api/admin',                        adminRoutes);
app.use('/api/progresso', progressoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Animes Ace API rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
echo "" >> src/app.js