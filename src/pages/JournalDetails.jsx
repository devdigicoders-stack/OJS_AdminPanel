import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdDownload,
  MdCheckCircle,
  MdCancel,
  MdPublish,
  MdVisibility,
  MdPictureAsPdf,
  MdImage,
  MdInsertDriveFile,
  MdPerson,
  MdEmail,
  MdPhone,
  MdSchool,
  MdAssignmentInd,
  MdCalendarToday,
  MdMenuBook,
  MdTag,
  MdTranslate,
  MdBookmark,
  MdRateReview
} from 'react-icons/md';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import './JournalDetails.css';

const JournalDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Pending Review');
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [assigningReviewer, setAssigningReviewer] = useState(false);

  // Helper to format backend file URL
  const getBackendFileUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/api\/?$/, '');
    const cleanPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
  };

  const getFileName = (path, originalName) => {
    if (originalName) return originalName;
    if (!path) return 'Document';
    const parts = path.replace(/\\/g, '/').split('/');
    return parts[parts.length - 1];
  };

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
        if (data.assignedReviewer?._id || data.assignedReviewer) {
          setSelectedReviewer(data.assignedReviewer?._id || data.assignedReviewer);
        }
      } else {
        toast.error('Failed to fetch journal details');
      }
    } catch (error) {
      toast.error('An error occurred while fetching journal details');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/reviewers`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviewers(data);
      }
    } catch (err) {
      console.error('Error fetching reviewers', err);
    }
  };

  useEffect(() => {
    fetchJournal();
    fetchReviewers();
  }, [id]);

  if (loading) {
    return (
      <div className="journal-loading-container">
        <div className="spinner"></div>
        <p>Loading journal details...</p>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="journal-details-page">
        <button className="back-btn" onClick={() => navigate('/journals')}>
          <MdArrowBack /> Back to Journals
        </button>
        <div className="detail-card" style={{ textAlign: 'center', padding: '40px' }}>
          <h3>Journal not found</h3>
          <p>The requested journal could not be found or has been removed.</p>
        </div>
      </div>
    );
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
        fetchJournal();
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

  const handleAssignReviewer = async () => {
    if (!selectedReviewer) {
      toast.error('Please select a reviewer first');
      return;
    }
    setAssigningReviewer(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/journals/${id}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviewerId: selectedReviewer })
      });
      if (res.ok) {
        toast.success('Reviewer assigned successfully!');
        fetchJournal();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to assign reviewer');
      }
    } catch (err) {
      toast.error('Error assigning reviewer');
    } finally {
      setAssigningReviewer(false);
    }
  };

  const handleApprove = () => {
    Swal.fire({
      title: 'Approve Journal',
      text: 'Are you sure you want to approve this journal? It will be ready for publication.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Approve',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b'
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
      confirmButtonText: 'Reject Journal',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a reason for rejection!';
        }
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateBackendStatus('Rejected', { reviewerFeedback: result.value });
        if (success) toast.success('Journal Rejected and feedback recorded.');
        else toast.error('Failed to reject journal');
      }
    });
  };

  const handlePublish = () => {
    Swal.fire({
      title: 'Publish Journal',
      html: `
        <div style="text-align: left; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
          <div>
            <label style="font-size: 13px; font-weight: 600; color: #374151;">Volume</label>
            <input id="swal-vol" class="swal2-input" style="margin: 4px 0 0; width: 100%;" placeholder="e.g. Vol 1" value="${journal.volume !== '-' ? journal.volume : 'Vol 1'}">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 600; color: #374151;">Issue</label>
            <input id="swal-issue" class="swal2-input" style="margin: 4px 0 0; width: 100%;" placeholder="e.g. Issue 1" value="${journal.issue !== '-' ? journal.issue : 'Issue 1'}">
          </div>
          <div>
            <label style="font-size: 13px; font-weight: 600; color: #374151;">DOI Number (Optional)</label>
            <input id="swal-doi" class="swal2-input" style="margin: 4px 0 0; width: 100%;" placeholder="e.g. 10.1234/praxis.2024.01" value="${journal.doi !== '-' ? journal.doi : ''}">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Publish Now',
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#64748b',
      preConfirm: () => {
        return {
          volume: document.getElementById('swal-vol').value || 'Vol 1',
          issue: document.getElementById('swal-issue').value || 'Issue 1',
          doi: document.getElementById('swal-doi').value || '-',
          publishDate: new Date()
        };
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        const success = await updateBackendStatus('Published', result.value);
        if (success) toast.success('Journal Published successfully to Website!');
        else toast.error('Failed to publish journal');
      }
    });
  };

  const handleDownload = (fileUrl, fileName) => {
    if (!fileUrl) {
      toast.error('File URL is not available');
      return;
    }
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', fileName || 'document');
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="journal-details-page">
      {/* ── Page Header ── */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/journals')}>
            <MdArrowBack /> Back to Journals
          </button>
          <div className="journal-id-tag">
            <MdBookmark size={15} /> ID: <strong>{journal.journalId || journal._id}</strong>
          </div>
        </div>
        <div className="header-actions">
          <span className={`status-badge ${(status || 'pending').toLowerCase().replace(/\s+/g, '-')}`}>
            {status}
          </span>
        </div>
      </div>

      <div className="details-grid">
        {/* ── Left / Main Column ── */}
        <div className="details-main">
          
          {/* Basic Paper Information */}
          <div className="detail-card">
            <div className="card-header-with-icon">
              <div className="card-icon-wrapper"><MdMenuBook size={20} /></div>
              <h3>Paper Information</h3>
            </div>
            
            <div className="info-group">
              <label>Paper Title</label>
              <p className="large-text">{journal.title}</p>
            </div>

            <div className="info-group">
              <label>Abstract</label>
              <div className="abstract-box">
                <p>{journal.abstract}</p>
              </div>
            </div>

            <div className="info-grid-3">
              <div className="info-group">
                <label><MdSchool size={13} /> Department</label>
                <p className="highlight-pill">{journal.department || 'N/A'}</p>
              </div>
              <div className="info-group">
                <label><MdBookmark size={13} /> Research Area / Subject</label>
                <p className="highlight-pill">{journal.researchArea || 'General'}</p>
              </div>
              <div className="info-group">
                <label><MdTranslate size={13} /> Publication Language</label>
                <p className="highlight-pill">{journal.language || 'English'}</p>
              </div>
            </div>

            <div className="info-grid-3" style={{ marginTop: '16px' }}>
              <div className="info-group">
                <label><MdInsertDriveFile size={13} /> Pages</label>
                <p><strong>{journal.pages || 'N/A'}</strong> Pages</p>
              </div>
              <div className="info-group">
                <label><MdCalendarToday size={13} /> Submitted On</label>
                <p>{new Date(journal.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="info-group">
                <label><MdCalendarToday size={13} /> Last Updated</label>
                <p>{new Date(journal.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>

            <div className="info-group" style={{ marginTop: '16px' }}>
              <label><MdTag size={13} /> Keywords</label>
              <div className="keywords-wrapper">
                {journal.keywords && journal.keywords.length > 0 ? (
                  journal.keywords.map((kw, i) => (
                    <span key={i} className="keyword-chip">{kw}</span>
                  ))
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>No keywords added</span>
                )}
              </div>
            </div>

            {/* Publication metadata if published */}
            {(journal.status === 'Published' || journal.volume !== '-' || journal.issue !== '-') && (
              <div className="pub-meta-banner">
                <div><strong>Volume:</strong> {journal.volume || 'Vol 1'}</div>
                <div><strong>Issue:</strong> {journal.issue || 'Issue 1'}</div>
                <div><strong>DOI:</strong> {journal.doi || 'Not assigned'}</div>
                {journal.publishDate && (
                  <div><strong>Published:</strong> {new Date(journal.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                )}
              </div>
            )}
          </div>

          {/* Uploaded Documents & Files Card */}
          <div className="detail-card">
            <div className="card-header-with-icon">
              <div className="card-icon-wrapper file-icon-wrap"><MdInsertDriveFile size={20} /></div>
              <h3>Uploaded Documents & Files</h3>
            </div>

            <div className="files-section">
              {/* Main Manuscript File */}
              <div className="file-box main-file-box">
                <div className="file-left">
                  <div className="file-type-icon pdf"><MdPictureAsPdf size={24} /></div>
                  <div className="file-details">
                    <div className="file-badge">Main Manuscript</div>
                    <strong className="file-title">
                      {getFileName(journal.mainFilePath, journal.originalFileName)}
                    </strong>
                    <span className="file-path-hint">{journal.mainFilePath}</span>
                  </div>
                </div>
                <div className="file-actions">
                  {journal.mainFilePath ? (
                    <>
                      <a
                        href={getBackendFileUrl(journal.mainFilePath)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="view-btn"
                        title="Preview PDF in new tab"
                      >
                        <MdVisibility size={16} /> View
                      </a>
                      <button
                        className="download-btn"
                        onClick={() => handleDownload(getBackendFileUrl(journal.mainFilePath), getFileName(journal.mainFilePath, journal.originalFileName))}
                        title="Download file"
                      >
                        <MdDownload size={16} /> Download
                      </button>
                    </>
                  ) : (
                    <span className="no-file-text">Not uploaded</span>
                  )}
                </div>
              </div>

              {/* Cover / Thumbnail Image */}
              {journal.image && (
                <div className="file-box image-file-box">
                  <div className="file-left">
                    <div className="file-type-icon img"><MdImage size={24} /></div>
                    <div className="file-details">
                      <div className="file-badge img-badge">Cover / Thumbnail Image</div>
                      <strong className="file-title">{getFileName(journal.image)}</strong>
                      <span className="file-path-hint">{journal.image}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <a
                      href={getBackendFileUrl(journal.image)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-btn"
                    >
                      <MdVisibility size={16} /> View Image
                    </a>
                    <button
                      className="download-btn"
                      onClick={() => handleDownload(getBackendFileUrl(journal.image), getFileName(journal.image))}
                    >
                      <MdDownload size={16} /> Download
                    </button>
                  </div>
                </div>
              )}

              {/* Additional / Supplementary Files */}
              {journal.additionalFilePaths && journal.additionalFilePaths.length > 0 && (
                <div className="additional-files-container">
                  <h4 className="sub-section-title">Supplementary Files ({journal.additionalFilePaths.length})</h4>
                  {journal.additionalFilePaths.map((filePath, index) => (
                    <div key={index} className="file-box supp-file-box">
                      <div className="file-left">
                        <div className="file-type-icon supp"><MdInsertDriveFile size={22} /></div>
                        <div className="file-details">
                          <strong className="file-title">{getFileName(filePath)}</strong>
                          <span className="file-path-hint">{filePath}</span>
                        </div>
                      </div>
                      <div className="file-actions">
                        <a
                          href={getBackendFileUrl(filePath)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-btn"
                        >
                          <MdVisibility size={16} /> View
                        </a>
                        <button
                          className="download-btn"
                          onClick={() => handleDownload(getBackendFileUrl(filePath), getFileName(filePath))}
                        >
                          <MdDownload size={16} /> Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Feedback Section */}
          <div className="detail-card">
            <div className="card-header-with-icon">
              <div className="card-icon-wrapper review-icon-wrap"><MdRateReview size={20} /></div>
              <h3>Reviewer & Editorial Feedback</h3>
            </div>
            
            {journal.assignedReviewer ? (
              <div className="reviewer-assigned-box">
                <div className="reviewer-meta">
                  <div className="reviewer-avatar">
                    {(journal.assignedReviewer?.name || 'R').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <strong>{journal.assignedReviewer?.name || 'Assigned Reviewer'}</strong>
                    <p>{journal.assignedReviewer?.email || 'No email available'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-reviewer-banner">
                <p>No Reviewer assigned to this paper yet.</p>
              </div>
            )}

            <div className="feedback-content-box">
              <label>Feedback & Decision Remarks</label>
              {journal.reviewerFeedback ? (
                <div className="feedback-text-box">
                  <p>{journal.reviewerFeedback}</p>
                  <span className="feedback-date">Updated: {new Date(journal.updatedAt).toLocaleDateString()}</span>
                </div>
              ) : (
                <p className="no-feedback-text">No remarks or feedback submitted yet.</p>
              )}
            </div>
          </div>

        </div>

        {/* ── Right / Sidebar Column ── */}
        <div className="details-sidebar">
          
          {/* Status & Quick Actions Card */}
          <div className="detail-card sticky-card">
            <h3>Update Journal Status</h3>
            <div className="status-flow">
              <label>Current Stage / Status</label>
              <select value={status} onChange={handleStatusChange} className="status-select">
                <option value="Pending Review">Pending Review</option>
                <option value="Under Review">Under Review</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Processed">Processed</option>
                <option value="Approved">Approved</option>
                <option value="Published">Published</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="action-panel">
              <button
                className="panel-btn approve"
                onClick={handleApprove}
                disabled={status === 'Approved' || status === 'Published'}
              >
                <MdCheckCircle size={18} /> Approve Journal
              </button>
              <button
                className="panel-btn publish"
                onClick={handlePublish}
                disabled={status !== 'Approved' && status !== 'Published'}
              >
                <MdPublish size={18} /> Publish to Website
              </button>
              <button
                className="panel-btn reject"
                onClick={handleReject}
                disabled={status === 'Rejected'}
              >
                <MdCancel size={18} /> Reject Journal
              </button>
            </div>

            {/* Assign Reviewer Box */}
            <div className="assign-reviewer-section">
              <label><MdAssignmentInd size={14} /> Assign Reviewer</label>
              <div className="reviewer-selector-group">
                <select
                  value={selectedReviewer}
                  onChange={(e) => setSelectedReviewer(e.target.value)}
                  className="reviewer-select"
                >
                  <option value="">{reviewers.length === 0 ? '-- No Reviewers in Database --' : '-- Choose Reviewer --'}</option>
                  {reviewers.map(r => (
                    <option key={r._id} value={r._id}>{r.name} ({r.email})</option>
                  ))}
                </select>
                <button
                  className="assign-btn"
                  onClick={handleAssignReviewer}
                  disabled={assigningReviewer || !selectedReviewer}
                >
                  {assigningReviewer ? 'Assigning...' : 'Assign'}
                </button>
              </div>
              {reviewers.length === 0 && (
                <p style={{ fontSize: '11.5px', color: '#64748b', margin: '6px 0 0', lineHeight: 1.4 }}>
                  💡 <em>Tip: Manage Users me jaakar kisi user ka Role <strong>"Reviewer"</strong> create/edit karein.</em>
                </p>
              )}
            </div>
          </div>

          {/* Author Details Card */}
          <div className="detail-card">
            <h3>Author Information</h3>
            <div className="author-card-content">
              <div className="author-header">
                <div className="author-avatar-badge">
                  {(journal.primaryAuthorName || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="author-main-info">
                  <strong>{journal.primaryAuthorName}</strong>
                  <span className="author-role-badge">Primary & Corresponding Author</span>
                </div>
              </div>

              <div className="author-details-list">
                <div className="author-detail-row">
                  <MdEmail className="detail-icon" />
                  <div>
                    <label>Email Address</label>
                    <a href={`mailto:${journal.email}`} className="author-link">{journal.email}</a>
                  </div>
                </div>

                <div className="author-detail-row">
                  <MdPhone className="detail-icon" />
                  <div>
                    <label>Phone Number</label>
                    <a href={`tel:${journal.phoneCode || '+91'}${journal.phone}`} className="author-link">
                      {journal.phoneCode || '+91'} {journal.phone || 'N/A'}
                    </a>
                  </div>
                </div>

                <div className="author-detail-row">
                  <MdSchool className="detail-icon" />
                  <div>
                    <label>Department</label>
                    <p>{journal.department || 'Not specified'}</p>
                  </div>
                </div>

                <div className="author-detail-row">
                  <MdPerson className="detail-icon" />
                  <div>
                    <label>Co-Authors</label>
                    <p>{journal.coAuthors && journal.coAuthors.trim() ? journal.coAuthors : 'None'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default JournalDetails;

