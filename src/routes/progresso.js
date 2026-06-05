const express     = require('express');
const router      = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { salvar, buscarEpisodio, continuarAssistindo } = require('../controllers/progressoController');

// Todas as rotas de progresso são privadas
router.use(authMiddleware);

router.post('/',                    salvar);
router.get('/continuar',            continuarAssistindo);
router.get('/episodio/:episodioId', buscarEpisodio);

module.exports = router;