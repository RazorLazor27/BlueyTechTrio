import { AuthContexto } from "../context/AuthContexto";
import { useContext } from "react";

export const UsarAuthContexto = () => {
    const contexto = useContext(AuthContexto)

    if (!contexto) {
        throw Error('UsarAuthContexto debe ser usado dentro de un Proveedor de Contexto para Autorización')
    }

    

    return contexto
}