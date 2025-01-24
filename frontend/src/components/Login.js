import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Toast from './Toast';
import '../styles/Auth.css';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Invalid email or password',
        type: 'error'
      });
    }
  };

  const handleCloseToast = () => {
    setToast({ show: false, message: '', type: 'error' });
  };

  return (
    <div className="auth-container">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={handleCloseToast} 
        />
      )}
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">Welcome Back</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                className="form-input with-icon"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input with-icon"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </button>
            </div>
          </div>
          
          <div className="forgot-password" style={{ 
            textAlign: 'center', 
            marginTop: '-10px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Link 
              to="/forgot-password" 
              className="auth-link" 
              style={{ 
                fontSize: '0.85rem',
                opacity: 0.8
              }}
            >
              Forgot Password?
            </Link>
          </div>
          
          <button type="submit" className="auth-button" style={{ marginTop: '-18px' }}>
            Sign In
          </button>

          <p className="auth-subtitle" style={{ textAlign: 'center' }}>
            New here?{' '}
            <Link to="/register" className="auth-link">
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login; 