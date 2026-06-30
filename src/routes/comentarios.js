const express        = require('express');
const router         = express.Router({ mergeParams: true });
const authMiddleware = require('../middlewares/authMiddleware');
const { listar, criar, deletar } = require('../controllers/comentarioController');

// Pública — qualquer um vê os comentários
router.get('/', listar);

// Privadas — precisa estar logado
router.post('/',      authMiddleware, criar);
router.delete('/:id', authMiddleware, deletar);

module.exports = router;