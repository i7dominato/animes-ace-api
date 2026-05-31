const express    = require('express');
const router     = express.Router();
const { listar, buscarUm, criar, atualizar, deletar } = require('../controllers/animeController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rotas públicas
router.get('/',    listar);
router.get('/:id', buscarUm);

// Rotas protegidas — só com token
router.post('/',    authMiddleware, criar);
router.put('/:id',  authMiddleware, atualizar);
router.delete('/:id', authMiddleware, deletar);

module.exports = router;