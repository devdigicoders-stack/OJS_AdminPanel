import React, { useState } from 'react';
import { 
  MdSync, 
  MdSearch,
  MdCheckCircle,
  MdPendingActions,
  MdHistory
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './UpdateStatus.css';

const initialJournals = [
  { id: 'J-2026-001', title: 'AI in Healthcare: A Systematic Review', author: 'Dr. Rahul Sharma', currentStatus: 'Pending Review', lastUpdated: '2 hours ago' },
  { id: 'J-2026-002', title: 'Quantum Computing Dynamics', author: 'Priya Verma', currentStatus: 'Reviewed', lastUpdated: '1 day ago' },
  { id: 'J-2026-003', title: 'Advanced Calculus Methods', author: 'Amit Patel', currentStatus: 'Approved', lastUpdated: '3 days ago' },
  { id: 'J-2026-005', title: 'Machine Learning in Finance', author: 'James Wilson', currentStatus: 'Pending Review', lastUpdated: '5 days ago' },
  { id: 'J-2026-007', title: 'Cybersecurity Protocols', author: 'Alex Johnson', currentStatus: 'In Revision', lastUpdated: '1 week ago' },
];

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
  const [journals, setJournals] = useState(initialJournals);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track changes locally before saving
  const [pendingChanges, setPendingChanges] = useState({});

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

  const handleUpdateSingle = (id) => {
    const newStatus = pendingChanges[id];
    setJournals(journals.map(j => 
      j.id === id ? { ...j, currentStatus: newStatus, lastUpdated: 'Just now' } : j
    ));
    
    const newChanges = { ...pendingChanges };
    delete newChanges[id];
    setPendingChanges(newChanges);
    
    toast.success(`Status for ${id} updated to ${newStatus}`);
  };

  const handleUpdateAll = () => {
    const idsToUpdate = Object.keys(pendingChanges);
    if (idsToUpdate.length === 0) return;

    setJournals(journals.map(j => {
      if (pendingChanges[j.id]) {
        return { ...j, currentStatus: pendingChanges[j.id], lastUpdated: 'Just now' };
      }
      return j;
    }));
    
    setPendingChanges({});
    toast.success(`${idsToUpdate.length} journal statuses updated successfully!`);
  };

  const filteredJournals = journals.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.id.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <span className="j-id">{journal.id}</span>
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
        © 2025 Open Journal Systems. All rights reserved.
      </div>
    </div>
  );
};

export default UpdateStatus;
