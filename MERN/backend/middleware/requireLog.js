const AuthLog = require('../models/AuthLogsModel')

// Middleware para registrar intentos de autenticación
const requireLog = async (req, res, next) => {
    // Almacenar la función send original
    const envioOriginal = res.send;

    res.send = function (datos) {
    // Analizar los datos de respuesta
        let datosRespuesta;
        try {
            datosRespuesta = JSON.parse(datos);
        } catch (e) {
            datosRespuesta = datos;
        }

        // Crear entrada de registro
        const entradaRegistro = new AuthLog({
            userId: req.user?.id, // Si el usuario está autenticado
            username: req.body.email || req.body.username,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            estado: datosRespuesta.exito ? 'exitoso' : 'fallido',
            razonFallo: datosRespuesta.exito ? undefined : 'credenciales_invalidas',
            origen: req.originalUrl
        });

        // Guardar registro de forma asíncrona - no esperar
        entradaRegistro.save().catch(err => console.error('Error al guardar registro de auth:', err));

        // Llamar a la función send original
        envioOriginal.call(this, datos);
        };  

  next();
};

module.exports = requireLog
