import './PacientesDetalles.css'
import deleteIcon from '../assets/delete-user-1.svg'
import axios from 'axios';
import { UsarPacienteContexto } from '../hooks/UsarPacienteContexto';
import { UsarAuthContexto } from '../hooks/UsarAuthContexto';
import { Link, useNavigate } from 'react-router-dom';






function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based in JavaScript
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


const PacienteDetalles = ({ paciente}) => {

    const {dispatch} = UsarPacienteContexto()
    const { user } = UsarAuthContexto()

    const navigate = useNavigate()

    const handleRevisarPerfil = (paciente) => {
        navigate('/dicom', { state: {paciente}})
    }

    const handleClick = async () => {
        if (!user){
            return console.log("No hay usuario papito")
        }

        
        const response = await axios.delete('http://localhost:4000/api/pacientes/' + paciente._id,{
            headers: {
                'Authorization': `Bearer ${user.token}`
            }
        });
        // setPacientes(response.data); // Aquí accedemos a la propiedad data
        dispatch({type: 'DELETE_PACIENTE', payload: response.data})
    }
    
    return (
        <div className="pacientes-detalles">
            <div className="card"> 
                <div className="card-title">
                    <h2 className='nombre-pacientes'> { paciente.nombre}</h2>

                    <img src={deleteIcon} alt="Eliminar" className="delete-paciente" onClick={handleClick}/>
                </div>
                <p><strong> Rut: </strong>{paciente.rut}</p>
                <p><strong> Fecha de Nacimiento: </strong>{formatDate(paciente.fecha_nacimiento)}</p>
                <p><strong> Sexo: </strong>{paciente.sexo}</p>
                <p><strong> Telefono: </strong>{paciente.telefono}</p>
                <p><strong> Ingresado al Hospital: </strong>{formatDate(paciente.createdAt)}</p>
                <div className="container">
                    <button 
                        className="button-24" 
                        role="button"
                        onClick={() => handleRevisarPerfil(paciente)}
                    >
                        Revisar Perfil 
                    </button>
                </div>
                

            </div>
            
        </div>

        
    )
}

export default PacienteDetalles;