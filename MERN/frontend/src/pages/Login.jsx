import { useState } from "react"
import { usarLogin } from "../hooks/UsarLogin"


const Login = () =>{
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { login , error, isLoading} = usarLogin()

    const handleSubmit = async (e) => {
        e.preventDefault()

        await login(email, password)
    }

    return (
        <form className="login" onSubmit={handleSubmit}>
            <h3> Log in </h3>


            <label> Email </label>
            <input 
                type="email" 
                onChange={(e) => setEmail(e.target.value)}
                value={email}
            />


            <label> Contraseña </label>
            <input 
                type="password" 
                onChange={(e) => setPassword(e.target.value)}
                value={password}
            />

            <button disabled={isLoading}> Log in</button>
            {error && <div classname="error"> {error} </div>}
        </form>
    )
}


export default Login