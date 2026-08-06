import React from 'react';
import toast from 'react-hot-toast';
import './JournalDetails.css'; // Reusing card and form styles

const Settings = () => {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
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
              <input type="text" className="status-select" defaultValue="Open Journal Systems" />
            </div>
            <div className="info-group">
              <label>Contact Email</label>
              <input type="email" className="status-select" defaultValue="contact@ojs.com" />
            </div>
            <div className="info-group">
              <label>DOI Prefix</label>
              <input type="text" className="status-select" defaultValue="10.1234" />
            </div>
            <button type="submit" className="panel-btn publish" style={{width: '150px', marginTop: '10px'}}>Save Changes</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Settings;
