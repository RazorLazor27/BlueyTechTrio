import { Link } from 'react-router-dom';
import { UsarAuthContexto } from '../hooks/UsarAuthContexto';
import '../assets/css/Home.css';

// Importar imágenes para el carrusel
import imagen1 from '../img/1.png';
import imagen2 from '../img/2.png';
import imagen3 from '../img/3.png';
import imagen4 from '../img/4.png';
import imagen5 from '../img/5.png';
import imagen6 from '../img/6.png';
import imagen7 from '../img/7.png';
import imagen8 from '../img/8.png';
import imagen9 from '../img/9.png';
import imagen10 from '../img/10.png';
import imagen11 from '../img/11.png';
import imagen12 from '../img/12.png';
import imagen13 from '../img/13.png';
import imagen14 from '../img/14.png';

const Home = () => {
    const { user, pacientesRecientes } = UsarAuthContexto();
    const images = [imagen1, imagen2, imagen3, imagen4, imagen5, imagen6, imagen7, imagen8, imagen9, imagen10, imagen11, imagen12, imagen13, imagen14];

    return (
        <div className="home-container">
            {!user ? (
                <div className="split-screen">
                    <div className="intro cajon">
                        <h1 style={{ marginBottom: '10px' }}>Bienvenido</h1>
                        <p>Una plataforma para gestionar tus pacientes de manera eficiente.</p>
                        <p style={{ marginTop: '10px' }}>
                            Aquí podrás encontrar herramientas y recursos que facilitarán la gestión de tus pacientes, 
                            asegurando un seguimiento adecuado y un mejor servicio.
                        </p>
                        {/* Carrusel de Imágenes */}
                        <div className="carousel-container">
                            <div className="carousel">
                                {images.map((image, index) => (
                                    <div key={index} className="carousel-image">
                                        <img src={image} alt={`Carrusel ${index}`} />
                                    </div>
                                ))}
                            </div>
                        </div>
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
