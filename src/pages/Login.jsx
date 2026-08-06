import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdOutlineSecurity, 
  MdPersonOutline, 
  MdLockOutline, 
  MdVisibilityOff, 
  MdVisibility, 
  MdLogin 
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    toast.success('Logged in successfully!');
    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        
        <div className="login-left-col">
          <div className="left-pattern-dots"></div>
          
          <div className="brand-section">
            <h1 className="brand-title">OJS</h1>
            <p className="brand-subtitle">Open Journal Systems</p>
            <div className="brand-line"></div>
          </div>
          
          <div className="welcome-section">
            <h2>Welcome Back!</h2>
            <p>Please sign in to your admin<br/>account to continue.</p>
          </div>
          
          <div className="illustration-wrapper">
            <div className="ill-plant">
               <div className="leaf l1"></div>
               <div className="leaf l2"></div>
               <div className="leaf l3"></div>
               <div className="pot"></div>
            </div>
            <div className="ill-screen">
              <div className="ill-screen-header">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
              <div className="ill-screen-body">
                <div className="ill-profile"><MdPersonOutline /></div>
                <div className="ill-lines">
                  <div className="ill-line w-full"></div>
                  <div className="ill-line w-half"></div>
                  <div className="ill-btn"></div>
                </div>
              </div>
            </div>
            <div className="ill-shield">
              <MdOutlineSecurity />
            </div>
          </div>

          <div className="glow-circle g1"></div>
          <div className="glow-circle g2"></div>
        </div>

        <div className="login-right-col">
          <div className="login-form-container">
            <div className="form-header">
              <h2>Admin Login</h2>
              <p>Enter your credentials to access the admin panel</p>
            </div>
            
            <form onSubmit={handleLogin} className="login-form">
              <div className="input-group">
                <label>Username</label>
                <div className="input-with-icon">
                  <MdPersonOutline className="input-icon" />
                  <input type="text" placeholder="Enter your username" required />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <MdLockOutline className="input-icon" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Enter your password" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>
                </div>
              </div>

              <div className="form-options">
                <label className="remember-me">
                  <input type="checkbox" />
                  <span>Remember Me</span>
                </label>
                <a href="#" className="forgot-link">Forgot Password?</a>
              </div>

              <button type="submit" className="btn-login">
                <MdLogin className="btn-login-icon" />
                Login
              </button>
            </form>

            <div className="secure-footer">
              <MdLockOutline className="secure-icon" />
              <span>Secure login protected by OJS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
