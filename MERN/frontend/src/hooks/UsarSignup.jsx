import { useState } from "react";
import { UsarAuthContexto } from './UsarAuthContexto';
import axios from "axios";

export const usarSignup = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const { dispatch } = UsarAuthContexto()

    const signup = async (rut, nombre, apellido, sexo, email, password, specialization) => {
        setIsLoading(true)
        setError(null)

        const table_value = {
            "General": 1,
            "Cardiología": 2,
            "Administrador": 3
        }

        const spec = table_value[specialization] || null

        if (spec === null) {
            setIsLoading(false);
            setError('La especialización proporcionada no es válida.');
            throw new Error('La especialización proporcionada no es válida.');
        }

        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/usuarios/signup`, {
                rut_doctor: rut,
                nombre,
                apellido,
                sexo,
                email,
                password,
                specialization: spec
            })

            localStorage.setItem('usuario', JSON.stringify(response.data))
            dispatch({type: 'LOGIN', payload: response.data})
            setIsLoading(false)
            console.log('Respuesta exitosa:', response.data)
            return response.data
        } catch (error) {
            setIsLoading(false)
            if (error.response) {
                // El servidor respondió con un código de estado fuera del rango 2xx
                console.error('Error de respuesta:', error.response.data)
                setError(error.response.data.error || 'Error en el registro')
            } else if (error.request) {
                // La solicitud se hizo pero no se recibió respuesta
                console.error('Error de solicitud:', error.request)
                setError('No se pudo conectar con el servidor')
            } else {
                // Algo sucedió en la configuración de la solicitud que provocó un error
                console.error('Error:', error.message)
                setError('Error al procesar la solicitud')
            }
            throw error
        }
    }

    return { signup, isLoading, error }
}


