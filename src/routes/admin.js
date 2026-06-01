const express        = require('express');
const router         = express.Router();
const authMiddleware  = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');
const { dashboard, listarUsers, deletarUser, deletarAnime } = require('../controllers/adminController');

// Todas as rotas de admin exigem login E ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/dashboard',      dashboard);
router.get('/users',          listarUsers);
router.delete('/users/:id',   deletarUser);
router.delete('/animes/:id',  deletarAnime);

module.exports = router;