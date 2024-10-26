const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthLogs = new Schema ({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },
    userId: String,
    email: String,
    ipAddress: String,
    userAgent: String,
    estado: {  // antes 'status'
        type: String,
        enum: ['exitoso', 'fallido'],  // antes 'success', 'failed'
        required: true
    },
    razonFallo: {  // antes 'failureReason'
        type: String,
        enum: ['credenciales_invalidas', 'cuenta_bloqueada', '2fa_invalido', 'contraseña_expirada', 'otro']
    },
    origen: {
        type: String, // Para rastrear qué parte de la aplicación generó el registro
        required: true
    }
});

module.exports = mongoose.model('AuthLog', AuthLogs, 'AuthLogs')