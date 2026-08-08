import React, { useState, useMemo } from 'react';
import {
  MdCampaign,
  MdAdd,
  MdEdit,
  MdDeleteOutline,
  MdSearch,
  MdFilterList,
  MdClose,
  MdOutlineAccessTime,
  MdCheckCircle,
  MdToggleOn,
  MdToggleOff
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Announcements.css';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'delete'
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: 'General', expiryDate: '', status: 'Draft', media: null });

  React.useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
      }
    } catch (error) {
      toast.error('Failed to load announcements');
    }
  };

  const handleToggleStatus = async (ann) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${ann._id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('Status updated successfully!');
        fetchAnnouncements();
      } else {
        toast.error('Failed to toggle status');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const filteredAnn = useMemo(() => {
    return announcements.filter(a =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [announcements, searchTerm]);

  const handleOpenModal = (type, ann = null) => {
    setModalType(type);
    setSelectedAnn(ann);
    if (type === 'edit' && ann) {
      setFormData({ 
        title: ann.title, 
        category: ann.category, 
        expiryDate: ann.expiryDate ? new Date(ann.expiryDate).toISOString().split('T')[0] : '',
        status: ann.status,
        media: null
      });
    } else {
      setFormData({ title: '', category: 'General', expiryDate: '', status: 'Draft', media: null });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem('adminToken');
    
    try {
      if (modalType === 'delete') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${selectedAnn._id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          toast.success('Announcement deleted successfully!');
          fetchAnnouncements();
        } else toast.error('Failed to delete announcement');
      } 
      else if (modalType === 'add') {
        if (!formData.title) return toast.error('Title is required');
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('expiryDate', formData.expiryDate);
        data.append('status', formData.status);
        if (formData.media) data.append('media', formData.media);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
          body: data
        });
        if (response.ok) {
          toast.success('New announcement created!');
          fetchAnnouncements();
        } else toast.error('Failed to create announcement');
      } 
      else if (modalType === 'edit') {
        if (!formData.title) return toast.error('Title is required');
        
        const data = new FormData();
        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('expiryDate', formData.expiryDate);
        data.append('status', formData.status);
        if (formData.media) data.append('media', formData.media);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/announcements/${selectedAnn._id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}` 
          },
          body: data
        });
        if (response.ok) {
          toast.success('Announcement updated!');
          fetchAnnouncements();
        } else toast.error('Failed to update announcement');
      }
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Server error');
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Alert': return 'red';
      case 'News': return 'blue';
      default: return 'purple';
    }
  };

  return (
    <div className="announcements-container">
      <div className="page-header">
        <h1 className="page-title">Manage Announcements</h1>
        <p className="breadcrumb">Dashboard / <span>Announcements</span></p>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-anim">
          <div className="stat-icon-wrap blue"><MdCampaign /></div>
          <div className="stat-content">
            <p>Total Announcements</p>
            <h3>{announcements.length}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrap green"><MdCheckCircle /></div>
          <div className="stat-content">
            <p>Active / Published</p>
            <h3>{announcements.filter(a => a.status === 'Published').length}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrap orange"><MdOutlineAccessTime /></div>
          <div className="stat-content">
            <p>Drafts</p>
            <h3>{announcements.filter(a => a.status === 'Draft').length}</h3>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">Announcement List</h2>
          <div className="table-controls">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={() => handleOpenModal('add')}>
              <MdAdd /> Create New
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Title & ID</th>
                <th>Category</th>
                <th>Publish Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAnn.length > 0 ? filteredAnn.map((ann, index) => (
                <tr key={ann._id} className="table-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td>
                    <div className="ann-title-cell">
                      <span className="ann-id">{ann.announcementId}</span>
                      <span className="ann-title">{ann.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`cat-badge ${getCategoryColor(ann.category)}`}>
                      {ann.category}
                    </span>
                  </td>
                  <td>{ann.publishDate ? new Date(ann.publishDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{ann.expiryDate ? new Date(ann.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge-inline ${ann.status === 'Published' ? 'green' : 'yellow'}`}>
                      {ann.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-ar">
                      <button 
                        className={`btn-ar-action ${ann.status === 'Published' ? 'delete' : 'edit'}`} 
                        title={ann.status === 'Published' ? 'Deactivate (Set to Draft)' : 'Activate (Publish)'}
                        onClick={() => handleToggleStatus(ann)}
                      >
                        {ann.status === 'Published' ? <MdToggleOn size={20} /> : <MdToggleOff size={20} />}
                        {ann.status === 'Published' ? ' Deactivate' : ' Activate'}
                      </button>
                      <button className="btn-ar-action edit" title="Edit" onClick={() => handleOpenModal('edit', ann)}>
                        <MdEdit /> Edit
                      </button>
                      <button className="btn-ar-action delete" title="Delete" onClick={() => handleOpenModal('delete', ann)}>
                        <MdDeleteOutline /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">No announcements found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'add' ? 'Create Announcement' :
                  modalType === 'edit' ? 'Edit Announcement' : 'Delete Announcement'}
              </h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>
            <div className="modal-body">

              {modalType === 'delete' ? (
                <div className="delete-confirm">
                  <div className="delete-icon-large"><MdDeleteOutline /></div>
                  <h3>Are you sure?</h3>
                  <p>You are about to delete <strong>{selectedAnn?.title}</strong>. This action cannot be undone.</p>
                </div>
              ) : (
                <form id="annForm" onSubmit={handleSubmit} className="ann-form">
                  <div className="form-group">
                    <label>Announcement Title</label>
                    <input
                      type="text"
                      placeholder="e.g. System Maintenance"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      autoFocus
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Media (Image/PDF) <span style={{fontSize: '11px', color: '#666'}}>(Optional)</span></label>
                      <input 
                        type="file" 
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                        onChange={(e) => setFormData({...formData, media: e.target.files[0]})}
                        className="form-input"
                      />
                      {modalType === 'edit' && selectedAnn?.mediaPath && (
                        <p style={{fontSize: '12px', marginTop: '4px', color: '#2563EB'}}>
                          <a href={`${import.meta.env.VITE_API_URL.replace('/api', '')}/${selectedAnn.mediaPath}`} target="_blank" rel="noreferrer">
                            View Current Media
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="Alert">Alert</option>
                        <option value="News">News</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        value={formData.expiryDate}
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                      />
                    </div>
                  </div>
                </form>
              )}

              <div className="modal-actions-center">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button
                  type="submit"
                  form={modalType !== 'delete' ? "annForm" : undefined}
                  onClick={modalType === 'delete' ? handleSubmit : undefined}
                  className={`btn-submit ${modalType === 'delete' ? 'danger' : 'primary'}`}
                >
                  {modalType === 'delete' ? 'Yes, Delete It' : 'Save Announcement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dash-footer">
        © 2025 Journal of society, behaviour and institutions. All rights reserved.
      </div>
    </div>
  );
};

export default Announcements;
