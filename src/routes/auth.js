const express    = require('express');
const router     = express.Router();
const { register, login, me } = require('../controllers/authController');
const authMiddleware           = require('../middlewares/authMiddleware');

// Rotas públicas — qualquer um pode acessar
router.post('/register', register);
router.post('/login',    login);

// Rota privada — só acessa com token válido
router.get('/me', authMiddleware, me);

module.exports = router;