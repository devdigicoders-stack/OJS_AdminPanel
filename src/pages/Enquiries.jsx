import React, { useState, useEffect } from 'react';
import { MdDeleteOutline, MdClose, MdMarkEmailRead } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('view');
  const [currentEnquiry, setCurrentEnquiry] = useState(null);

  const fetchEnquiries = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/enquiries`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setEnquiries(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleOpenModal = (mode, enquiry) => {
    setModalMode(mode);
    setCurrentEnquiry(enquiry);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentEnquiry(null);
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/enquiries/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status: 'Read' })
      });
      if (res.ok) {
        toast.success('Marked as read');
        fetchEnquiries();
        if (modalMode === 'view') handleCloseModal();
      } else throw new Error('Failed to update status');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/enquiries/${currentEnquiry._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        toast.success('Enquiry deleted successfully!');
        fetchEnquiries();
        handleCloseModal();
      } else throw new Error('Failed to delete');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contact Enquiries</h1>
          <p className="page-subtitle">View and manage messages sent from the website.</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">Enquiry List</h2>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name & Email</th>
                <th>Subject</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.length > 0 ? enquiries.map((enq) => (
                <tr key={enq._id} style={{ fontWeight: enq.status === 'New' ? 'bold' : 'normal' }}>
                  <td>
                    <div className="ann-title">{enq.name}</div>
                    <div className="text-xs text-gray-500">{enq.email}</div>
                  </td>
                  <td>{enq.subject}</td>
                  <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge-inline ${enq.status === 'New' ? 'red' : 'green'}`}>
                      {enq.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-ar">
                      <button className="btn-ar-action edit" onClick={() => handleOpenModal('view', enq)}>
                        View
                      </button>
                      <button className="btn-ar-action delete" onClick={() => handleOpenModal('delete', enq)}>
                        <MdDeleteOutline /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="empty-state">No enquiries found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && currentEnquiry && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'view' ? 'View Enquiry' : 'Delete Enquiry'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            {modalMode === 'delete' ? (
              <div className="modal-body text-center">
                <MdDeleteOutline className="mx-auto text-5xl text-red-500 mb-4" />
                <p>Are you sure you want to delete this enquiry?</p>
                <p className="font-bold mt-2">From: {currentEnquiry.name}</p>
                <div className="modal-actions mt-6">
                  <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button className="btn-primary" style={{backgroundColor: '#ef4444'}} onClick={handleDelete}>Delete</button>
                </div>
              </div>
            ) : (
              <div className="modal-body" style={{ textAlign: 'left' }}>
                <div className="enquiry-field-group">
                  <p className="enquiry-field-label">From</p>
                  <p className="enquiry-field-value">
                    {currentEnquiry.name} <br/>
                    <span style={{ fontWeight: 'normal', color: '#64748b' }}>{currentEnquiry.email}</span>
                  </p>
                  {currentEnquiry.phone && (
                    <>
                      <p className="enquiry-field-label">Phone</p>
                      <p className="enquiry-field-value">{currentEnquiry.phone}</p>
                    </>
                  )}
                </div>
                <div className="enquiry-field-group">
                  <p className="enquiry-field-label">Subject</p>
                  <p className="enquiry-field-value">{currentEnquiry.subject}</p>
                </div>
                <div className="enquiry-field-group">
                  <p className="enquiry-field-label">Message</p>
                  <div className="enquiry-message-box">
                    {currentEnquiry.message}
                  </div>
                </div>
                
                <div className="modal-actions mt-6">
                  {currentEnquiry.status === 'New' && (
                    <button className="btn-primary" style={{backgroundColor: '#10b981'}} onClick={() => handleMarkAsRead(currentEnquiry._id)}>
                      <MdMarkEmailRead /> Mark as Read
                    </button>
                  )}
                  <button className="btn-secondary" onClick={handleCloseModal}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
