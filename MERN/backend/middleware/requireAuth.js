const jwt = require('jsonwebtoken')
const Usuario = require('../models/UsuarioModel')

const requireAuth = async (req, res,  next) => {

    // Verificar que el usuario esta autenticado
    const { authorization } = req.headers

    if (!authorization) {
        return res.status(401).json({error: "Token de authorization requerido para seguir"})
    }

    const token = authorization.split(' ')[1]

    try {
        const {_id} = jwt.verify(token, process.env.SECRET)
        req.user = await Usuario.findOne({ _id }).select('_id')

        next()
    } catch (error){
        console.log(error)
        res.status(401).json({error: 'Solicitud no autorizada'})
    }

}

module.exports = requireAuth