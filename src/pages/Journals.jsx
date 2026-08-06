import React, { useState, useMemo } from 'react';
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

const initialJournals = [
  { id: 'J-2026-001', title: 'AI in Healthcare: A Systematic Review', author: 'Dr. Rahul Sharma', department: 'Computer Science', date: 'Aug 01, 2026', status: 'Pending Review', doi: '10.1234/ai.2026' },
  { id: 'J-2026-002', title: 'Quantum Computing Dynamics', author: 'Priya Verma', department: 'Physics', date: 'Aug 02, 2026', status: 'Reviewed', doi: '10.1234/qc.2026' },
  { id: 'J-2026-003', title: 'Advanced Calculus Methods', author: 'Amit Patel', department: 'Mathematics', date: 'Aug 04, 2026', status: 'Published', doi: '10.1234/math.2026' },
  { id: 'J-2026-004', title: 'Sustainable Energy Transitions', author: 'Dr. Sarah Johnson', department: 'Environmental', date: 'Aug 05, 2026', status: 'Rejected', doi: '-' },
  { id: 'J-2026-005', title: 'Machine Learning in Finance', author: 'James Wilson', department: 'Economics', date: 'Aug 10, 2026', status: 'Pending Review', doi: '-' },
  { id: 'J-2026-006', title: 'Neural Networks Architecture', author: 'Dr. Emily Davis', department: 'Computer Science', date: 'Aug 12, 2026', status: 'Published', doi: '10.1234/nn.2026' },
];

const Journals = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState(initialJournals);
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
      const matchesSearch = journal.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            journal.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            journal.id.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  const handleConfirmAction = () => {
    if (modalType === 'reviewer') {
      toast.success(`Reviewer ${reviewerName} assigned successfully to ${selectedJournal.id}!`);
    } else if (modalType === 'status') {
      setJournals(journals.map(j => j.id === selectedJournal.id ? { ...j, status: newStatus } : j));
      toast.success(`Journal ${selectedJournal.id} status updated to ${newStatus}`);
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
                <tr key={journal.id} className="table-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td><strong>{journal.id}</strong></td>
                  <td>
                    <div className="journal-title-cell">
                      {journal.title}
                    </div>
                  </td>
                  <td className="author-cell">{journal.author}</td>
                  <td>{journal.department}</td>
                  <td className="date-cell">{journal.date}</td>
                  <td>
                    <span className={`status-badge-j ${journal.status.replace(' ', '-').toLowerCase()}`}>
                      {journal.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view" title="View Details" onClick={() => navigate(`/journals/${journal.id}`)}><MdOutlineRemoveRedEye /></button>
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
                  <label>Select Reviewer for {selectedJournal?.id}</label>
                  <select value={reviewerName} onChange={(e) => setReviewerName(e.target.value)}>
                    <option value="">-- Choose Reviewer --</option>
                    <option value="Dr. Alan Turing">Dr. Alan Turing</option>
                    <option value="Dr. Marie Curie">Dr. Marie Curie</option>
                    <option value="Dr. Isaac Newton">Dr. Isaac Newton</option>
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
