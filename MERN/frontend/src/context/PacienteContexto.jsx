import { createContext, useReducer } from "react";

export const PacientesContexto = createContext()

export const PacientesReducer = (state, action) => {
    switch(action.type){
        case 'SET_PACIENTES':
            return { 
                pacientes: action.payload
            }
        case 'CREAR_PACIENTE':
            return {
                pacientes: [action.payload, ...state.pacientes]
            }
        case 'DELETE_PACIENTE':
            return {
                pacientes: state.pacientes.filter((p) => p._id !== action.payload._id)
            }
        default:
            return state
    }
}

export const PacientesContextoProveedor = ({ children }) => {
    const [state, dispatch] = useReducer(PacientesReducer, {
        pacientes: []
    })

    
    return(
        <PacientesContexto.Provider value={{...state, dispatch}}>
            {children}
        </PacientesContexto.Provider>
    )
}