import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Tracker
        </Link>
        {isMobile && (
          <button 
            className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="menu"
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>
        )}
      </div>
      
      <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Dashboard
            </Link>
            <Link to="/expenses" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Expenses
            </Link>
            <Link to="/tasks" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Tasks
            </Link>
            <Link to="/routine" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Daily Routine
            </Link>
            <button onClick={handleLogout} className="nav-item logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Login
            </Link>
            <Link to="/register" className="nav-item" onClick={() => setIsMenuOpen(false)}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 