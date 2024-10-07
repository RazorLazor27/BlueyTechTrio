import { useState } from "react"
import { usarLogin } from "../hooks/UsarLogin"
import '../assets/css/SignUp.css';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, error, isLoading } = usarLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        await login(email, password);
    };

    return (
        <div className="wrapper">
            <div className="title-text">
                <div className="title login">Iniciar Sesión</div>
            </div>
            <div className="form-container">
                <div className="form-inner">
                    <form className="login" onSubmit={handleSubmit}>
                        <div className="field">
                            <input 
                                type="email" 
                                placeholder="Correo"
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

                        <div className="field btn">
                            <div className="btn-layer"></div>
                            <input type="submit" value="Log In" disabled={isLoading} />
                        </div>
                        {error && <div className="error">{error}</div>}

                        <div className="login-link">
                            <p>¿No tienes cuenta? <a href="/signup">Regístrate</a></p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;