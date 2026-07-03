const express = require('express');
const router  = express.Router();
const { perfilPublico } = require('../controllers/perfilController');

// Rota pública — qualquer um pode ver o perfil de outro usuário
router.get('/:id/publico', perfilPublico);

module.exports = router;