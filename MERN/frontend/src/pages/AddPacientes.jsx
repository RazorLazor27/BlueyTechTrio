import { useState } from "react";
import { UsarPacienteContexto } from "../hooks/UsarPacienteContexto";
import { UsarAuthContexto } from "../hooks/UsarAuthContexto";
import axios from "axios";
import '../assets/css/AddPacientes.css';

const PacienteForm = () => {
    const { dispatch } = UsarPacienteContexto();
    const { user } = UsarAuthContexto();

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [rut, setRut] = useState('');
    const [fecha_nacimiento, setFecha] = useState('');
    const [sexo, setSexo] = useState('Masculino');
    const [telefono, setTelefono] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState(null);
    const [camposVacios, setCamposVacios] = useState([]);

    // Validación básica del formulario
    const validarFormulario = () => {
        const camposRequeridos = [];
        
        if (!nombre.trim()) camposRequeridos.push('nombre');
        if (!apellido.trim()) camposRequeridos.push('apellido');
        if (!rut.trim()) camposRequeridos.push('rut');
        if (!fecha_nacimiento) camposRequeridos.push('fecha');
        if (!telefono.trim()) camposRequeridos.push('telefono');
        
        setCamposVacios(camposRequeridos);
        return camposRequeridos.length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError("Debes estar logeado para realizar esta acción");
            return;
        }

        // Validar formulario antes de enviar
        if (!validarFormulario()) {
            setError("Por favor, completa todos los campos requeridos");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        const unificado = `${nombre.trim()} ${apellido.trim()}`;
        const paciente_uni = { 
            nombre: unificado, 
            rut: rut.trim(), 
            fecha_nacimiento, 
            sexo, 
            telefono: telefono.trim() 
        };

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/pacientes`,
                paciente_uni,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    }
                }
            );
            
            // Limpiar formulario y actualizar contexto
            setNombre('');
            setApellido('');
            setRut('');
            setFecha('');
            setSexo('Masculino');
            setTelefono('');
            setError(null);
            setCamposVacios([]);
            
            dispatch({ type: 'CREAR_PACIENTE', payload: response.data });

        } catch (error) {
            // Manejar el error de la respuesta del servidor
            const mensajeError = error.response?.data?.error || error.message || 'Error al crear el paciente';
            setError(mensajeError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form className="create" onSubmit={handleSubmit}>
            <h3>Añadir a un nuevo paciente</h3>

            <label>Nombre *</label>
            <input
                type="text"
                onChange={(e) => {
                    setNombre(e.target.value);
                    setCamposVacios(prev => prev.filter(campo => campo !== 'nombre'));
                }}
                value={nombre}
                className={camposVacios.includes('nombre') ? 'error' : ''}
                disabled={isSubmitting}
            />

            <label>Apellido *</label>
            <input
                type="text"
                onChange={(e) => {
                    setApellido(e.target.value);
                    setCamposVacios(prev => prev.filter(campo => campo !== 'apellido'));
                }}
                value={apellido}
                className={camposVacios.includes('apellido') ? 'error' : ''}
                disabled={isSubmitting}
            />

            <label>Rut *</label>
            <input
                type="text"
                onChange={(e) => {
                    setRut(e.target.value);
                    setCamposVacios(prev => prev.filter(campo => campo !== 'rut'));
                }}
                value={rut}
                placeholder="12345678-9"
                className={camposVacios.includes('rut') ? 'error' : ''}
                disabled={isSubmitting}
            />

            <label>Fecha de Nacimiento *</label>
            <input
                type="date"
                onChange={(e) => {
                    setFecha(e.target.value);
                    setCamposVacios(prev => prev.filter(campo => campo !== 'fecha'));
                }}
                value={fecha_nacimiento}
                className={camposVacios.includes('fecha') ? 'error' : ''}
                disabled={isSubmitting}
            />

            <label>Sexo</label>
            <select 
                value={sexo} 
                onChange={(e) => setSexo(e.target.value)}
                disabled={isSubmitting}
            >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="No decir">Prefiero No Decir</option>
            </select>
            
            <label>Teléfono *</label>
            <input
                type="tel"
                onChange={(e) => {
                    setTelefono(e.target.value);
                    setCamposVacios(prev => prev.filter(campo => campo !== 'telefono'));
                }}
                value={telefono}
                placeholder="+56912345678"
                className={camposVacios.includes('telefono') ? 'error' : ''}
                disabled={isSubmitting}
            />

            <button disabled={isSubmitting}>
                {isSubmitting ? 'Añadiendo...' : 'Añadir Paciente'}
            </button>
            
            {error && <div className="error">{error}</div>}
            {camposVacios.length > 0 && (
                <div className="error">
                    Por favor, completa los campos requeridos marcados con *
                </div>
            )}
        </form>
    );
};

export default PacienteForm;