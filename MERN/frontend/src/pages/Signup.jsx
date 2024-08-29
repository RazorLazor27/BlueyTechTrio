import { useState } from "react"
import { usarSignup } from "../hooks/UsarSignup"

const Signup = () =>{
    const [rutDoctor, setRutDoctor] = useState('')
    const [nombre, setNombre] = useState('')
    const [apellido, setApellido] = useState('')
    const [sexo, setSexo] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [specialization, setSpecialization] = useState('')

    const { signup, error, isLoading } = usarSignup()

    const handleSubmit = async (e) => {
        e.preventDefault()

        
        await signup(rutDoctor, nombre, apellido, sexo, email, password, specialization)
    }

    return (
        <form className="signup" onSubmit={handleSubmit}>
            <h3> Sign up </h3>

            <label> Rut Doctor </label>
            <input 
                type="text" 
                onChange={(e) => setRutDoctor(e.target.value)}
                value={rutDoctor}
            />

            <label> Nombre </label>
            <input 
                type="text" 
                onChange={(e) => setNombre(e.target.value)}
                value={nombre}
            />

            <label> Apellido </label>
            <input 
                type="text" 
                onChange={(e) => setApellido(e.target.value)}
                value={apellido}
            />

            <label> Sexo </label>
            <input 
                type="text" 
                onChange={(e) => setSexo(e.target.value)}
                value={sexo}
            />

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

            <label> Especialización </label>
            <input 
                type="text" 
                onChange={(e) => setSpecialization(e.target.value)}
                value={specialization}
            />

            <button disabled={isLoading}> Sign Up</button>
            {error && <div className="error"> { error} </div>}
        </form>
    )
}

export default Signup