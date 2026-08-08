import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdOutlineSecurity,
  MdOutlineEmail,
  MdLockOutline,
  MdVisibilityOff,
  MdVisibility,
  MdLogin
} from 'react-icons/md';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token && token !== 'undefined' && token !== 'null') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Logged in successfully!');
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">

        <div className="login-left-col">
          <div className="left-pattern-dots"></div>

          <div className="brand-section" style={{ textAlign: 'left', marginBottom: '30px' }}>
            <div style={{ marginBottom: '16px', display: 'inline-block' }}>
              <img src={logo} alt="Praxis Logo" style={{ height: '70px', objectFit: 'contain' }} />
            </div>
            <p className="brand-subtitle" style={{ color: '#fff', fontSize: '14px', margin: '0' }}>Journal of society, behaviour and institutions</p>
            <div className="brand-line" style={{ width: '40px', height: '3px', background: '#3b82f6', marginTop: '10px' }}></div>
          </div>

          <div className="welcome-section">
            <h2>Welcome Back!</h2>
            <p>Please sign in to your admin<br />account to continue.</p>
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
                <div className="ill-profile"><MdOutlineEmail /></div>
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
                <label>Email Address</label>
                <div className="input-with-icon">
                  <MdOutlineEmail className="input-icon" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <MdLockOutline className="input-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                {/* <a href="#" className="forgot-link">Forgot Password?</a> */}
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                <MdLogin className="btn-login-icon" />
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="secure-footer">
              <MdLockOutline className="secure-icon" />
              <span>Secure login protected by Praxis</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
