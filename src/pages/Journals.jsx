import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdLibraryBooks, 
  MdSearch, 
  MdFilterList, 
  MdOutlineRemoveRedEye,
  MdArrowUpward,
  MdArrowDownward,
  MdPendingActions,
  MdPublish,
  MdClose,
  MdFileDownload,
  MdPersonAdd,
  MdCheck
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Journals.css'; 

const Journals = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Journals');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'reviewer', 'status'
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [reviewerName, setReviewerName] = useState('');
  const [newStatus, setNewStatus] = useState('');

  // Filtering Logic
  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchesSearch = (journal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (journal.primaryAuthorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (journal.journalId || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'Published') matchesTab = journal.status === 'Published';
      if (activeTab === 'Reviewed') matchesTab = journal.status === 'Reviewed';
      if (activeTab === 'Pending Review') matchesTab = journal.status === 'Pending Review';
      if (activeTab === 'Rejected') matchesTab = journal.status === 'Rejected';

      return matchesSearch && matchesTab;
    });
  }, [journals, searchTerm, activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredJournals.length / entriesPerPage);
  const currentJournals = filteredJournals.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const counts = {
    'All Journals': journals.length,
    'Published': journals.filter(j => j.status === 'Published').length,
    'Reviewed': journals.filter(j => j.status === 'Reviewed').length,
    'Pending Review': journals.filter(j => j.status === 'Pending Review').length,
    'Rejected': journals.filter(j => j.status === 'Rejected').length,
  };

  const handleOpenModal = (type, journal, targetStatus = '') => {
    setModalType(type);
    setSelectedJournal(journal);
    setNewStatus(targetStatus);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJournal(null);
    setReviewerName('');
  };

  useEffect(() => {
    fetchJournals();
    fetchReviewers();
  }, []);

  const fetchJournals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setJournals(data);
      }
    } catch (error) {
      toast.error('Failed to fetch journals');
    }
  };

  const fetchReviewers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/reviewers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setReviewers(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmAction = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      let url = '';
      let body = {};
      
      if (modalType === 'reviewer') {
        url = `${import.meta.env.VITE_API_URL}/journals/${selectedJournal._id}/assign`;
        body = { reviewerId: reviewerName }; // reviewerName holds reviewer ID here
      } else if (modalType === 'status') {
        url = `${import.meta.env.VITE_API_URL}/journals/${selectedJournal._id}/status`;
        body = { status: newStatus };
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(modalType === 'reviewer' ? 'Reviewer assigned successfully!' : `Status updated to ${newStatus}`);
        fetchJournals(); 
      } else {
        toast.error(data.message || 'Action failed');
      }
    } catch (error) {
      toast.error('Action failed due to server error');
    }
    handleCloseModal();
  };

  return (
    <div className="journals-container">
      
      <div className="page-header">
        <h1 className="page-title">Manage Journals</h1>
        <p className="breadcrumb">Dashboard / <span>Manage Journals</span></p>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-anim">
          <div className="stat-icon-wrap blue"><MdLibraryBooks /></div>
          <div className="stat-content">
            <p>Total Journals</p>
            <h3>{journals.length}</h3>
            <span className="trend positive"><MdArrowUpward/> 8.3% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.1s'}}>
          <div className="stat-icon-wrap purple"><MdPublish /></div>
          <div className="stat-content">
            <p>Published</p>
            <h3>{journals.filter(j => j.status === 'Published').length}</h3>
            <span className="trend positive"><MdArrowUpward/> 12.1% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.2s'}}>
          <div className="stat-icon-wrap orange"><MdPendingActions /></div>
          <div className="stat-content">
            <p>Pending Review</p>
            <h3>{journals.filter(j => j.status === 'Pending Review').length}</h3>
            <span className="trend negative"><MdArrowDownward/> 5.2% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.3s'}}>
          <div className="stat-icon-wrap red"><MdClose /></div>
          <div className="stat-content">
            <p>Rejected</p>
            <h3>{journals.filter(j => j.status === 'Rejected').length}</h3>
            <span className="trend positive"><MdArrowUpward/> 2.1% <span>from last month</span></span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">Journal Directory</h2>
          <div className="table-controls">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search journals by title, ID..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="btn-filter"><MdFilterList /> Filter by Date</button>
          </div>
        </div>

        <div className="table-tabs">
          {Object.keys(counts).map(tab => (
            <button 
              key={tab} 
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab} <span className="count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Journal ID</th>
                <th>Title &uarr;&darr;</th>
                <th>Author</th>
                <th>Department</th>
                <th>Sub. Date &uarr;&darr;</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentJournals.length > 0 ? currentJournals.map((journal, index) => (
                <tr key={journal._id} className="table-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td><strong>{journal.journalId}</strong></td>
                  <td>
                    <div className="journal-title-cell">
                      {journal.title}
                    </div>
                  </td>
                  <td className="author-cell">{journal.primaryAuthorName}</td>
                  <td>{journal.department}</td>
                  <td className="date-cell">{new Date(journal.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge-j ${journal.status.replace(' ', '-').toLowerCase()}`}>
                      {journal.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Details" onClick={() => navigate(`/journals/${journal._id}`)}><MdOutlineRemoveRedEye /></button>
                      <button className="action-btn download" title="Download PDF"><MdFileDownload /></button>
                      
                      <div className="divider"></div>
                      
                      <button className="action-btn assign" title="Assign Reviewer" onClick={() => handleOpenModal('reviewer', journal)}><MdPersonAdd /></button>
                      
                      {journal.status === 'Pending Review' && (
                        <button className="action-btn approve" title="Mark as Reviewed" onClick={() => handleOpenModal('status', journal, 'Reviewed')}><MdCheck /></button>
                      )}
                      
                      {journal.status === 'Reviewed' && (
                        <button className="action-btn publish" title="Publish Journal" onClick={() => handleOpenModal('status', journal, 'Published')}><MdPublish /></button>
                      )}
                      
                      {(journal.status === 'Pending Review' || journal.status === 'Reviewed') && (
                         <button className="action-btn reject" title="Reject Journal" onClick={() => handleOpenModal('status', journal, 'Rejected')}><MdClose /></button>
                      )}
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="empty-state">No journals found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="entries-info">
            Show 
            <select 
              className="entries-select" 
              value={entriesPerPage} 
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>
          <div className="showing-info">
            Showing {filteredJournals.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredJournals.length)} of {filteredJournals.length} entries
          </div>
          <div className="pagination">
            <button className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&laquo;</button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className={`page-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&raquo;</button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'reviewer' ? 'Assign Reviewer' : 'Update Status'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>
            <div className="modal-body">
              {modalType === 'reviewer' ? (
                <div className="form-group">
                  <label>Select Reviewer for {selectedJournal?.journalId}</label>
                  <select value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}>
                    <option value="">-- Choose Reviewer --</option>
                    {reviewers.map(rev => (
                      <option key={rev._id} value={rev._id}>{rev.name} ({rev.department})</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="status-confirm-text">
                  <p>Are you sure you want to change the status of <strong>{selectedJournal?.title}</strong> to <strong>{newStatus}</strong>?</p>
                </div>
              )}
              
              <div className="modal-actions">
                <button className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                <button 
                  className="btn-primary" 
                  onClick={handleConfirmAction}
                  disabled={modalType === 'reviewer' && !reviewerName}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="dash-footer">
        © 2025 Open Journal Systems. All rights reserved.
      </div>
    </div>
  );
};

export default Journals;
