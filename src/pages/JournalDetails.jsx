import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdDownload, MdCheckCircle, MdCancel, MdPublish } from 'react-icons/md';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import './JournalDetails.css';

const JournalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Reviewed');

  const journal = {
    id: id || 'J-2026-001',
    title: 'AI in Healthcare: A Comprehensive Study on Predictive Models',
    abstract: 'This paper explores the application of artificial intelligence in predicting patient outcomes in ICU settings...',
    keywords: 'AI, Healthcare, Machine Learning, Predictive Modeling',
    department: 'Computer Science',
    author: {
      name: 'Dr. Rahul Sharma',
      email: 'rahul.s@university.edu',
      institution: 'Delhi University'
    },
    files: [
      { name: 'Research_Paper_Final.pdf', size: '2.4 MB' },
      { name: 'Supplementary_Data.zip', size: '15.1 MB' }
    ],
    reviews: [
      { reviewer: 'Dr. Alan Turing', comment: 'Methodology is solid. Needs better formatting.', date: '2026-08-03' },
      { reviewer: 'Dr. Marie Curie', comment: 'Excellent analysis of the datasets.', date: '2026-08-04' }
    ]
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    toast.success(`Status updated to ${newStatus}`);
  };

  const handleApprove = () => {
    Swal.fire({
      title: 'Approve Journal',
      html: `
        <input type="text" id="doi" class="swal2-input" placeholder="Assign DOI Number">
        <input type="text" id="vol" class="swal2-input" placeholder="Publication Volume">
      `,
      showCancelButton: true,
      confirmButtonText: 'Approve',
      preConfirm: () => {
        return {
          doi: document.getElementById('doi').value,
          vol: document.getElementById('vol').value
        }
      }
    }).then((result) => {
      if (result.isConfirmed) {
        setStatus('Approved');
        toast.success('Journal Approved successfully!');
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
    }).then((result) => {
      if (result.isConfirmed) {
        setStatus('Rejected');
        toast.error('Journal Rejected and author notified.');
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
    }).then((result) => {
      if (result.isConfirmed) {
        setStatus('Published');
        toast.success('Journal Published successfully!');
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
                <p>{journal.keywords}</p>
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
              {journal.files.map((file, idx) => (
                <li key={idx}>
                  <div className="file-info">
                    <strong>{file.name}</strong>
                    <span>{file.size}</span>
                  </div>
                  <button className="download-btn"><MdDownload /> Download</button>
                </li>
              ))}
            </ul>
          </div>

          <div className="detail-card">
            <h3>Review History</h3>
            <div className="timeline">
              {journal.reviews.map((rev, idx) => (
                <div className="timeline-item" key={idx}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{rev.reviewer} <span>{rev.date}</span></h4>
                    <p>{rev.comment}</p>
                  </div>
                </div>
              ))}
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
              <button className="panel-btn approve" onClick={handleApprove}><MdCheckCircle /> Approve</button>
              <button className="panel-btn publish" onClick={handlePublish} disabled={status !== 'Approved'}><MdPublish /> Publish</button>
              <button className="panel-btn reject" onClick={handleReject}><MdCancel /> Reject</button>
            </div>
          </div>

          <div className="detail-card">
            <h3>Author Details</h3>
            <div className="author-info">
              <img src={`https://ui-avatars.com/api/?name=${journal.author.name.replace(' ', '+')}&background=random`} alt="Author" className="avatar-large" />
              <div>
                <strong>{journal.author.name}</strong>
                <p>{journal.author.email}</p>
                <p className="institution">{journal.author.institution}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JournalDetails;
