const express = require('express')
const { requireLog } = require('../middleware/requireLog')

const {
    getEstadisticas,
    getLog,
    getFallas,
    crearAuthLog,
    crearFailedLog
} = require('../controllers/authlogController')

const router = express.Router();

// router.use(requireLog)

// Obtiene todas las metricas asociadas a el uso de nuestra pagina (fallos, inicios de sesion etc)
router.get('/estadisticas', getEstadisticas)
// Obtiene todos los inicios de sesion fallidos (ataques maliciosos)
router.get('/fallas', getFallas)
// Obtiene todos los logs para 1 usuario
router.get('/:id', getLog)
// Genera un log cuando algo falla al ser insertado a la BD
router.post('/fallas',crearFailedLog)
// Genera un log cuando alguien es autenticado en nuestro servidor
router.post('/auth', crearAuthLog)
// Genera un log cuando algo falla en ser autenticado
module.exports = router
