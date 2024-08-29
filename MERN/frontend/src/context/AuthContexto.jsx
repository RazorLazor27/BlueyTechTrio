import { createContext, useReducer, useEffect } from "react";

export const AuthContexto = createContext()

export const authReducer = (state, action ) => {
    switch (action.type) {
        case 'LOGIN':
            return {user: action.payload}
        case 'LOGOUT':
            return {user: null}
        default:
            return state
    }
}

export const AuthContextoProveedor = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, {
        user: null
    })

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('usuario'))

        if (user) {
            dispatch({type: 'LOGIN', payload: user})
        }
    }, [])

    console.log('Estado de autorización: ', state)

    return (
        <AuthContexto.Provider value={{...state, dispatch}}>
            { children }
        </AuthContexto.Provider>
    )
}