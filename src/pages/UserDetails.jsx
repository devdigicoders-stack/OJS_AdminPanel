import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdPerson, MdEmail, MdWork, MdLocationOn, MdDateRange, MdLink, MdSchool, MdPhone } from 'react-icons/md';
import { FiTwitter, FiLinkedin } from 'react-icons/fi';
import { SiGooglescholar, SiResearchgate, SiOrcid } from 'react-icons/si';
import toast from 'react-hot-toast';
import './UserDetails.css';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        toast.error(data.message || 'Failed to load user details');
      }
    } catch (error) {
      toast.error('Server error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="user-details-loading">Loading user details...</div>;
  }

  if (!user) {
    return (
      <div className="user-details-error">
        <h2>User Not Found</h2>
        <button onClick={() => navigate('/users')} className="btn-back"><MdArrowBack /> Back to Users</button>
      </div>
    );
  }

  return (
    <div className="user-details-container">
      <div className="page-header">
        <button className="btn-back" onClick={() => navigate('/users')}>
          <MdArrowBack /> Back
        </button>
        <h1 className="page-title">User Details</h1>
        <p className="breadcrumb">Dashboard / Users / <span>{user.name}</span></p>
      </div>

      <div className="user-profile-layout">
        {/* Left Column: Basic Info & Avatar */}
        <div className="profile-left">
          <div className="profile-card hero-card">
            <div className="avatar-large-wrapper">
              {user.profilePic ? (
                <img src={`${import.meta.env.VITE_API_URL.replace('/api', '')}${user.profilePic}`} alt="Profile" className="avatar-large-img" />
              ) : (
                <div className={`avatar-large ${user.avatarColor || 'blue'}`}>
                  {user.initials || user.name.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <h2 className="user-full-name">{user.title} {user.name}</h2>
            <p className="user-role-badge">{user.role}</p>
            <p className="user-status-badge">Status: <span className={user.status?.toLowerCase()}>{user.status}</span></p>

            <div className="quick-info-list">
              <div className="quick-info-item"><MdEmail className="qi-icon" /> {user.email}</div>
              <div className="quick-info-item"><MdPhone className="qi-icon" /> {user.phone || 'N/A'}</div>
              <div className="quick-info-item"><MdLocationOn className="qi-icon" /> {user.city ? `${user.city}, ${user.country}` : 'Location N/A'}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Info */}
        <div className="profile-right">
          <div className="profile-card">
            <h3><MdPerson className="card-icon" /> About / Bio</h3>
            <p className="bio-text">{user.bio || 'No biography provided by the user.'}</p>
          </div>

          <div className="profile-card">
            <h3><MdWork className="card-icon" /> Academic & Professional Details</h3>
            <div className="details-grid">
              <div className="detail-box">
                <span className="d-label">Institution</span>
                <span className="d-value">{user.institution || 'N/A'}</span>
              </div>
              <div className="detail-box">
                <span className="d-label">Department</span>
                <span className="d-value">{user.department || 'N/A'}</span>
              </div>
              <div className="detail-box">
                <span className="d-label">Designation</span>
                <span className="d-value">{user.designation || 'N/A'}</span>
              </div>
              <div className="detail-box">
                <span className="d-label">Date of Birth</span>
                <span className="d-value">{user.dob || 'N/A'}</span>
              </div>
              <div className="detail-box">
                <span className="d-label">Gender</span>
                <span className="d-value">{user.gender || 'N/A'}</span>
              </div>
              <div className="detail-box">
                <span className="d-label">Joined On</span>
                <span className="d-value">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="profile-card">
            <h3><MdSchool className="card-icon" /> Specializations</h3>
            <div className="specializations-list">
              {user.specializations && user.specializations.length > 0 ? (
                user.specializations.map((spec, index) => (
                  <span key={index} className="spec-badge">{spec}</span>
                ))
              ) : (
                <span className="no-data">No specializations added.</span>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h3><MdLink className="card-icon" /> Researcher IDs & Social Profiles</h3>
            <div className="social-links-grid">
              <div className="social-box"><SiOrcid className="s-icon orcid" /> <div><label>ORCID</label><span>{user.orcid || 'N/A'}</span></div></div>
              <div className="social-box"><SiResearchgate className="s-icon rg" /> <div><label>ResearchGate</label><span>{user.researchGate || 'N/A'}</span></div></div>
              <div className="social-box"><SiGooglescholar className="s-icon gs" /> <div><label>Google Scholar</label><span>{user.googleScholar || 'N/A'}</span></div></div>
              <div className="social-box"><MdLink className="s-icon default" /> <div><label>Scopus ID</label><span>{user.scopusId || 'N/A'}</span></div></div>
              <div className="social-box"><MdLink className="s-icon default" /> <div><label>Researcher ID</label><span>{user.researcherId || 'N/A'}</span></div></div>
              
              <div className="social-box"><FiLinkedin className="s-icon li" /> <div><label>LinkedIn</label><span>{user.linkedin || 'N/A'}</span></div></div>
              <div className="social-box"><FiTwitter className="s-icon tw" /> <div><label>Twitter</label><span>{user.twitter || 'N/A'}</span></div></div>
              <div className="social-box"><MdLink className="s-icon default" /> <div><label>Website</label><span>{user.website || 'N/A'}</span></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
