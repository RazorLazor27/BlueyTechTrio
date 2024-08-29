const express = require('express')

// Funciones del controlador
const { signupUsuario, loginUsuario } = require('../controllers/usuarioController')

const router = express.Router()

// Ruta para el login
router.post('/login', loginUsuario)

// Ruta para el sign up

router.post('/signup', signupUsuario)



module.exports = router