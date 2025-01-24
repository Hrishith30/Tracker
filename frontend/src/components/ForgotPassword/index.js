import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../../services/api';
import Toast from '../Toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './ForgotPassword.css';
import { validatePassword } from '../../utils/validation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      await authApi.forgotPassword(email);
      setStep(2);
      setToast({
        show: true,
        message: 'OTP sent to your email',
        type: 'success'
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Error sending OTP',
        type: 'error'
      });
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      // Add a new endpoint to verify OTP
      await authApi.verifyOTP(email, otp);
      setStep(3);
      setToast({
        show: true,
        message: 'OTP verified successfully',
        type: 'success'
      });
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Invalid OTP',
        type: 'error'
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setToast({
        show: true,
        message: passwordError,
        type: 'error'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setToast({
        show: true,
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (newPassword.length < 6) {
      setToast({
        show: true,
        message: 'Password must be at least 6 characters long',
        type: 'error'
      });
      return;
    }

    try {
      await authApi.resetPassword(email, otp, newPassword);
      setToast({
        show: true,
        message: 'Password reset successful',
        type: 'success'
      });
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      setToast({
        show: true,
        message: err.response?.data?.message || 'Error resetting password',
        type: 'error'
      });
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleRequestOTP}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>
            <button type="submit" className="auth-button">
              Send OTP
            </button>
          </form>
        );

      case 2:
        return (
          <form onSubmit={handleVerifyOTP}>
            <div className="form-group">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter OTP sent to your email"
                maxLength="6"
              />
            </div>
            <button type="submit" className="auth-button">
              Verify OTP
            </button>
          </form>
        );

      case 3:
        return (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <div className="password-input-container">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="password-input-container">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  minLength="6"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
            <button type="submit" className="auth-button">
              Reset Password
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
      <div className="auth-box">
        <h2>Reset Password</h2>
        {renderStep()}
        <p className="auth-subtitle">
          Remember your password? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword; 