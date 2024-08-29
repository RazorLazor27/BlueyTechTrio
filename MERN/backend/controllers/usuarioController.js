const Usuario = require('../models/UsuarioModel')
const jwt = require('jsonwebtoken') // Esto nos va a ayudar con la validación del personas y los logins 



const crearToken = (_id) => {
    return jwt.sign({_id: _id}, process.env.SECRET, {expiresIn: '3d'})
}

// Logear a un usuario
const loginUsuario = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await Usuario.login(email, password)

        // Crear el Token
        const token = crearToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// Añadir a un usuario
const signupUsuario = async (req, res) => {

    const {rut_doctor, nombre, apellido, sexo, email, password, specialization} = req.body

    try {
        const user = await Usuario.signup(rut_doctor, nombre, apellido, sexo, email, password, specialization)

        // Crear el Token
        const token = crearToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


module.exports = {signupUsuario, loginUsuario}