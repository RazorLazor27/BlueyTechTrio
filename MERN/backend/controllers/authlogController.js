const AuthLog = require('../models/AuthLogsModel')
const Usuario = require('../models/UsuarioModel')
const mongoose = require('mongoose')

// Estas son funciones para validar parametros de entrada 

const validatePaginationParams = (page, limit) => {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    
    if (isNaN(parsedPage) || parsedPage < 1) {
        throw new Error('Página inválida');
    }
    if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        throw new Error('Límite de resultados inválido');
    }
    
    return { parsedPage, parsedLimit };
};

const validateDateParams = (startDate, endDate) => {
    const dateFilters = {};
    
    if (startDate) {
        const parsedStartDate = new Date(startDate);
        if (isNaN(parsedStartDate.getTime())) {
            throw new Error('Fecha de inicio inválida');
        }
        dateFilters.$gte = parsedStartDate;
    }
    
    if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
            throw new Error('Fecha de fin inválida');
        }
        dateFilters.$lte = parsedEndDate;
    }
    
    return dateFilters;
};

const validateEstado = (estado) => {
    const estadosValidos = ['exitoso', 'fallido'];
    if (estado && !estadosValidos.includes(estado)) {
        throw new Error('Estado inválido');
    }
    return estado;
};

// Esta funcion nos da un indicio general de los intentos de uso de nuestro sistema
const getEstadisticas = async (req, res) => {
    try {
        const estadisticas = await AuthLog.aggregate([
            {
                $match: {
                    timestamp: {
                        $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                        }
                    }   
            },

            {
                $group: {
                    _id: {
                        estado: "$estado",
                        hora: { $hour: "$timestamp" }
                        },
                    cantidad: { $sum: 1 }
                }
            },

            {
                $sort: { "_id.hora": 1 }
            }
        ]);

        res.json({ exito: true, datos: estadisticas });

    } catch (error) {
            res.status(500).json({ exito: false, error: error.message });
    }
}
// Nos muestra un indicio general de todas los intentos de inicio de sesion fallidos
// Podría a ayudar a detectar ataques maliciosos
const getFallas = async(req, res) => {
    try {
        const intentosFallidos = await AuthLog.find({
            estado: 'fallido',
            timestamp: {
                $gte: new Date(Date.now() - 60 * 60 * 1000) // Última hora
            }
        })
        .sort({ timestamp: -1 })
        .limit(100);
        
        res.json({ exito: true, datos: intentosFallidos });
    } catch (error) {
        res.status(500).json({ exito: false, error: error.message });
    }
}
// Todas los logs asociados a 1 ID
const getLog = async(req, res) => {
    try {
        const { id } = req.params;
        const { 
            page = 1, 
            limit = 10, 
            startDate, 
            endDate, 
            estado 
        } = req.query;

        // Validar ID de usuario
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                exito: false,
                error: 'ID de usuario inválido'
            });
        }

        // Validar parámetros de paginación
        const { parsedPage, parsedLimit } = validatePaginationParams(page, limit);

        // Buscar usuario de forma segura
        const usuario = await Usuario.findOne({ _id: mongoose.Types.ObjectId(id) });
        
        if (!usuario) {
            return res.status(404).json({
                exito: false,
                error: 'Usuario no encontrado'
            });
        }

        // Construir filtros seguros
        const filtros = {
            userId: mongoose.Types.ObjectId(id)
        };

        // Validar y agregar filtro de estado
        const estadoValidado = validateEstado(estado);
        if (estadoValidado) {
            filtros.estado = estadoValidado;
        }

        // Validar y agregar filtros de fecha
        const dateFilters = validateDateParams(startDate, endDate);
        if (Object.keys(dateFilters).length > 0) {
            filtros.timestamp = dateFilters;
        }

        // Calcular skip para paginación
        const skip = (parsedPage - 1) * parsedLimit;

        // Consultas seguras usando los filtros validados
        const logs = await AuthLog.find(filtros)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(parsedLimit)
            .lean();

        const total = await AuthLog.countDocuments(filtros);

        // Agregación segura usando los mismos filtros validados
        const metricas = await AuthLog.aggregate([
            { 
                $match: filtros 
            },
            { 
                $group: {
                    _id: null,
                    exitosos: {
                        $sum: { 
                            $cond: [
                                { $eq: ["$estado", "exitoso"] }, 
                                1, 
                                0
                            ] 
                        }
                    },
                    fallidos: {
                        $sum: { 
                            $cond: [
                                { $eq: ["$estado", "fallido"] }, 
                                1, 
                                0
                            ] 
                        }
                    },
                    ipsUnicas: { $addToSet: "$ipAddress" },
                    ultimoIntento: { $max: "$timestamp" },
                    intentosUltimas24h: {
                        $sum: { 
                            $cond: [
                                { 
                                    $gte: [
                                        "$timestamp", 
                                        new Date(Date.now() - 24 * 60 * 60 * 1000)
                                    ] 
                                }, 
                                1, 
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Preparar respuesta sanitizada
        const respuesta = {
            exito: true,
            datos: {
                usuario: {
                    _id: usuario._id,
                    rut_doctor: usuario.rut_doctor,
                    nombre: usuario.nombre,
                    apellido: usuario.apellido,
                    email: usuario.email,
                    specialization: usuario.specialization
                },
                logs,
                paginacion: {
                    total,
                    paginaActual: parsedPage,
                    totalPaginas: Math.ceil(total / parsedLimit),
                    resultadosPorPagina: parsedLimit
                },
                metricas: metricas[0] || {
                    exitosos: 0,
                    fallidos: 0,
                    ipsUnicas: [],
                    ultimoIntento: null,
                    intentosUltimas24h: 0
                }
            }
        };

        res.json(respuesta);

    } catch (error) {
        res.status(400).json({ 
            exito: false, 
            error: error.message 
        });
    }
};
// Adjuntar contraseña no hasheada..?
// credenciales invalidas
const crearFailedLog = async (req, res) => {
    try {
        const {
            email,
            razonFallo = 'credenciales_invalidas'
        } = req.body;

        // Verificar si hay múltiples intentos fallidos recientes desde la misma IP
        const intentosRecientes = await AuthLog.countDocuments({
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            estado: 'fallido',
            timestamp: {
                $gte: new Date(Date.now() - 15 * 60 * 1000) // Últimos 15 minutos
            }
        });

        const nuevoLog = new AuthLog({
            email,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            estado: 'fallido',
            razonFallo,
            origen: req.originalUrl,
            metadata: {
                intentosPrevios: intentosRecientes
            }
        });

        await nuevoLog.save();

        // Si hay demasiados intentos fallidos, podrías implementar alguna lógica de bloqueo
        const respuesta = {
            exito: false,
            datos: {
                mensaje: 'Intento de autenticación fallido',
                intentosRestantes: Math.max(0, 5 - intentosRecientes), // Ejemplo: límite de 5 intentos
                tiempoBloqueo: intentosRecientes >= 5 ? '15 minutos' : null
            }
        };

        res.status(401).json(respuesta);

    } catch (error) {
        res.status(500).json({
            exito: false,
            error: error.message
        });
    }
}

// Esto va a soportar si falla la autenticación o si es la pedida
const crearAuthLog = async (req, res) => {
    try {
        const {
            userId,
            email,
            estado,
            razonFallo
        } = req.body;

        const nuevoLog = new AuthLog({
            userId,
            email,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            estado,
            razonFallo,
            origen: req.originalUrl
        });

        await nuevoLog.save();

        res.status(201).json({
            exito: true,
            datos: nuevoLog
        });

    } catch (error) {
        res.status(500).json({
            exito: false,
            error: error.message
        });
    }
};

// 
// const logAuthAttempt = async (req, email, estado, razonFallo = null) => {
//     try {
//         const log = new AuthLog({
//             userId: email?._id,
//             ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
//             userAgent: req.headers['user-agent'],
//             estado,
//             razonFallo,
//             origen: req.originalUrl
//         });
//     }
// }
module.exports = {
    getEstadisticas, 
    getFallas,
    getLog,
    crearFailedLog,
    crearAuthLog
}
