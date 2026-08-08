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
  const [journals, setJournals] = useState([]);
  const [activeStatFilter, setActiveStatFilter] = useState('');
  const [stats, setStats] = useState({ total: 0, published: 0, rejected: 0, underReview: 0, processing: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch user details
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Fetch user's journals to calculate stats
      const journalsRes = await fetch(`${import.meta.env.VITE_API_URL}/journals?authorId=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const journalsData = await journalsRes.json();
      
      if (response.ok) {
        setUser(data);
        if (journalsRes.ok && Array.isArray(journalsData)) {
          setJournals(journalsData);
          const newStats = {
            total: journalsData.length,
            published: journalsData.filter(j => j.status === 'Published').length,
            rejected: journalsData.filter(j => j.status === 'Rejected').length,
            underReview: journalsData.filter(j => j.status === 'Under Review').length,
            processing: journalsData.filter(j => j.status === 'Processing').length,
          };
          setStats(newStats);
        }
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
            <h3><MdDateRange className="card-icon" /> Journal Submission Stats</h3>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px', marginTop: '10px' }}>
              <div 
                onClick={() => setActiveStatFilter(activeStatFilter === 'All' ? '' : 'All')}
                style={{ background: '#EFF6FF', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: activeStatFilter === 'All' ? '2px solid #2563EB' : '2px solid transparent' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563EB' }}>{stats.total}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>Total Uploaded</div>
              </div>
              <div 
                onClick={() => setActiveStatFilter(activeStatFilter === 'Published' ? '' : 'Published')}
                style={{ background: '#F0FDF4', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: activeStatFilter === 'Published' ? '2px solid #16A34A' : '2px solid transparent' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16A34A' }}>{stats.published}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>Published</div>
              </div>
              <div 
                onClick={() => setActiveStatFilter(activeStatFilter === 'Under Review' ? '' : 'Under Review')}
                style={{ background: '#FFFBEB', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: activeStatFilter === 'Under Review' ? '2px solid #D97706' : '2px solid transparent' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#D97706' }}>{stats.underReview}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>Under Review</div>
              </div>
              <div 
                onClick={() => setActiveStatFilter(activeStatFilter === 'Rejected' ? '' : 'Rejected')}
                style={{ background: '#FEF2F2', padding: '15px', borderRadius: '10px', textAlign: 'center', cursor: 'pointer', border: activeStatFilter === 'Rejected' ? '2px solid #DC2626' : '2px solid transparent' }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#DC2626' }}>{stats.rejected}</div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '5px' }}>Rejected</div>
              </div>
            </div>
            
            {activeStatFilter && (
              <div style={{ marginTop: '20px', background: '#F9FAFB', padding: '15px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                <h4 style={{ marginBottom: '10px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
                  {activeStatFilter === 'All' ? 'All Submitted Journals' : `${activeStatFilter} Journals`}
                </h4>
                {journals.filter(j => activeStatFilter === 'All' || j.status === activeStatFilter).length > 0 ? (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#6B7280', fontWeight: 600 }}>ID</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#6B7280', fontWeight: 600 }}>Title</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#6B7280', fontWeight: 600 }}>Status</th>
                          <th style={{ textAlign: 'left', padding: '8px 0', color: '#6B7280', fontWeight: 600 }}>Submitted On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {journals.filter(j => activeStatFilter === 'All' || j.status === activeStatFilter).map(j => (
                          <tr key={j._id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                            <td style={{ padding: '8px 0', color: '#374151', fontWeight: 500 }}>{j.journalId}</td>
                            <td style={{ padding: '8px 0', color: '#111827', maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{j.title}</td>
                            <td style={{ padding: '8px 0' }}><span className={`status-badge ${j.status.toLowerCase()}`} style={{ padding: '2px 8px', fontSize: '11px' }}>{j.status}</span></td>
                            <td style={{ padding: '8px 0', color: '#6B7280' }}>{new Date(j.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>No journals found for this category.</p>
                )}
              </div>
            )}
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
