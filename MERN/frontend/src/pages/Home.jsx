import { Link } from 'react-router-dom';
import { UsarAuthContexto } from '../hooks/UsarAuthContexto';
import '../assets/css/Home.css';
import ImagenBienvenida from '../img/Bienvenida.jpg';

const Home = () => {
    const { user, pacientesRecientes } = UsarAuthContexto();

    return (
        <div className="home-container">
            {!user ? (
                <div className="split-screen">
                    <div className="intro cajon">
                        <h2 style={{ marginBottom: '10px' }}>Bienvenido</h2>
                        <p>Una plataforma para gestionar tus pacientes de manera eficiente.</p>
                        <p style={{ marginTop: '20px' }}>
                            Aquí podrás encontrar herramientas y recursos que facilitarán la gestión de tus pacientes, 
                            asegurando un seguimiento adecuado y un mejor servicio.
                        </p>
                        <img 
                            src={ImagenBienvenida} 
                            alt="Descripción de la imagen" 
                            style={{ marginTop: '20px', width: '100%', height: 'auto', objectFit: 'cover' }}
                        />
                    </div>
                    <div className="auth-buttons cajon" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '50%' }}>
                        <div className="login-section">
                            <h2><p>¿Ya tiene cuenta?</p></h2>
                            <Link to="/login">
                                <button className="login-btn">Inicia Sesión</button>
                            </Link>
                        </div>
                        <div className="signup-section">
                            <h2>¿No tienes una cuenta?</h2>
                            <Link to="/signup">
                                <button className="signup-btn">Regístrate</button>
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="split-screen">
                    <div className="welcome-message">
                        <h2>Bienvenido, {user.nombre}</h2>
                        <ul className="options-list">
                            <Link to="/perfil">Ver perfil</Link>
                        </ul>
                    </div>
                    <div className="patients-section">
                        <h2>Pacientes Recientes</h2>
                        <div className="patients-grid">
                            {pacientesRecientes && pacientesRecientes.length > 0 ? (
                                pacientesRecientes.slice(0, 5).map((paciente) => (
                                    <div className="patient-box" key={paciente.id}>
                                        {paciente.nombre}
                                    </div>
                                ))
                            ) : (
                                <div>No hay pacientes recientes.</div>
                            )}
                        </div>
                        <Link to="/pacientes">
                            <button className="view-all-btn">Ver lista completa</button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;
