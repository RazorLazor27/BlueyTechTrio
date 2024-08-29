import { PacientesContexto } from "../context/PacienteContexto";
import { useContext } from "react";

export const UsarPacienteContexto = () => {
    const contexto = useContext(PacientesContexto)

    if (!contexto) {
        throw Error('UsarPacientesContexto debe ser usado dentro de un Proveedor de Contexto para Pacientes')
    }

    

    return contexto
}