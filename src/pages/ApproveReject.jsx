import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdFactCheck,
  MdCheckCircle,
  MdCancel,
  MdSearch,
  MdFilterList,
  MdOutlineRemoveRedEye,
  MdClose
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './ApproveReject.css';

const ApproveReject = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('All Time');
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve', 'reject'
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

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
        const now = new Date();
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        let approvedCount = 0;
        let rejectedCount = 0;

        data.forEach(j => {
          const updatedAt = new Date(j.updatedAt || j.createdAt);
          if (updatedAt >= oneWeekAgo) {
            if (j.status === 'Approved') approvedCount++;
            if (j.status === 'Rejected') rejectedCount++;
          }
        });

        // Only show journals that need approval/rejection (e.g. not already Approved/Rejected/Published)
        const pending = data.filter(j => 
          !['Approved', 'Rejected', 'Published'].includes(j.status)
        );
        
        setStats({
          pending: pending.length,
          approved: approvedCount,
          rejected: rejectedCount
        });

        const formatted = pending.map(j => ({
          _id: j._id,
          id: j.journalId,
          title: j.title,
          author: j.primaryAuthorName || (j.primaryAuthorId && j.primaryAuthorId.name) || 'Unknown',
          department: j.department || 'N/A',
          date: new Date(j.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          reviewer: (j.assignedReviewer && j.assignedReviewer.name) || 'Not Assigned',
          score: j.reviewerFeedback ? 'Evaluated' : 'Pending',
          status: j.status
        }));
        setJournals(formatted);
      }
    } catch (error) {
      toast.error('Failed to load journals');
    }
  };

  const filteredJournals = useMemo(() => {
    return journals.filter(journal => {
      const matchSearch = (journal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (journal.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (journal.author || '').toLowerCase().includes(searchTerm.toLowerCase());
                          
      let matchDate = true;
      if (dateFilter !== 'All Time') {
        const jDate = new Date(journal.date);
        const now = new Date();
        const diffTime = Math.abs(now - jDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateFilter === 'Last 7 Days') matchDate = diffDays <= 7;
        if (dateFilter === 'Last 30 Days') matchDate = diffDays <= 30;
      }

      return matchSearch && matchDate;
    });
  }, [journals, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredJournals.length / entriesPerPage);
  const currentJournals = filteredJournals.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleActionClick = (type, journal) => {
    setModalType(type);
    setSelectedJournal(journal);
    setRejectReason('');
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    if (modalType === 'reject' && !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection.');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const newStatus = modalType === 'approve' ? 'Approved' : 'Rejected';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals/${selectedJournal._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          // If the backend is ever updated to save a rejection reason, we pass it here
          reason: modalType === 'reject' ? rejectReason : undefined 
        })
      });

      if (response.ok) {
        if (modalType === 'approve') {
          toast.success(`Journal ${selectedJournal.id} has been Approved!`);
        } else {
          toast.success(`Journal ${selectedJournal.id} rejected. Reason sent to author.`);
        }
        setIsModalOpen(false);
        fetchJournals();
      } else {
        toast.error('Failed to update journal decision.');
      }
    } catch (error) {
      toast.error('Server connection error.');
    }
  };

  return (
    <div className="approve-reject-container">
      <div className="page-header">
        <h1 className="page-title">Approve / Reject Journals</h1>
        <p className="breadcrumb">Dashboard / <span>Approve-Reject</span></p>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-anim">
          <div className="stat-icon-wrap blue"><MdFactCheck /></div>
          <div className="stat-content">
            <p>Pending Decisions</p>
            <h3>{stats.pending}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.1s'}}>
          <div className="stat-icon-wrap green"><MdCheckCircle /></div>
          <div className="stat-content">
            <p>Approved This Week</p>
            <h3>{stats.approved}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.2s'}}>
          <div className="stat-icon-wrap red"><MdCancel /></div>
          <div className="stat-content">
            <p>Rejected This Week</p>
            <h3>{stats.rejected}</h3>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">Journals Awaiting Decision</h2>
          <div className="table-controls">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search title, author or ID..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-filter" 
                onClick={() => setShowDateFilter(!showDateFilter)}
              >
                <MdFilterList /> {dateFilter === 'All Time' ? 'Filter by Date' : dateFilter}
              </button>
              {showDateFilter && (
                <div className="filter-dropdown" style={{ position: 'absolute', top: '100%', right: 0, background: 'white', border: '1px solid #f3f4f6', borderRadius: '8px', zIndex: 10, minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px 0', overflow: 'hidden' }}>
                  {['All Time', 'Last 7 Days', 'Last 30 Days'].map(opt => (
                    <div 
                      key={opt} 
                      onClick={() => { setDateFilter(opt); setShowDateFilter(false); setCurrentPage(1); }}
                      style={{ padding: '8px 16px', cursor: 'pointer', fontSize: '14px', color: dateFilter === opt ? '#2563eb' : '#374151', background: dateFilter === opt ? '#eff6ff' : 'transparent', fontWeight: dateFilter === opt ? '600' : '400' }}
                      onMouseEnter={(e) => { if (dateFilter !== opt) e.target.style.background = '#f9fafb'; }}
                      onMouseLeave={(e) => { if (dateFilter !== opt) e.target.style.background = 'transparent'; }}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Journal ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Reviewer</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentJournals.length > 0 ? currentJournals.map((journal, index) => (
                <tr key={journal.id} className="table-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td><strong>{journal.id}</strong></td>
                  <td>
                    <div className="journal-title-cell">
                      {journal.title}
                    </div>
                  </td>
                  <td className="author-cell">{journal.author}</td>
                  <td>{journal.reviewer}</td>
                  <td>
                    <span className={`score-badge ${parseInt(journal.score) > 80 ? 'high' : 'medium'}`}>
                      {journal.score}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-ar">
                      <button className="btn-ar-action view" title="View Details" onClick={() => navigate(`/journals/${journal._id}`)}>
                        <MdOutlineRemoveRedEye /> View
                      </button>
                      <button className="btn-ar-action approve" title="Approve" onClick={() => handleActionClick('approve', journal)}>
                        <MdCheckCircle /> Approve
                      </button>
                      <button className="btn-ar-action reject" title="Reject" onClick={() => handleActionClick('reject', journal)}>
                        <MdCancel /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">No journals pending decision.</td>
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

      {/* Decision Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalType === 'approve' ? 'Approve Journal' : 'Reject Journal'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="decision-context">
                <p>Journal: <strong>{selectedJournal?.title}</strong></p>
                <p>Reviewer Score: <strong className={parseInt(selectedJournal?.score) > 80 ? 'text-green' : 'text-orange'}>{selectedJournal?.score}</strong></p>
              </div>

              {modalType === 'approve' ? (
                <div className="approve-confirm">
                  <div className="approve-icon-large"><MdCheckCircle /></div>
                  <h3>Confirm Approval</h3>
                  <p>Are you sure you want to approve this journal for publication?</p>
                </div>
              ) : (
                <div className="reject-confirm">
                  <div className="form-group">
                    <label>Reason for Rejection (Required)</label>
                    <textarea 
                      rows="4" 
                      placeholder="Explain why this journal is being rejected to notify the author..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              )}

              <div className="modal-actions-center">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button 
                  type="button" 
                  className={modalType === 'approve' ? 'btn-success' : 'btn-danger'} 
                  onClick={handleConfirm}
                >
                  {modalType === 'approve' ? 'Yes, Approve It' : 'Confirm Rejection'}
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

export default ApproveReject;
