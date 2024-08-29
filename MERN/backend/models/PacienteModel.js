// Aqui va a estar el objeto de pacientes que vamos a subir a la base de datos

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const Paciente = new Schema({
    nombre: {
        type: String,
        required: true
    },
    rut: {
        type: String,
        required: true
    },
    fecha_nacimiento: {
        type: Date,
        required: false
    },
    sexo: {
        type: String,
        required: true
    },
    telefono: {
        type: String,
        required: false
    },
    doctor_rut: {
        type: String,
        required: true
    },
    en_tratamiento: {
        type: Boolean,
        require: true
    }
}, {timestamps: true})

module.exports = mongoose.model('Paciente', Paciente,'Pacientes')