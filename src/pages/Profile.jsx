import React, { useState, useEffect } from 'react';
import { 
  MdPerson, 
  MdEmail, 
  MdPhone, 
  MdWork,
  MdCameraAlt,
  MdSecurity,
  MdSave,
  MdVerified,
  MdEdit,
  MdCancel
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = () => {
  const [formData, setFormData] = useState({
    name: 'Admin User',
    email: 'admin@ojs.com',
    phone: '',
    department: 'System Administration',
    bio: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('No authorization token found. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          department: data.department || '',
          bio: data.bio || ''
        });
      } else {
        toast.error(data.message || 'Failed to load profile');
      }
    } catch (error) {
      toast.error('Server connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          department: formData.department
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        toast.success('Profile updated successfully!', { icon: '✨', style: { borderRadius: '10px', background: '#333', color: '#fff' } });
        // Update local storage user data if needed
        const user = JSON.parse(localStorage.getItem('adminUser') || '{}');
        localStorage.setItem('adminUser', JSON.stringify({ ...user, name: data.name }));
        setIsEditing(false); // Go back to read-only mode after save
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('Server connection error');
    } finally {
      setSaving(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // If cancelling, fetch original profile to discard changes
      fetchProfile();
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return <div style={{ padding: '40px', color: '#fff' }}>Loading profile...</div>;
  }

  return (
    <div className="profile-zen-container">
      <div className="zen-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Account Settings</h1>
          <p>Manage your identity and platform preferences.</p>
        </div>
        {!isEditing && (
          <button onClick={toggleEdit} className="zen-btn-save" style={{ background: '#3b82f6' }}>
            <MdEdit /> Edit Profile
          </button>
        )}
      </div>

      <div className="zen-card slide-up-zen">
        {/* Stunning Header Banner */}
        <div className="zen-cover">
          <div className="zen-cover-overlay"></div>
          {isEditing && <button className="zen-change-cover"><MdCameraAlt /> Update Cover</button>}
        </div>

        {/* Central Identity Section */}
        <div className="zen-identity">
          <div className="zen-avatar-wrapper">
            <img src={`https://ui-avatars.com/api/?name=${formData.name.replace(' ', '+')}&background=000&color=fff&size=200`} alt="Avatar" className="zen-avatar" />
            {isEditing && <button className="zen-change-avatar"><MdCameraAlt /></button>}
          </div>
          <div className="zen-name-box">
            <h2>{formData.name} <MdVerified className="zen-verified" /></h2>
            <span className="zen-role-badge">Admin</span>
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
                  <label>Full Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={!isEditing} />
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
                  <input type="email" name="email" value={formData.email} disabled style={{opacity: 0.7, cursor: 'not-allowed'}} />
                  <small style={{color: '#94a3b8', fontSize: '11px', marginTop: '4px'}}>Email cannot be changed.</small>
                </div>
                
                <div className="zen-input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
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
                  <input type="text" name="department" value={formData.department} onChange={handleChange} disabled={!isEditing} />
                </div>
                
                <div className="zen-input-group">
                  <label>Biography</label>
                  <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} disabled={!isEditing}></textarea>
                </div>
              </div>
            </div>

            <div className="zen-form-footer">
              <button type="button" className="zen-btn-security">
                <MdSecurity /> Change Password
              </button>
              
              {isEditing && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="zen-btn-security" onClick={toggleEdit} disabled={saving} style={{ background: '#ef4444', color: '#fff', border: 'none' }}>
                    <MdCancel /> Cancel
                  </button>
                  <button type="submit" className="zen-btn-save" disabled={saving}>
                    <MdSave /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
      
      <div className="dash-footer">
        © 2026 Open Journal Systems.
      </div>
    </div>
  );
};

export default Profile;
