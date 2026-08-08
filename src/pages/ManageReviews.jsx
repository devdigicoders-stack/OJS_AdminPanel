import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MdCheckCircle, MdCancel, MdDelete, MdFilterList, MdStar } from 'react-icons/md';
import './JournalPages.css';

const statusBadge = (status) => {
  const styles = {
    Pending:  { background: '#fef9c3', color: '#854d0e', border: '1px solid #fde68a' },
    Approved: { background: '#dcfce7', color: '#166534', border: '1px solid #86efac' },
    Rejected: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' },
  };
  return (
    <span style={{ ...styles[status], padding: '2px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600 }}>
      {status}
    </span>
  );
};

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchReviews = async (statusFilter) => {
    setLoading(true);
    try {
      const query = statusFilter && statusFilter !== 'All' ? `?status=${statusFilter}` : '';
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews${query}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(filter);
  }, [filter]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success(`Review ${status.toLowerCase()} successfully!`);
        fetchReviews(filter);
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating review');
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
      });
      if (res.ok) {
        toast.success('Review deleted!');
        setReviews(reviews.filter(r => r._id !== id));
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      toast.error('Error deleting review');
    }
  };

  const filters = ['All', 'Pending', 'Approved', 'Rejected'];

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Manage Reviews</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Reviews submitted by users from the website. Approve to show on Home Page.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <MdFilterList style={{ color: '#64748b', alignSelf: 'center', fontSize: '20px' }} />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid',
                fontSize: '13px',
                cursor: 'pointer',
                fontWeight: 600,
                background: filter === f ? '#0f766e' : 'white',
                color: filter === f ? 'white' : '#64748b',
                borderColor: filter === f ? '#0f766e' : '#cbd5e1',
                transition: 'all 0.2s'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="card-panel" style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>No {filter !== 'All' ? filter.toLowerCase() : ''} reviews found.</p>
          {filter === 'Pending' && <p style={{ fontSize: '13px', marginTop: '8px' }}>New reviews submitted from the website will appear here.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {reviews.map((review) => (
            <div key={review._id} className="card-panel" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'white', fontWeight: 700, fontSize: '18px'
                }}>
                  {review.image
                    ? <img src={review.image} alt={review.author} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    : review.author.charAt(0).toUpperCase()
                  }
                </div>

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '15px', color: '#1e293b' }}>{review.author}</strong>
                      {review.role && <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '13px' }}>• {review.role}</span>}
                      {review.email && <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{review.email}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {statusBadge(review.status)}
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '2px', margin: '8px 0', color: '#f59e0b' }}>
                    {[...Array(5)].map((_, i) => (
                      <MdStar key={i} style={{ opacity: i < (review.rating || 5) ? 1 : 0.2 }} />
                    ))}
                  </div>

                  <p style={{ fontSize: '14px', color: '#475569', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                    "{review.text}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {review.status !== 'Approved' && (
                  <button
                    onClick={() => updateStatus(review._id, 'Approved')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    <MdCheckCircle /> Approve
                  </button>
                )}
                {review.status !== 'Rejected' && (
                  <button
                    onClick={() => updateStatus(review._id, 'Rejected')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fef9c3', color: '#92400e', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                  >
                    <MdCancel /> Reject
                  </button>
                )}
                <button
                  onClick={() => deleteReview(review._id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
                >
                  <MdDelete /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
