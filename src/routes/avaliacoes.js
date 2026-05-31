const express  = require('express');
const router   = express.Router({ mergeParams: true });
const { listar, avaliar, deletar } = require('../controllers/avaliacaoController');
const authMiddleware = require('../middlewares/authMiddleware');

// Pública — qualquer um vê as avaliações
router.get('/', listar);

// Privadas — precisa estar logado
router.post('/',      authMiddleware, avaliar);
router.delete('/:id', authMiddleware, deletar);

module.exports = router;