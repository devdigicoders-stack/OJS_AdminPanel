import React, { useState, useEffect } from 'react';
import { MdAdd, MdEdit, MdDeleteOutline, MdClose, MdToggleOn, MdToggleOff } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const Faqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentFaq, setCurrentFaq] = useState(null);
  const [formData, setFormData] = useState({ question: '', answer: '', isActive: true });

  const fetchFaqs = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/faqs`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFaqs(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleOpenModal = (mode, faq = null) => {
    setModalMode(mode);
    setCurrentFaq(faq);
    if (mode === 'edit' && faq) {
      setFormData({ question: faq.question, answer: faq.answer, isActive: faq.isActive });
    } else {
      setFormData({ question: '', answer: '', isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentFaq(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'add' 
        ? `${import.meta.env.VITE_API_URL}/faqs`
        : `${import.meta.env.VITE_API_URL}/faqs/${currentFaq._id}`;
      
      const method = modalMode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(`FAQ ${modalMode === 'add' ? 'created' : 'updated'} successfully!`);
        fetchFaqs();
        handleCloseModal();
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Error saving FAQ');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/faqs/${currentFaq._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        toast.success('FAQ deleted successfully!');
        fetchFaqs();
        handleCloseModal();
      } else throw new Error('Failed to delete');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/faqs/${faq._id}/toggle-status`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        toast.success('Status updated successfully!');
        fetchFaqs();
      } else throw new Error('Failed to toggle status');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Manage FAQs</h1>
          <p className="page-subtitle">Add, edit, or delete Frequently Asked Questions.</p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">FAQ List</h2>
          <button className="btn-primary" onClick={() => handleOpenModal('add')}>
            <MdAdd /> Create New
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {faqs.length > 0 ? faqs.map((faq) => (
                <tr key={faq._id}>
                  <td>
                    <div className="ann-title">{faq.question}</div>
                  </td>
                  <td>
                    <span className={`status-badge-inline ${faq.isActive ? 'green' : 'red'}`}>
                      {faq.isActive ? 'Active' : 'Deactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons-ar">
                      <button 
                        className={`btn-ar-action ${faq.isActive ? 'delete' : 'edit'}`} 
                        onClick={() => handleToggleStatus(faq)}
                      >
                        {faq.isActive ? <MdToggleOn size={20}/> : <MdToggleOff size={20}/>}
                        {faq.isActive ? ' Deactivate' : ' Activate'}
                      </button>
                      <button className="btn-ar-action edit" onClick={() => handleOpenModal('edit', faq)}>
                        <MdEdit /> Edit
                      </button>
                      <button className="btn-ar-action delete" onClick={() => handleOpenModal('delete', faq)}>
                        <MdDeleteOutline /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="3" className="empty-state">No FAQs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{modalMode === 'add' ? 'Create FAQ' : modalMode === 'edit' ? 'Edit FAQ' : 'Delete FAQ'}</h2>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            {modalMode === 'delete' ? (
              <div className="modal-body text-center">
                <MdDeleteOutline className="mx-auto text-5xl text-red-500 mb-4" />
                <p>Are you sure you want to delete this FAQ?</p>
                <p className="font-bold mt-2">{currentFaq?.question}</p>
                <div className="modal-actions mt-6">
                  <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button className="btn-primary" style={{backgroundColor: '#ef4444'}} onClick={handleDelete}>Delete</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Question</label>
                    <input type="text" name="question" value={formData.question} onChange={handleChange} required placeholder="Enter question..." />
                  </div>
                  <div className="form-group">
                    <label>Answer</label>
                    <textarea name="answer" rows="4" value={formData.answer} onChange={handleChange} required placeholder="Enter answer..."></textarea>
                  </div>
                  <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
                    <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} style={{ width: 'auto' }} />
                    <label htmlFor="isActive" style={{ margin: 0 }}>Active on Website</label>
                  </div>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                  <button type="submit" className="btn-primary">{modalMode === 'add' ? 'Create' : 'Save Changes'}</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Faqs;
