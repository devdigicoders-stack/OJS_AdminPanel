import React, { useState } from 'react';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdWork,
  MdCameraAlt,
  MdSecurity,
  MdSave,
  MdVerified
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@ojs.com',
    phone: '+1 234 567 8900',
    department: 'System Administration',
    bio: 'Lead System Administrator for the Open Journal Systems platform. Dedicated to ensuring a seamless and blazing-fast experience.'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Profile updated to perfection!', { icon: '✨', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
  };

  return (
    <div className="profile-zen-container">
      <div className="zen-header">
        <h1>Account Settings</h1>
        <p>Manage your identity and platform preferences.</p>
      </div>

      <div className="zen-card slide-up-zen">
        {/* Stunning Header Banner */}
        <div className="zen-cover">
          <div className="zen-cover-overlay"></div>
          <button className="zen-change-cover"><MdCameraAlt /> Update Cover</button>
        </div>

        {/* Central Identity Section */}
        <div className="zen-identity">
          <div className="zen-avatar-wrapper">
            <img src="https://ui-avatars.com/api/?name=Admin+User&background=000&color=fff&size=200" alt="Avatar" className="zen-avatar" />
            <button className="zen-change-avatar"><MdCameraAlt /></button>
          </div>
          <div className="zen-name-box">
            <h2>{formData.firstName} {formData.lastName} <MdVerified className="zen-verified" /></h2>
            <span className="zen-role-badge">Super Administrator</span>
          </div>
        </div>

        {/* Bento Box Layout for Content */}
        <div className="zen-content">
          <form onSubmit={handleSave} className="zen-form">
            
            <div className="zen-form-grid">
              {/* Personal Info Bento */}
              <div className="zen-bento-box">
                <div className="bento-header">
                  <div className="bento-icon"><MdPerson /></div>
                  <h3>Personal Details</h3>
                </div>
                
                <div className="zen-input-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                
                <div className="zen-input-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
              </div>

              {/* Contact Info Bento */}
              <div className="zen-bento-box">
                <div className="bento-header">
                  <div className="bento-icon blue"><MdEmail /></div>
                  <h3>Contact Info</h3>
                </div>
                
                <div className="zen-input-group">
                  <label>Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                
                <div className="zen-input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                </div>
              </div>

              {/* Professional Info Bento (Spans full width) */}
              <div className="zen-bento-box full-width">
                <div className="bento-header">
                  <div className="bento-icon purple"><MdWork /></div>
                  <h3>Professional Summary</h3>
                </div>
                
                <div className="zen-input-group">
                  <label>Department</label>
                  <input type="text" name="department" value={formData.department} onChange={handleChange} />
                </div>
                
                <div className="zen-input-group">
                  <label>Biography</label>
                  <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange}></textarea>
                </div>
              </div>
            </div>

            <div className="zen-form-footer">
              <button type="button" className="zen-btn-security">
                <MdSecurity /> Request Password Reset
              </button>
              <button type="submit" className="zen-btn-save">
                <MdSave /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="dash-footer">
        © 2025 Open Journal Systems.
      </div>
    </div>
  );
};

export default Profile;
