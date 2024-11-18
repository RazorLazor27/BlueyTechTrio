const Paciente = require('../models/PacienteModel')
const mongoose = require('mongoose')

// Estas son funciones para validar los parametros de entrada para todos los post en la BD 
const validarRut = (rut) => {
    if (!rut || typeof rut !== 'string') {
        throw new Error('RUT es requerido');
    }

    // Limpiamos el RUT de puntos y espacios, pero mantenemos el guion
    const rutLimpio = rut.replace(/\./g, '').trim();
    
    // Verificamos que tenga el formato correcto (con guion)
    if (!/^\d{7,8}-[0-9kK]$/.test(rutLimpio)) {
        throw new Error('Formato de RUT inválido. Debe incluir guion (ej: 12345678-9)');
    }
    
    // Devolvemos el RUT limpio (sin puntos pero con guion)
    return rutLimpio;
};

const validarNombre = (nombre) => {
    if (!nombre || typeof nombre !== 'string' || nombre.length < 2 || nombre.length > 100) {
        throw new Error('El nombre debe tener entre 2 y 100 caracteres');
    }
    // Eliminar caracteres especiales y múltiples espacios
    return nombre.trim().replace(/\s+/g, ' ');
};

const validarFechaNacimiento = (fecha) => {
    const fechaNac = new Date(fecha);
    const hoy = new Date();
    
    if (isNaN(fechaNac.getTime())) {
        throw new Error('Fecha de nacimiento inválida');
    }
    
    if (fechaNac > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
    }
    
    const edadMinima = new Date(hoy.getFullYear() - 120, hoy.getMonth(), hoy.getDate());
    if (fechaNac < edadMinima) {
        throw new Error('La fecha de nacimiento es demasiado antigua');
    }
    
    return fechaNac;
};

const validarSexo = (sexo) => {
    if (!sexo || typeof sexo !== 'string') {
        throw new Error('Sexo es requerido y debe ser una cadena de texto');
    }
    
    // Lista blanca de valores permitidos
    const sexosValidos = {
        'masculino': 'masculino',
        'femenino': 'femenino',
        'no decir': 'no decir'
    };
    
    // Sanitizar y validar contra la lista blanca
    const sexoNormalizado = sexo.trim().toLowerCase();
    
    // Solo permitir valores que estén en nuestra lista blanca
    const sexoValidado = sexosValidos[sexoNormalizado];
    
    if (!sexoValidado) {
        throw new Error('Valor de sexo no válido. Debe ser: Masculino, Femenino o No decir');
    }
    
    // Retornar el valor seguro de la lista blanca
    return sexoValidado;
};


const validarTelefono = (telefono) => {
    // Eliminar espacios y caracteres especiales
    const telefonoLimpio = telefono.replace(/\s+/g, '').replace(/[-()+]/g, '');
    
    // Verificar que solo contenga números y tenga una longitud razonable
    if (!/^\d{8,15}$/.test(telefonoLimpio)) {
        throw new Error('Formato de teléfono inválido');
    }
    
    return telefonoLimpio;
};


// Obtener todos los pacientes
const getPacientes = async (req, res) => {

    const doctor_rut = req.user._id

    const pacientes = await Paciente.find({doctor_rut}).sort({createdAt: -1});

    res.status(200).json(pacientes)
}


// Obtener a solo 1 paciente
const getPaciente = async (req, res) => {
    const {id} = req.params

    const paciente = await Paciente.findById(id)

    if (!paciente){
        return res.status(400).json({error: "No existe el paciente"})
    }

    res.status(200).json(paciente);
}


// Agregar un nuevo paciente
const crearPaciente = async(req, res) => {
    try {
        const {nombre, rut, fecha_nacimiento, sexo, telefono} = req.body;
        
        // Validar que existan todos los campos requeridos
        if (!nombre || !rut || !fecha_nacimiento || !sexo || !telefono) {
            return res.status(400).json({
                error: 'Todos los campos son requeridos'
            });
        }
        
        // El schema basico de esta cosa
        const datosPaciente = {
            nombre: '',
            rut: '',
            fecha_nacimiento: null,
            sexo: '',
            telefono: '',
            doctor_rut: null,
            en_tratamiento: true
        };

        try {
            datosPaciente.nombre = validarNombre(nombre);
            datosPaciente.rut = validarRut(rut);
            datosPaciente.fecha_nacimiento = validarFechaNacimiento(fecha_nacimiento);
            datosPaciente.sexo = validarSexo(sexo);
            datosPaciente.telefono = validarTelefono(telefono);
            datosPaciente.doctor_rut = new mongoose.Types.ObjectId(req.user._id);
        } catch (validationError) {
            return res.status(400).json({
                error: validationError.message
            });
        }

        // Verificar si ya existe un paciente con el mismo RUT
        const pacienteExistente = await Paciente.findOne({
            rut: datosPaciente.rut
        }).exec();
        
        if (pacienteExistente) {
            return res.status(400).json({
                error: 'Ya existe un paciente registrado con este RUT'
            });
        }

        // Crear el paciente con los datos validados
        const nuevoPaciente = new Paciente(datosPaciente);

        const paciente = await nuevoPaciente.save();
        

        res.status(201).json({
            mensaje: 'Paciente creado exitosamente',
            paciente: {
                _id: paciente._id,
                nombre: paciente.nombre,
                rut: paciente.rut,
                fecha_nacimiento: paciente.fecha_nacimiento,
                sexo: paciente.sexo,
                telefono: paciente.telefono,
                en_tratamiento: paciente.en_tratamiento
            }
        });

    } catch (error) {
        // Manejar errores específicos de validación
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Error de validación',
                detalles: Object.values(error.errors).map(err => err.message)
            });
        }

        // Manejar otros errores
        res.status(400).json({
            error: error.message
        });
    }
};


// Borrar un paciente
const borrarPaciente = async (req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No existe ese paciente"})
    }

    const paciente = await Paciente.findOneAndDelete({_id: id})

    if (!paciente) {
        return res.status(400).json({error: "No existe ese paciente"})
    }

    res.status(200).json(paciente)
}

// Actualizar datos de un paciente
const modificarPaciente= async(req, res) => {
    const {id} = req.params

    if(!mongoose.Types.ObjectId.isValid(id)){
        return res.status(404).json({error: "No existe ese paciente"})
    }

    const paciente = await Paciente.findOneAndUpdate({_id: id}, {
        ...req.body
    })

    if (!paciente) {
        return res.status(400).json({error: "No existe ese paciente"})
    }

    res.status(200).json(paciente)
}


module.exports = {
    crearPaciente,
    getPacientes, 
    getPaciente,
    borrarPaciente,
    modificarPaciente
}