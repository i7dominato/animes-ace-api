// Ponto de entrada do servidor Express
const express  = require('express');
const cors     = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Todas as rotas de auth ficam em /api/auth
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Animes Ace API rodando!' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});