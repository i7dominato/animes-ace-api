const express            = require('express');
const router             = express.Router({ mergeParams: true });
const authMiddleware     = require('../middlewares/authMiddleware');
const authOpcional       = require('../middlewares/authOpcionalMiddleware');
const { listar, criar, deletar, toggleLike } = require('../controllers/comentarioController');

router.get('/',                    authOpcional,   listar);
router.post('/',                   authMiddleware, criar);
router.delete('/:id',              authMiddleware, deletar);
router.post('/:comentarioId/like', authMiddleware, toggleLike);
module.exports = router;