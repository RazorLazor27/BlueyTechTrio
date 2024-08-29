import { UsarAuthContexto } from "./UsarAuthContexto"

export const UsarLogout = () => {
    const { dispatch } = UsarAuthContexto()
    

    const logout = () => {
        // Quitar las credenciales del usuario de la data local
        localStorage.removeItem('usuario')

        // Despachar la acción al contexto de login
        dispatch({type: 'LOGOUT'})
    }

    return {logout}
}