import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import Toast from '../Toast';
import { recoverUsername } from '../../services/authService';

const ForgotUsername = () => {
  const [email, setEmail] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setToast({
        show: true,
        message: 'Email is required',
        type: 'error'
      });
      return;
    }

    try {
      const response = await recoverUsername(email);
      if (response.success) {
        setToast({
          show: true,
          message: 'Username has been sent to your email!',
          type: 'success'
        });
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setToast({
          show: true,
          message: 'No account found with this email address',
          type: 'error'
        });
      }
    } catch (err) {
      setToast({
        show: true,
        message: 'Email address not found in our records',
        type: 'error'
      });
    }
  };

  return (
    <div className="auth-container">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ show: false, message: '', type: 'error' })} 
        />
      )}
      <div className="auth-box">
        <div className="auth-header">
          <h2 className="auth-title">Find Your Username</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                className="form-input with-icon"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-button">
            Send Username
          </button>

          <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '15px' }}>
            Back to{' '}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotUsername; 