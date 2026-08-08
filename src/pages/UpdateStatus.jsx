import React, { useState, useEffect } from 'react';
import { 
  MdSync, 
  MdSearch,
  MdCheckCircle,
  MdPendingActions,
  MdHistory
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './UpdateStatus.css';

const STATUS_OPTIONS = [
  'Pending Review',
  'In Revision',
  'Reviewed',
  'Approved',
  'Published',
  'Rejected'
];

const getStatusColor = (status) => {
  switch (status) {
    case 'Published': return 'green';
    case 'Approved': return 'blue';
    case 'Reviewed': return 'purple';
    case 'In Revision': return 'orange';
    case 'Pending Review': return 'yellow';
    case 'Rejected': return 'red';
    default: return 'gray';
  }
};

const UpdateStatus = () => {
  const [journals, setJournals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track changes locally before saving
  const [pendingChanges, setPendingChanges] = useState({});

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        const formatted = data.map(j => ({
          id: j._id,
          journalId: j.journalId,
          title: j.title,
          author: j.primaryAuthorName || (j.primaryAuthorId && j.primaryAuthorId.name) || 'Unknown',
          currentStatus: j.status,
          lastUpdated: new Date(j.updatedAt).toLocaleDateString()
        }));
        setJournals(formatted);
      }
    } catch (error) {
      toast.error('Failed to load journals');
    }
  };

  const handleStatusChange = (id, newStatus) => {
    const journal = journals.find(j => j.id === id);
    if (journal.currentStatus !== newStatus) {
      setPendingChanges(prev => ({ ...prev, [id]: newStatus }));
    } else {
      const newChanges = { ...pendingChanges };
      delete newChanges[id];
      setPendingChanges(newChanges);
    }
  };

  const handleUpdateSingle = async (id) => {
    const newStatus = pendingChanges[id];
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        toast.success(`Status updated to ${newStatus}`);
        setPendingChanges(prev => {
          const newChanges = { ...prev };
          delete newChanges[id];
          return newChanges;
        });
        fetchJournals();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const handleUpdateAll = async () => {
    const idsToUpdate = Object.keys(pendingChanges);
    if (idsToUpdate.length === 0) return;

    try {
      const token = localStorage.getItem('adminToken');
      const updates = idsToUpdate.map(id => ({ id, status: pendingChanges[id] }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals/bulk-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ updates })
      });

      if (response.ok) {
        toast.success(`${idsToUpdate.length} journal statuses updated successfully!`);
        setPendingChanges({});
        fetchJournals();
      } else {
        toast.error('Failed to update bulk status');
      }
    } catch (error) {
      toast.error('Server error');
    }
  };

  const filteredJournals = journals.filter(j => 
    (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (j.journalId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = Object.keys(pendingChanges).length;

  return (
    <div className="update-status-container">
      <div className="page-header">
        <h1 className="page-title">Update Journal Status</h1>
        <p className="breadcrumb">Dashboard / <span>Update Status</span></p>
      </div>

      <div className="status-workflow-card fade-in">
        <div className="workflow-header">
          <div>
            <h3>Status Workflow Guide</h3>
            <p>Journals typically follow this progression through the system.</p>
          </div>
        </div>
        <div className="workflow-steps">
          {STATUS_OPTIONS.map((status, index) => (
            <div key={status} className="workflow-step">
              <div className={`step-circle ${getStatusColor(status)}`}>{index + 1}</div>
              <span className="step-label">{status}</span>
              {index < STATUS_OPTIONS.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="table-card slide-up">
        <div className="table-header-top">
          <div className="table-title-group">
            <h2 className="table-title">Quick Status Update</h2>
            {pendingCount > 0 && (
              <span className="pending-badge">{pendingCount} unsaved changes</span>
            )}
          </div>
          
          <div className="table-controls">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search journal ID or title..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              className={`btn-primary ${pendingCount === 0 ? 'disabled' : ''}`}
              onClick={handleUpdateAll}
              disabled={pendingCount === 0}
            >
              <MdCheckCircle /> Update All Selected
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table status-table">
            <thead>
              <tr>
                <th>Journal Info</th>
                <th>Current Status</th>
                <th>Last Updated</th>
                <th>New Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredJournals.length > 0 ? filteredJournals.map((journal, index) => {
                const hasChange = !!pendingChanges[journal.id];
                const selectedStatus = pendingChanges[journal.id] || journal.currentStatus;
                
                return (
                  <tr key={journal.id} className={hasChange ? 'row-highlight' : ''} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>
                      <div className="journal-info-cell">
                        <span className="j-id">{journal.journalId}</span>
                        <span className="j-title">{journal.title}</span>
                        <span className="j-author">by {journal.author}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge-inline ${getStatusColor(journal.currentStatus)}`}>
                        {journal.currentStatus}
                      </span>
                    </td>
                    <td className="time-cell">
                      <MdHistory className="time-icon" /> {journal.lastUpdated}
                    </td>
                    <td>
                      <div className="status-select-wrapper">
                        <select 
                          className={`status-select ${hasChange ? 'changed' : ''}`}
                          value={selectedStatus}
                          onChange={(e) => handleStatusChange(journal.id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`action-btn-update ${hasChange ? 'active' : ''}`}
                        onClick={() => handleUpdateSingle(journal.id)}
                        disabled={!hasChange}
                        title={hasChange ? 'Save this change' : 'No changes'}
                      >
                        <MdSync /> Update
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="5" className="empty-state">No journals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="dash-footer">
        © 2025 Journal of society, behaviour and institutions. All rights reserved.
      </div>
    </div>
  );
};

export default UpdateStatus;
