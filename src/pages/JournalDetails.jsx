import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCheckCircle, MdCancel, MdPublish } from 'react-icons/md';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import './JournalDetails.css';

const JournalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending Review');
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await fetch(`${import.meta.env.VITE_API_URL}/journals/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setJournal(data);
          setStatus(data.status);
        } else {
          toast.error('Failed to fetch journal details');
        }
      } catch (error) {
        toast.error('An error occurred while fetching journal details');
      } finally {
        setLoading(false);
      }
    };
    fetchJournal();
  }, [id]);

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!journal) {
    return <div style={{ padding: '20px' }}>Journal not found.</div>;
  }

  const updateBackendStatus = async (newStatus, extraData = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = newStatus === 'Published' 
        ? `${import.meta.env.VITE_API_URL}/journals/${id}/publish` 
        : `${import.meta.env.VITE_API_URL}/journals/${id}/status`;
      
      const bodyData = newStatus === 'Published' ? extraData : { status: newStatus, ...extraData };

      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bodyData)
      });
      if (res.ok) {
        setStatus(newStatus);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const success = await updateBackendStatus(newStatus);
    if (success) {
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error('Failed to update status');
    }
  };

  const handleApprove = () => {
    Swal.fire({
      title: 'Approve Journal',
      text: 'Are you sure you want to approve this journal? It will be ready for publication.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      confirmButtonColor: '#38a169'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateBackendStatus('Approved');
        if (success) toast.success('Journal Approved successfully!');
        else toast.error('Failed to approve journal');
      }
    });
  };

  const handleReject = () => {
    Swal.fire({
      title: 'Reject Journal',
      input: 'textarea',
      inputPlaceholder: 'Enter reason for rejection...',
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#e53e3e'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateBackendStatus('Rejected');
        if (success) toast.error('Journal Rejected and author notified.');
        else toast.error('Failed to reject journal');
      }
    });
  };

  const handlePublish = () => {
    Swal.fire({
      title: 'Publish Journal',
      text: 'This will make the journal public.',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Publish Now',
      confirmButtonColor: '#38a169'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateBackendStatus('Published', { publishDate: new Date() });
        if (success) toast.success('Journal Published successfully!');
        else toast.error('Failed to publish journal');
      }
    });
  };

  return (
    <div className="journal-details-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/journals')}>
          <MdArrowBack /> Back to Journals
        </button>
        <div className="header-actions">
           <span className={`status-badge ${status.toLowerCase()}`}>{status}</span>
        </div>
      </div>

      <div className="details-grid">
        <div className="details-main">
          <div className="detail-card">
            <h3>Basic Information</h3>
            <div className="info-group">
              <label>Title</label>
              <p className="large-text">{journal.title}</p>
            </div>
            <div className="info-group">
              <label>Abstract</label>
              <p>{journal.abstract}</p>
            </div>
            <div className="info-row">
              <div className="info-group">
                <label>Keywords</label>
                <p>{journal.keywords?.join(', ')}</p>
              </div>
              <div className="info-group">
                <label>Department</label>
                <p>{journal.department}</p>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Files</h3>
            <ul className="file-list">
              <li>
                <div className="file-info">
                  <strong>Main Manuscript</strong>
                  <span>{journal.mainFilePath || 'Not uploaded'}</span>
                </div>
                <button className="download-btn"><MdDownload /> Download</button>
              </li>
            </ul>
          </div>

          <div className="detail-card">
            <h3>Review History</h3>
            <div className="timeline">
              {journal.reviews && journal.reviews.length > 0 ? journal.reviews.map((rev, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{rev.reviewer} <span>{rev.date}</span></h4>
                    <p>{rev.comment}</p>
                  </div>
                </div>
              )) : (
                <p style={{color: '#666'}}>No review history available.</p>
              )}
            </div>
          </div>
        </div>

        <div className="details-sidebar">
          <div className="detail-card">
            <h3>Update Journal Status</h3>
            <div className="status-flow">
              <label>Current Stage</label>
              <select value={status} onChange={handleStatusChange} className="status-select">
                <option value="Submitted">Submitted</option>
                <option value="Editorial Screening">Editorial Screening</option>
                <option value="Reviewer Assigned">Reviewer Assigned</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Revision Required">Revision Required</option>
                <option value="Processing">Processing</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="action-panel">
              <button className="panel-btn approve" onClick={handleApprove} disabled={status === 'Approved' || status === 'Published'}><MdCheckCircle /> Approve</button>
              <button className="panel-btn publish" onClick={handlePublish} disabled={status !== 'Approved'}><MdPublish /> Publish</button>
              <button className="panel-btn reject" onClick={handleReject}><MdCancel /> Reject</button>
            </div>
          </div>

          <div className="detail-card">
            <h3>Author Details</h3>
            <div className="author-info">
              <img src={`https://ui-avatars.com/api/?name=${(journal.primaryAuthorName || 'A').replace(/ /g, '+')}&background=random`} alt="Author" className="avatar-large" />
              <div>
                <strong>{journal.primaryAuthorName}</strong>
                <p>{journal.email}</p>
                <p className="institution">Department of {journal.department}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetails;
