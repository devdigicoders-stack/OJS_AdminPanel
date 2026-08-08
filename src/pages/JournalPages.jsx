import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdPublic, MdOutlineVisibilityOff, MdLanguage } from 'react-icons/md';
import { toast } from 'react-hot-toast';
import './JournalPages.css';

const JournalPages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPages = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/journal-pages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const data = await res.json();
      setPages(data);
    } catch (error) {
      toast.error('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/journal-pages/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          toast.success('Page deleted successfully');
          fetchPages();
        } else {
          toast.error('Failed to delete page');
        }
      } catch (error) {
        toast.error('Error deleting page');
      }
    }
  };

  const handleToggleStatus = async (page) => {
    const newStatus = page.status === 'published' ? 'draft' : 'published';
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/journal-pages/${page._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        toast.success(`Page marked as ${newStatus}`);
        fetchPages();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">Journal Policies & Pages</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Manage all dynamic pages on your website</p>
        </div>
        <button 
          className="btn-primary-action" 
          onClick={() => navigate('/journal-pages/new')}
        >
          <MdAdd size={20} /> Create New Page
        </button>
      </div>

      <div className="card-panel" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading pages...</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <tr>
                  <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Page Title</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>URL Slug</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Status</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase' }}>Last Updated</th>
                  <th style={{ padding: '16px', fontSize: '13px', color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map(page => (
                  <tr key={page._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px', fontWeight: '600', color: '#0f172a' }}>{page.title}</td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                      <a href={`http://localhost:5175/${page.slug}`} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MdLanguage /> /{page.slug}
                      </a>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge ${page.status}`}>
                        {page.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '14px' }}>
                      {new Date(page.updatedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div className="action-row" style={{ justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleToggleStatus(page)} 
                          className={`btn-icon toggle`}
                          title={page.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {page.status === 'published' ? <MdOutlineVisibilityOff /> : <MdPublic />}
                        </button>
                        <button 
                          onClick={() => navigate(`/journal-pages/edit/${page._id}`)} 
                          className="btn-icon edit"
                          title="Edit"
                        >
                          <MdEdit />
                        </button>
                        <button 
                          onClick={() => handleDelete(page._id)} 
                          className="btn-icon delete"
                          title="Delete"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                      No pages created yet. Click "Create New Page" to get started!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JournalPages;
