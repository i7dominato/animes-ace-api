const express  = require('express');
const router   = express.Router();
const { verLista, adicionar, atualizar, remover } = require('../controllers/listaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas da lista são privadas — exigem login
router.use(authMiddleware);

router.get('/',       verLista);
router.post('/',      adicionar);
router.put('/:id',    atualizar);
router.delete('/:id', remover);

module.exports = router;