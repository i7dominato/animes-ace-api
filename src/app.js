const express      = require('express');
const cors         = require('cors');
require('dotenv').config();

const authRoutes      = require('./routes/auth');
const animeRoutes     = require('./routes/animes');
const episodioRoutes  = require('./routes/episodios');
const listaRoutes     = require('./routes/lista');
const avaliacaoRoutes = require('./routes/avaliacoes');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth',                         authRoutes);
app.use('/api/animes',                       animeRoutes);
app.use('/api/animes/:animeId/episodios',    episodioRoutes);
app.use('/api/animes/:animeId/avaliacoes',   avaliacaoRoutes);
app.use('/api/users/lista',                  listaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Animes Ace API rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});