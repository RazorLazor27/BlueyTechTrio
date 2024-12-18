import { useState } from "react";
import { usarSignup } from "../hooks/UsarSignup";
import '../assets/css/SignUp.css';

const Signup = () => {
    const [rutDoctor, setRutDoctor] = useState('');
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [sexo, setSexo] = useState('Pred'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [specialization, setSpecialization] = useState('Pred'); 

    const { signup, error, isLoading } = usarSignup();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await signup(rutDoctor, nombre, apellido, sexo, email, password, specialization);
    };

    return (
        <div className="wrapper">
            <div className="title-text">
                <div className="title signup">Crear Usuario</div>
            </div>
            <div className="form-container">
                <div className="form-inner">
                    <form action="#" className="signup" onSubmit={handleSubmit}>
                        <div className="field">
                            <input
                                type="text"
                                placeholder="Rut Doctor"
                                onChange={(e) => setRutDoctor(e.target.value)}
                                value={rutDoctor}
                                required
                            />
                        </div>
                        <div className="field">
                            <input
                                type="text"
                                placeholder="Nombre"
                                onChange={(e) => setNombre(e.target.value)}
                                value={nombre}
                                required
                            />
                        </div>
                        <div className="field">
                            <input
                                type="text"
                                placeholder="Apellido"
                                onChange={(e) => setApellido(e.target.value)}
                                value={apellido}
                                required
                            />
                        </div>
                        <div className="field">
                            <select
                                value={sexo}
                                onChange={(e) => setSexo(e.target.value)}
                                required
                            >
                                <option value="Pred">Seleccionar Opción</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="No decir">Prefiero No Decir</option>
                            </select>
                        </div>
                        <div className="field">
                            <input
                                type="email"
                                placeholder="Email"
                                onChange={(e) => setEmail(e.target.value)}
                                value={email}
                                required
                            />
                        </div>
                        <div className="field">
                            <input
                                type="password"
                                placeholder="Contraseña"
                                onChange={(e) => setPassword(e.target.value)}
                                value={password}
                                required
                            />
                        </div>
                        <div className="field">
                            <select
                                value={specialization}
                                onChange={(e) => setSpecialization(e.target.value)}
                                required
                            >
                                <option value="Pred">Seleccionar Opción</option>
                                <option value="General">General</option>
                                <option value="Cardiología">Cardiología</option>
                                <option value="Administrador"> Administrador </option>
                            </select>
                        </div>
                        <div className="field btn">
                            <div className="btn-layer"></div>
                            <input type="submit" value="Sign Up" disabled={isLoading} />
                        </div>
                        {error && <div className="error">{error}</div>}
                    </form>
                </div>
                <div className="login-link">
                    <p>
                        ¿Ya tienes cuenta? <a href="/login">Iniciar sesión</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
