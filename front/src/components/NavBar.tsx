import React, { useState, useEffect } from 'react'; 
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { useAuth } from '../hooks/useAuth';

const NavBar: React.FC = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); 

    const [isOpen, setIsOpen] = useState(false);
    
    const toggleNavbar = () => {
        setIsOpen(!isOpen);
    };
    
    const closeNavbar = () => {
        setIsOpen(false);
    }
    
    useEffect(() => {
        closeNavbar();
    }, [location]); 

    const handleLogout = () => {
        logout();
        closeNavbar(); 
        navigate('/'); 
    };

    return (
        
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div className="container">
                <Link className="navbar-brand" to="/" onClick={closeNavbar}>
                    "название" сайта
                </Link>
                <button
                    className="navbar-toggler"
                    type="button"
                    
                    aria-controls="navbarNav"
                    aria-expanded={isOpen} 
                    aria-label="Toggle navigation"
                    onClick={toggleNavbar} 
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/" onClick={closeNavbar}>
                                Комнаты
                            </Link>
                        </li>
                    </ul>
                    <ul className="navbar-nav ms-auto">
                         {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <span className="navbar-text me-3">
                                        Привет, {user?.username || 'Admin'}
                                    </span>
                                </li>
                                 <li className="nav-item">
                                     <Link className="nav-link" to="/admin" onClick={closeNavbar}>
                                         Админка
                                     </Link>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                                        Выйти
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link className="nav-link" to="/login" onClick={closeNavbar}>
                                    Вход
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;