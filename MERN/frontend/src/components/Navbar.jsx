import { Link, useNavigate } from 'react-router-dom'; 
import { UsarLogout } from '../hooks/UsarLogout';
import { UsarAuthContexto } from '../hooks/UsarAuthContexto';

import './Navbar.css';

const Navbar = () => {
    const { logout } = UsarLogout();
    const { user } = UsarAuthContexto();
    const navigate = useNavigate(); 

    const handleClick = () => {
        logout();
        navigate('/');
    }

    return (
        <div className='nav'>
            <div className='nav-logo'>Bluey</div>
            <ul className='nav-menu'>
                <li><Link to="/">Home</Link></li>
                {user ? (
                    <>
                        <li><Link to="/perfil">Perfil</Link></li>
                        <button onClick={handleClick}>Log Out</button>
                    </>
                ) : null}
            </ul>
        </div>
    );
}

export default Navbar;
