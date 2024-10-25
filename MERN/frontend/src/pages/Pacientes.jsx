import { useEffect } from "react";
import axios from "axios";
import '../assets/css/Pacientes.css';
import { UsarPacienteContexto } from "../hooks/UsarPacienteContexto";
import { UsarAuthContexto } from "../hooks/UsarAuthContexto";

import PacienteDetalles from "../components/PacientesDetalles";
import { Link } from 'react-router-dom'; 
const Pacientes = () => {
    const { pacientes, dispatch } = UsarPacienteContexto();
    const { user } = UsarAuthContexto();

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const response = await axios.get('http://localhost:4000/api/pacientes/', {
                    headers: {
                        'Authorization': `Bearer ${user.token}`
                    }
                });
                dispatch({ type: 'SET_PACIENTES', payload: response.data });
            } catch (error) {
                console.error("Error fetching pacientes:", error);
            }
        };
        // debería funcionar
        if (user) {
            fetchPacientes();
        }

    }, [dispatch, user]);

    return (
        <div className="home">
            {user && (
                <div className="add-paciente-button">
                    <Link to="/adduser" className="add-paciente-link">
                        <button>Añadir Paciente</button>
                    </Link>
                </div>
            )}
            <div className="pacientes">
                {pacientes && pacientes.map((paciente) => (
                    <PacienteDetalles key={paciente._id} paciente={paciente} />
                ))}
            </div>
        </div>
    );
};

export default Pacientes;
