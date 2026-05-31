// Ponto de entrada do servidor Express
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(cors());            // Permite requisições do frontend
app.use(express.json());    // Lê o corpo das requisições em JSON

// Rota de teste — confirma que o servidor está vivo
app.get('/', (req, res) => {
  res.json({ message: 'Animes Ace API rodando!' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});