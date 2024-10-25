import { useState } from "react";
import { UsarAuthContexto } from './UsarAuthContexto';
import axios from "axios";

export const usarLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const {dispatch} = UsarAuthContexto()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)

        const response = axios.post(`${import.meta.env.VITE_API_BASE_URL}/usuarios/login`,{
            email: email,
            password: password
        })
        .then(function(response){
            // Debería ser un simil a response.ok 
            localStorage.setItem('usuario',JSON.stringify(response.data))

            // Actualizar el AuthContexto
            dispatch({type: 'LOGIN', payload: response.data})
            setIsLoading(false)

            console.log(response)
        })
        .catch(function (error){

            setIsLoading(false)
            console.log(error)
        })


    }

    return {login, isLoading, error }
}

