import { Link } from 'react-router-dom'
import { UsarLogout } from '../hooks/UsarLogout'
import { UsarAuthContexto } from '../hooks/UsarAuthContexto'

import './Navbar.css'

const Navbar = () => {
    const { logout } = UsarLogout()
    const { user } = UsarAuthContexto()

    const handleClick = () => {
        logout()
    }



    return (
        <div className='nav'>
            <div className='nav-logo'>CodeConvergence</div>
            <ul className='nav-menu'>

                <li><Link to="/">Home</Link></li>
                <li><Link to="/pacientes">Pacientes</Link></li>
                <input type="text" placeholder="Buscar Paciente" className="nav-search" />
                <nav className="mininav">

                    {user && (
                        <div className="logged-in">
                            <span className='intro' style ={{ fontsize: '1.5em' }}>Bienvenido</span>
                            <span className='pacientesadd'> <Link to="/adduser"> Añadir Pacientes</Link></span>
                            <button onClick={handleClick}>Log Out</button>
                        </div>
                    )}
                    {!user && (
                        <div> 
                            <li className='nav-login'> <Link to="/login"> Login </Link> </li>
                            <li className='nav-signup'> <Link to="/signup"> Signup </Link> </li>
                        </div>
                        
                    )}

                </nav>
                
                
            </ul>
        </div>
    )
}

export default Navbar