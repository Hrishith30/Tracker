import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/" className="navbar-logo">
          Tracker
        </Link>
      </div>
      
      <div className="navbar-menu">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="nav-item">
              Dashboard
            </Link>
            <Link to="/expenses" className="nav-item">
              Expenses
            </Link>
            <Link to="/tasks" className="nav-item">
              Tasks
            </Link>
            <Link to="/routine" className="nav-item">
              Daily Routine
            </Link>
            <button onClick={handleLogout} className="nav-item logout-button">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-item">
              Login
            </Link>
            <Link to="/register" className="nav-item">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 