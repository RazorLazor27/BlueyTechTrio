import { useState } from "react";
import { UsarAuthContexto } from './UsarAuthContexto';
import axios from "axios";

export const usarLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = UsarAuthContexto()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/usuarios/login`, {
                email: email,
                password: password
            });

            // Login exitoso
            const { mensaje, ...usuarioData } = response.data;
            localStorage.setItem('usuario', JSON.stringify(usuarioData));
            //Llamamos al authContexto
            dispatch({ type: 'LOGIN', payload: usuarioData });
            setIsLoading(false);

            console.log("Mensaje del servidor:", mensaje);
        } catch (error) {
            // Registrar el fallo de login
            try {
                const failedResponse = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/logs/fallas`, {
                    email: email
                });

                // Formatear el mensaje de error basado en la respuesta de createFailedLog
                const { datos } = failedResponse.data;
                const mensajeError = datos.intentosRestantes > 0
                    ? `${datos.mensaje}. Te quedan ${datos.intentosRestantes} intentos.`
                    : `${datos.mensaje}. Tu cuenta ha sido bloqueada temporalmente por ${datos.tiempoBloqueo}.`;

                setError(mensajeError);
            } catch (logError) {
                // Si falla el registro del error, mostrar un mensaje genérico
                setError('Error al intentar iniciar sesión. Por favor, intenta nuevamente.');
            }

            setIsLoading(false);
            console.log(error);
        }
    }

    return { login, isLoading, error }
}