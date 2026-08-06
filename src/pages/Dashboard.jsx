import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  MdPeople, 
  MdLibraryBooks, 
  MdPendingActions, 
  MdPublishedWithChanges,
  MdCalendarMonth,
  MdArrowUpward,
  MdArrowDownward,
  MdOutlineRemoveRedEye,
  MdCampaign,
  MdSecurityUpdate,
  MdOutlineLibraryBooks
} from 'react-icons/md';
import './Dashboard.css';

const dataTrend = [
  { name: 'Dec 2024', submissions: 40 },
  { name: 'Jan 2025', submissions: 80 },
  { name: 'Feb 2025', submissions: 62 },
  { name: 'Mar 2025', submissions: 80 },
  { name: 'Apr 2025', submissions: 68 },
  { name: 'May 2025', submissions: 88 },
];

const dataStatus = [
  { name: 'Reviewed', value: 107 },
  { name: 'Processed', value: 89 },
  { name: 'Pending', value: 71 },
  { name: 'Published', value: 89 },
];
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      
      <div className="dash-header-row">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Overview of your journal management system</p>
        </div>
        <div className="date-badge">
          <MdCalendarMonth className="date-icon" />
          <div className="date-text">
            <strong>May 19, 2025</strong>
            <span>Monday</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrap blue"><MdPeople /></div>
          <div className="stat-content">
            <p>Total Users</p>
            <h3>1,248</h3>
            <span className="trend positive"><MdArrowUpward/> 12.5% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap green"><MdLibraryBooks /></div>
          <div className="stat-content">
            <p>Total Journals</p>
            <h3>356</h3>
            <span className="trend positive"><MdArrowUpward/> 8.3% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap orange"><MdPendingActions /></div>
          <div className="stat-content">
            <p>Pending Review</p>
            <h3>78</h3>
            <span className="trend negative"><MdArrowDownward/> 5.2% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap purple"><MdPublishedWithChanges /></div>
          <div className="stat-content">
            <p>Published Journals</p>
            <h3>198</h3>
            <span className="trend positive"><MdArrowUpward/> 15.7% <span>from last month</span></span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="dash-card flex-2">
          <div className="card-top">
            <h3 className="card-title">Submissions Overview</h3>
            <select className="date-select">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dataTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                <Line type="monotone" dataKey="submissions" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, strokeWidth: 2, fill: '#fff'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dash-card flex-1">
          <div className="card-top">
            <h3 className="card-title">Journal Status Overview</h3>
          </div>
          <div className="donut-layout">
            <div className="donut-chart-box">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {dataStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <h2>356</h2>
                <span>Total</span>
              </div>
            </div>
            <div className="donut-legend">
              {dataStatus.map((item, i) => (
                <div className="legend-row" key={i}>
                  <div className="legend-name">
                    <span className="dot" style={{backgroundColor: COLORS[i]}}></span>
                    {item.name}
                  </div>
                  <strong>{item.value} <span style={{color:'#64748b', fontSize:'12px', fontWeight:'normal'}}>({Math.round((item.value/356)*100)}%)</span></strong>
                </div>
              ))}
            </div>
          </div>
          <div className="view-link-container right">
            <a href="#" className="link-action-subtle">View All Journals &rarr;</a>
          </div>
        </div>
      </div>

      <div className="lists-row">
        <div className="dash-card flex-2">
          <div className="card-top">
            <h3 className="card-title">Recent Submissions</h3>
            <a href="#" className="link-action-subtle">View All &rarr;</a>
          </div>
          <table className="recent-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Journal Title</th>
                <th>Author</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>AI in Education: A Systematic Review</td>
                <td>Dr. Sarah Johnson</td>
                <td>May 19, 2025</td>
                <td><span className="badge-status pending">Pending Review</span></td>
                <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
              </tr>
              <tr>
                <td>2</td>
                <td>Blockchain Technology and Security</td>
                <td>Michael Brown</td>
                <td>May 18, 2025</td>
                <td><span className="badge-status reviewed">Reviewed</span></td>
                <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
              </tr>
              <tr>
                <td>3</td>
                <td>Climate Change and Its Impact</td>
                <td>Dr. Emily Davis</td>
                <td>May 17, 2025</td>
                <td><span className="badge-status processed">Processed</span></td>
                <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
              </tr>
              <tr>
                <td>4</td>
                <td>Machine Learning Applications</td>
                <td>James Wilson</td>
                <td>May 16, 2025</td>
                <td><span className="badge-status published">Published</span></td>
                <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
              </tr>
              <tr>
                <td>5</td>
                <td>Renewable Energy Advances</td>
                <td>Dr. Olivia Taylor</td>
                <td>May 15, 2025</td>
                <td><span className="badge-status pending">Pending Review</span></td>
                <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="dash-card flex-1">
          <div className="card-top">
            <h3 className="card-title">Recent Announcements</h3>
            <a href="#" className="link-action-subtle">View All &rarr;</a>
          </div>
          <div className="announcement-list">
            
            <div className="announcement-item">
              <div className="announce-icon blue"><MdCampaign/></div>
              <div className="announce-details">
                <h4>New Journal Submission Guidelines</h4>
                <p>Please follow the new guidelines for submitting your manuscripts.</p>
                <span className="blue-text">May 18, 2025</span>
              </div>
            </div>

            <div className="announcement-item">
              <div className="announce-icon green"><MdSecurityUpdate/></div>
              <div className="announce-details">
                <h4>System Maintenance Notice</h4>
                <p>System will be under maintenance on May 25, 2025 from 02:00 AM to 04:00 AM.</p>
                <span className="blue-text">May 16, 2025</span>
              </div>
            </div>

            <div className="announcement-item">
              <div className="announce-icon purple"><MdOutlineLibraryBooks/></div>
              <div className="announce-details">
                <h4>Call for Papers - Vol 10, Issue 2</h4>
                <p>We are inviting papers for Volume 10, Issue 2. Deadline: June 15, 2025.</p>
                <span className="blue-text">May 15, 2025</span>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      <div className="dash-footer">
        © 2025 Open Journal Systems. All rights reserved.
      </div>
    </div>
  );
};

export default Dashboard;
