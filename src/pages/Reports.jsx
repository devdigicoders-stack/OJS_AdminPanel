import React from 'react';
import './Dashboard.css'; // Reusing dashboard styles for cards

const Reports = () => {
  return (
    <div className="dashboard">
      <div className="page-header">
        <h1 className="page-title">Reports & Analytics</h1>
        <button className="panel-btn publish" style={{width: 'auto'}}>Export All Data</button>
      </div>

      <div className="overview-cards">
        <div className="card">
          <div className="card-info">
            <p>Total Submissions</p>
            <h3>8,450</h3>
          </div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Published</p>
            <h3>3,120</h3>
          </div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Rejected</p>
            <h3>1,520</h3>
          </div>
        </div>
        <div className="card">
          <div className="card-info">
            <p>Active Users</p>
            <h3>12,450</h3>
          </div>
        </div>
      </div>

      <div className="table-container" style={{marginTop: '20px'}}>
         <h3>Generate Custom Report</h3>
         <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
            <select className="status-select" style={{maxWidth: '250px'}}>
              <option>Journal Report</option>
              <option>User Report</option>
              <option>Department Report</option>
            </select>
            <input type="date" className="status-select" style={{maxWidth: '200px'}} />
            <input type="date" className="status-select" style={{maxWidth: '200px'}} />
            <button className="panel-btn approve" style={{width: 'auto', padding: '0 20px'}}>Generate</button>
         </div>
      </div>
    </div>
  );
};

export default Reports;
