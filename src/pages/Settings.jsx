import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './JournalDetails.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    siteName: '',
    supportEmail: '',
    issn: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setFormData({
            siteName: data.siteName || '',
            supportEmail: data.supportEmail || '',
            issn: data.issn || '',
            bankName: data.bankName || '',
            accountName: data.accountName || '',
            accountNumber: data.accountNumber || '',
            ifscCode: data.ifscCode || '',
            upiId: data.upiId || '',
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Settings saved successfully!');
      } else {
        const err = await res.json();
        throw new Error(err.message || 'Error saving settings');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="journal-details-page">
      <div className="page-header">
        <h1 className="page-title">Global Settings</h1>
      </div>

      <form onSubmit={handleSave} className="details-grid">
        <div className="details-main">
          <div className="detail-card">
            <h3>General Settings</h3>
            <div className="info-group">
              <label>Journal Platform Name</label>
              <input
                type="text"
                className="status-select"
                value={formData.siteName}
                onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              />
            </div>
            <div className="info-group">
              <label>Contact Email</label>
              <input
                type="email"
                className="status-select"
                value={formData.supportEmail}
                onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              />
            </div>
            <div className="info-group">
              <label>ISSN</label>
              <input
                type="text"
                className="status-select"
                value={formData.issn}
                onChange={(e) => setFormData({ ...formData, issn: e.target.value })}
                placeholder="e.g. 1234-5678"
              />
            </div>
            <button type="submit" className="panel-btn publish" style={{ width: '150px', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
        <div className="details-main">
          <div className="detail-card">
            <h3>Bank Details</h3>
            <div className="info-group">
              <label>Bank Name</label>
              <input type="text" className="status-select" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} placeholder="e.g. State Bank of India" />
            </div>
            <div className="info-group">
              <label>Account Holder Name</label>
              <input type="text" className="status-select" value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} placeholder="e.g. Praxis Journal" />
            </div>
            <div className="info-group">
              <label>Account Number</label>
              <input type="text" className="status-select" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} placeholder="e.g. 1234567890" />
            </div>
            <div className="info-group">
              <label>IFSC Code</label>
              <input type="text" className="status-select" value={formData.ifscCode} onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })} placeholder="e.g. SBIN0001234" />
            </div>
            <div className="info-group">
              <label>UPI ID</label>
              <input type="text" className="status-select" value={formData.upiId} onChange={(e) => setFormData({ ...formData, upiId: e.target.value })} placeholder="e.g. praxis@upi" />
            </div>
            <button type="submit" className="panel-btn publish" style={{ width: '150px', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
