import React, { useState } from 'react';
import { 
  MdLockOutline, 
  MdVisibility, 
  MdVisibilityOff, 
  MdShield,
  MdCheckCircle
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './ChangePassword.css';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleVisibility = (field) => {
    setShowPassword({ ...showPassword, [field]: !showPassword[field] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match!', { icon: '❌' });
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Password updated securely!', { icon: '🛡️' });
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error(data.message || 'Failed to update password');
      }
    } catch (error) {
      toast.error('Server error. Please try again later.');
    }
  };

  return (
    <div className="cp-container">
      <div className="cp-header-area">
        <h1>Security Settings</h1>
        <p>Update your password to keep your account secure.</p>
      </div>

      <div className="cp-card slide-up-cp">
        <div className="cp-card-left">
          <div className="cp-illustration">
            <div className="shield-bg">
              <MdShield className="shield-icon" />
            </div>
            <h2>Secure Your Account</h2>
            <p>We recommend using a strong password that you aren't using elsewhere. A mix of letters, numbers, and symbols is best.</p>
            
            <ul className="security-tips">
              <li><MdCheckCircle /> Minimum 8 characters long</li>
              <li><MdCheckCircle /> At least one uppercase letter</li>
              <li><MdCheckCircle /> At least one number or symbol</li>
            </ul>
          </div>
        </div>

        <div className="cp-card-right">
          <form onSubmit={handleSubmit} className="cp-form">
            
            <div className="cp-input-wrap">
              <div className="cp-input-box">
                <MdLockOutline className="cp-icon-left" />
                <input 
                  type={showPassword.current ? "text" : "password"} 
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  required
                />
                <label>Current Password</label>
                <button type="button" className="cp-icon-right" onClick={() => toggleVisibility('current')}>
                  {showPassword.current ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="cp-divider"></div>

            <div className="cp-input-wrap">
              <div className="cp-input-box">
                <MdLockOutline className="cp-icon-left" />
                <input 
                  type={showPassword.new ? "text" : "password"} 
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                />
                <label>New Password</label>
                <button type="button" className="cp-icon-right" onClick={() => toggleVisibility('new')}>
                  {showPassword.new ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="cp-input-wrap">
              <div className="cp-input-box">
                <MdLockOutline className="cp-icon-left" />
                <input 
                  type={showPassword.confirm ? "text" : "password"} 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <label>Confirm New Password</label>
                <button type="button" className="cp-icon-right" onClick={() => toggleVisibility('confirm')}>
                  {showPassword.confirm ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            <div className="cp-actions">
              <button type="button" className="cp-btn-cancel" onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}>
                Clear
              </button>
              <button type="submit" className="cp-btn-submit">
                Update Password
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="dash-footer cp-footer">
        © 2025 Journal of society, behaviour and institutions. Secure Platform.
      </div>
    </div>
  );
};

export default ChangePassword;
