const express    = require('express');
const router     = express.Router({ mergeParams: true }); // mergeParams permite acessar :animeId da rota pai
const { listar, buscarUm, criar, deletar, atualizar } = require('../controllers/episodioController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/',    listar);
router.get('/:id', buscarUm);

// Rotas protegidas
router.post('/',      authMiddleware, criar);
router.delete('/:id', authMiddleware, deletar);
router.put('/:id',    authMiddleware, atualizar); // ← NOVO

module.exports = router;