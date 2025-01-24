import { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const toastStyle = type === 'success' 
    ? {
        backgroundColor: '#4caf50',  // Brighter green
        color: '#ffffff',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        fontSize: '16px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        padding: '18px 28px',
        borderRadius: '8px',
        minWidth: '400px',
        textAlign: 'center',  // Center text horizontally
        transform: 'translateX(-50%)',
        position: 'fixed',
        top: '140px',
        left: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',      // Added flex display
        alignItems: 'center', // Center text vertically
        justifyContent: 'center', // Center text horizontally
        margin: '0 auto'      // Additional centering
      }
    : {
        backgroundColor: '#e53935',  // Brighter red
        color: '#ffffff',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
        fontSize: '16px',
        fontWeight: '600',
        letterSpacing: '0.5px',
        padding: '18px 28px',
        borderRadius: '8px',
        minWidth: '400px',
        textAlign: 'center',  // Center text horizontally
        transform: 'translateX(-50%)',
        position: 'fixed',
        top: '140px',
        left: '50%',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',      // Added flex display
        alignItems: 'center', // Center text vertically
        justifyContent: 'center', // Center text horizontally
        margin: '0 auto'      // Additional centering
      };

  return (
    <div className="toast" style={toastStyle}>
      {message}
    </div>
  );
};

export default Toast; 