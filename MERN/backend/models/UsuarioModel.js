const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validador = require('validator');


const Schema = mongoose.Schema;

const Usuario = new Schema({
    rut_doctor: {
        type: String,
        required: true,
        unique: true
    },
    nombre: {
        type: String, 
        require: true
    },
    apellido: {
        type: String,
        require: true
    },
    sexo: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true
    }
}, {timestamps: true})

// Metodo creado para hacerle signup a un usuario
Usuario.statics.signup = async function(rut_doctor, nombre, apellido, sexo, email, password, specialization){
    
    // Validación de los datos previo a inserción en la base de datos
    if (!email || !password || !rut_doctor || !nombre || !apellido || !sexo || !specialization){
        throw Error('Todos los campos deben ser rellenados')
    }

    if (!validador.isEmail(email)){
        throw Error('El email no es valido')
    }

    if (!validador.isStrongPassword(password)){
        throw Error('La contraseña no es suficientemente segura')
    }
    
    const existe = await this.findOne({ email })

    if (existe) {
        throw Error('El correo ya esta en uso')
    }

    // Es para agregarle caracteres extras a la contraseña y hacerla mas segura, es medio xd pero funciona. Como no compile cago esta wea inmediatamente
    const salt = await bcrypt.genSalt(10)

    const hash = await bcrypt.hash(password, salt)

    const user = await this.create({
        rut_doctor,
        nombre,
        apellido,
        sexo,
        email,
        password: hash,
        specialization
    })

    return user
}


// Metodo estatico para el proceso de login

Usuario.statics.login = async function(email, password){
    if (!email || !password){
        throw Error('Todos los campos deben ser rellenados')
    }

    const user = await this.findOne({ email })
    if (!user) {
        throw Error('Direccion de correo no encontrada')
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match){
        throw Error('Contraseña incorrecta')
    }
    
    return user
}

module.exports = mongoose.model('Usuario', Usuario,'Login')