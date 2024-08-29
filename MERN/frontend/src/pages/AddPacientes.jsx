import { useState } from "react";

import { UsarPacienteContexto } from "../hooks/UsarPacienteContexto";
import { UsarAuthContexto } from "../hooks/UsarAuthContexto";
import axios from "axios";

import '../assets/css/AddPacientes.css'

const PacienteForm = () => {
    const { dispatch } = UsarPacienteContexto()
    const { user } = UsarAuthContexto()

    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [rut, setRut] = useState('')
    const [fecha_nacimiento, setFecha] = useState('')
    const [sexo, setSexo] = useState('Masculino')
    const [telefono, setTelefono] = useState('')

    const [error, setError] = useState(null)
    const [camposVacios, setCamposVacios] = useState([])

    const handleSubmit = async (e) => {
        e.preventDefault()

        

        if (!user) {
            setError("Debes estar logeado para realizar esta accion")
            return
        }

        const unificado = nombre + " " + apellido
  
        

        const paciente_uni = {nombre: unificado, rut, fecha_nacimiento, sexo, telefono}

        console.log(JSON.stringify(paciente_uni))


        const response = await axios.post('http://localhost:4000/api/pacientes', paciente_uni,{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            }
        }).then(function(response){
            setNombre('')
            setApellido('')
            setRut('')
            setFecha('')
            setSexo('')
            setTelefono('')
            setError(null)
            dispatch({type: 'CREAR_PACIENTE', payload: response.data})
        }).catch(function(error){
            setError(error)
            
        })
        

    }
    
    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Añadir a un nuevo paciente</h3>

            <label>Nombre</label>
            <input
                type="text"
                onChange={(e) => setNombre(e.target.value)}
                value={nombre}
                className={camposVacios.includes('nombre') ? 'error' : ''}

            />

            <label>Apellido</label>
            <input
                type="text"
                onChange={(e) => setApellido(e.target.value)}
                value={apellido}
                className={camposVacios.includes('apellido') ? 'error' : ''}

            />

            <label>Rut</label>
            <input
                type="text"
                onChange={(e) => setRut(e.target.value)}
                value={rut}
                className={camposVacios.includes('rut') ? 'error' : ''}

            />

            <label>Fecha de Nacimiento</label>
            <input
                type="date"
                onChange={(e) => setFecha(e.target.value)}
                value={fecha_nacimiento}
                className={camposVacios.includes('fecha') ? 'error' : ''}

            />

            <label>Sexo</label>
            <select value={sexo} onChange={(e) => setSexo(e.target.value)}>
                <option value="Masculino"> Masculino </option>
                <option value="Femenino"> Femenino </option>
                <option value="No decir"> Prefiero No Decir </option>
            </select>
            
            <label>Telefono</label>
            <input
                type="text"
                onChange={(e) => setTelefono(e.target.value)}
                value={telefono}
                className={camposVacios.includes('telefono') ? 'error' : ''}

            />

            <button> Añadir Paciente</button>
            {error && <div className="error"> {error} </div>}

        </form>
    )
}

export default PacienteForm