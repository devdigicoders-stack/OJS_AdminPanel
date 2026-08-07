import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Link } from 'react-router-dom';
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
import toast from 'react-hot-toast';
import './Dashboard.css';

// Initial state shouldn't have dummy data

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJournals: 0,
    pendingReviews: 0,
    publishedJournals: 0
  });

  const [statusData, setStatusData] = useState([
    { name: 'Reviewed', value: 0 },
    { name: 'Processed', value: 0 },
    { name: 'Pending', value: 0 },
    { name: 'Published', value: 0 },
  ]);

  const [trendData, setTrendData] = useState([]);

  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`
      };

      // Fetch Stats
      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/stats`, { headers });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch Status Chart Data
      const statusRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/status-chart`, { headers });
      if (statusRes.ok) {
        const statusChartData = await statusRes.json();
        setStatusData(statusChartData);
      }

      // Fetch Submissions Chart Data
      const submissionsRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/submissions-chart`, { headers });
      if (submissionsRes.ok) {
        const submissionsChartData = await submissionsRes.json();
        setTrendData(submissionsChartData);
      }

      // Fetch Recent Submissions
      const recentSubRes = await fetch(`${import.meta.env.VITE_API_URL}/dashboard/recent-submissions`, { headers });
      if (recentSubRes.ok) {
        const recentSubData = await recentSubRes.json();
        setRecentSubmissions(recentSubData);
      }

      // Fetch Recent Announcements
      const announcementsRes = await fetch(`${import.meta.env.VITE_API_URL}/announcements`, { headers });
      if (announcementsRes.ok) {
        const announcementsData = await announcementsRes.json();
        // Take top 3
        setRecentAnnouncements(announcementsData.slice(0, 3));
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

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
            <strong>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon-wrap blue"><MdPeople /></div>
          <div className="stat-content">
            <p>Total Users</p>
            <h3>{stats.totalUsers}</h3>
            <span className="trend positive"><MdArrowUpward/> 12.5% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap green"><MdLibraryBooks /></div>
          <div className="stat-content">
            <p>Total Journals</p>
            <h3>{stats.totalJournals}</h3>
            <span className="trend positive"><MdArrowUpward/> 8.3% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap orange"><MdPendingActions /></div>
          <div className="stat-content">
            <p>Pending Review</p>
            <h3>{stats.pendingReviews}</h3>
            <span className="trend negative"><MdArrowDownward/> 5.2% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrap purple"><MdPublishedWithChanges /></div>
          <div className="stat-content">
            <p>Published Journals</p>
            <h3>{stats.publishedJournals}</h3>
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
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-center">
                <h2>{stats.totalJournals}</h2>
                <span>Total</span>
              </div>
            </div>
            <div className="donut-legend">
              {statusData.map((item, i) => (
                <div className="legend-row" key={i}>
                  <div className="legend-name">
                    <span className="dot" style={{backgroundColor: COLORS[i]}}></span>
                    {item.name}
                  </div>
                  <strong>{item.value} <span style={{color:'#64748b', fontSize:'12px', fontWeight:'normal'}}>({stats.totalJournals > 0 ? Math.round((item.value/stats.totalJournals)*100) : 0}%)</span></strong>
                </div>
              ))}
            </div>
          </div>
          <div className="view-link-container right">
            <Link to="/journals" className="link-action-subtle">View All Journals &rarr;</Link>
          </div>
        </div>
      </div>

      <div className="lists-row">
        <div className="dash-card flex-2">
          <div className="card-top">
            <h3 className="card-title">Recent Submissions</h3>
            <Link to="/journals" className="link-action-subtle">View All &rarr;</Link>
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
              {recentSubmissions.length > 0 ? recentSubmissions.map((journal, index) => (
                <tr key={journal._id}>
                  <td>{index + 1}</td>
                  <td>{journal.title}</td>
                  <td>{journal.primaryAuthorName || journal.primaryAuthorId?.name || 'Unknown Author'}</td>
                  <td>{new Date(journal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td><span className={`badge-status ${journal.status.toLowerCase().replace(' ', '-')}`}>{journal.status}</span></td>
                  <td><button className="action-icon"><MdOutlineRemoveRedEye/></button></td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>No recent submissions</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="dash-card flex-1">
          <div className="card-top">
            <h3 className="card-title">Recent Announcements</h3>
            <Link to="/announcements" className="link-action-subtle">View All &rarr;</Link>
          </div>
          <div className="announcement-list">
            {recentAnnouncements.length > 0 ? recentAnnouncements.map((ann, index) => {
              const iconColors = ['blue', 'green', 'purple'];
              const IconComponents = [MdCampaign, MdSecurityUpdate, MdOutlineLibraryBooks];
              const Icon = IconComponents[index % IconComponents.length];
              
              return (
                <div className="announcement-item" key={ann._id}>
                  <div className={`announce-icon ${iconColors[index % iconColors.length]}`}>
                    <Icon />
                  </div>
                  <div className="announce-details">
                    <h4>{ann.title}</h4>
                    <p>{ann.content}</p>
                    <span className="blue-text">{new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              );
            }) : (
              <div style={{padding: '20px', textAlign: 'center'}}>No recent announcements</div>
            )}
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
