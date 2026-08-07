import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MdSend,
  MdCheckCircle,
  MdOutlinePublic,
  MdSearch,
  MdFilterList,
  MdOutlineRemoveRedEye,
  MdClose,
  MdRocketLaunch
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Publish.css';

const Publish = () => {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [stats, setStats] = useState({ ready: 0, publishedThisMonth: 0, totalPublished: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState(null);
  
  // Publish Form State
  const [publishForm, setPublishForm] = useState({
    doi: '',
    volume: 'Vol. 12',
    issue: 'Issue 3'
  });

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
        let readyCount = 0;
        let publishedThisMonth = 0;
        let totalPublished = 0;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        data.forEach(j => {
          if (['Reviewed', 'Processed', 'Approved'].includes(j.status)) readyCount++;
          if (j.status === 'Published') {
            totalPublished++;
            const updatedAt = new Date(j.updatedAt || j.createdAt);
            if (updatedAt >= firstDayOfMonth) publishedThisMonth++;
          }
        });

        setStats({ ready: readyCount, publishedThisMonth, totalPublished });

        // Show journals that are ready to publish
        const readyToPublish = data.filter(j => ['Reviewed', 'Processed', 'Approved'].includes(j.status));
        
        const formatted = readyToPublish.map(j => ({
          _id: j._id,
          id: j.journalId || j._id.substring(0,8),
          title: j.title,
          author: j.primaryAuthorName || (j.primaryAuthorId && j.primaryAuthorId.name) || 'Unknown',
          department: j.department || 'N/A',
          approvedDate: new Date(j.updatedAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          status: 'Ready to Publish'
        }));
        setJournals(formatted);
      }
    } catch (error) {
      toast.error('Failed to load journals');
    }
  };

  const filteredJournals = useMemo(() => {
    return journals.filter(journal => 
      (journal.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (journal.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (journal.author || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [journals, searchTerm]);

  const totalPages = Math.ceil(filteredJournals.length / entriesPerPage);
  const currentJournals = filteredJournals.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const handleActionClick = (journal) => {
    setSelectedJournal(journal);
    setPublishForm({ doi: `10.1234/ojs.${journal.id.toLowerCase()}`, volume: 'Vol. 12', issue: 'Issue 3' });
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    if (!publishForm.doi.trim()) {
      toast.error('DOI is required for publication.');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journals/${selectedJournal._id}/publish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          doi: publishForm.doi,
          volume: publishForm.volume,
          issue: publishForm.issue
        })
      });

      if (response.ok) {
        toast.success(`Journal ${selectedJournal.id} has been successfully Published!`, { icon: '🚀' });
        setIsModalOpen(false);
        fetchJournals();
      } else {
        toast.error('Failed to publish journal.');
      }
    } catch (error) {
      toast.error('Server connection error.');
    }
  };

  return (
    <div className="publish-container">
      <div className="page-header">
        <h1 className="page-title">Publish Journals</h1>
        <p className="breadcrumb">Dashboard / <span>Publish</span></p>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-anim">
          <div className="stat-icon-wrap blue"><MdSend /></div>
          <div className="stat-content">
            <p>Ready to Publish</p>
            <h3>{stats.ready}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.1s'}}>
          <div className="stat-icon-wrap green"><MdOutlinePublic /></div>
          <div className="stat-content">
            <p>Published This Month</p>
            <h3>{stats.publishedThisMonth}</h3>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.2s'}}>
          <div className="stat-icon-wrap purple"><MdCheckCircle /></div>
          <div className="stat-content">
            <p>Total Published</p>
            <h3>{stats.totalPublished}</h3>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">Journals Ready for Publication</h2>
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
            <button className="btn-filter"><MdFilterList /> Filter</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Journal ID</th>
                <th>Title</th>
                <th>Author</th>
                <th>Approved Date</th>
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
                  <td>{journal.approvedDate}</td>
                  <td>
                    <span className="status-badge-inline">
                      {journal.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-ar">
                      <button className="btn-ar-action view" title="View Details" onClick={() => navigate(`/journals/${journal._id}`)}>
                        <MdOutlineRemoveRedEye /> View
                      </button>
                      <button className="btn-ar-action publish-btn" title="Publish" onClick={() => handleActionClick(journal)}>
                        <MdRocketLaunch /> Publish Now
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state">No journals are currently ready for publication.</td>
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

      {/* Publish Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Publish Journal</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><MdClose /></button>
            </div>
            <div className="modal-body">
              <div className="decision-context">
                <p>Journal: <strong>{selectedJournal?.title}</strong></p>
                <p>Author: <strong>{selectedJournal?.author}</strong></p>
              </div>

              <div className="publish-confirm">
                <div className="approve-icon-large green-pulse"><MdRocketLaunch /></div>
                <h3>Ready to go live?</h3>
                <p>Confirm the final publication details before making this journal public.</p>
              </div>

              <div className="publish-form">
                <div className="form-group">
                  <label>Assign DOI (Digital Object Identifier)</label>
                  <input 
                    type="text" 
                    value={publishForm.doi}
                    onChange={(e) => setPublishForm({...publishForm, doi: e.target.value})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Volume</label>
                    <input 
                      type="text" 
                      value={publishForm.volume}
                      onChange={(e) => setPublishForm({...publishForm, volume: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Issue</label>
                    <input 
                      type="text" 
                      value={publishForm.issue}
                      onChange={(e) => setPublishForm({...publishForm, issue: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-actions-center">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="button" className="btn-publish-submit" onClick={handleConfirmPublish}>
                  <MdOutlinePublic /> Yes, Publish Live
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

export default Publish;
