import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
  MdDashboard,
  MdPeople,
  MdLibraryBooks,
  MdSync,
  MdFactCheck,
  MdSend,
  MdCampaign,
  MdPerson,
  MdLockOutline,
  MdLogout,
  MdQuestionAnswer,
  MdEmail,
  MdPolicy,
  MdHome,
  MdKeyboardArrowRight,
  MdKeyboardArrowDown,
  MdInfo
} from 'react-icons/md';
import logo from '../assets/logo.png';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();
  const [homeOpen, setHomeOpen] = useState(false);
  const [policiesOpen, setPoliciesOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Logout',
      text: "Are you sure you want to logout?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4ed8',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, Logout'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    });
  };

  return (
    <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-header w-full flex justify-center">
          <div className="logo-container w-[90%] max-w-[240px]">
            <img src={logo} alt="Praxis Logo" className="h-[120px] object-contain w-full" />
          </div>
        </div>
      </div>

      <div className="sidebar-menu">
        <NavLink to="/" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"} end>
          <span className="icon"><MdDashboard /></span>
          Dashboard
        </NavLink>

        <NavLink to="/users" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdPeople /></span>
          Manage Users
        </NavLink>

        <NavLink to="/journals" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdLibraryBooks /></span>
          Manage Journals
        </NavLink>

        <NavLink to="/update-status" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdSync /></span>
          Update Journal Status
        </NavLink>

        <NavLink to="/approve-reject" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdFactCheck /></span>
          Approve / Reject Journal
        </NavLink>

        <NavLink to="/publish" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdSend /></span>
          Publish Journal
        </NavLink>

        <NavLink to="/announcements" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdCampaign /></span>
          Manage Announcements
        </NavLink>

        <NavLink to="/faqs" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdQuestionAnswer /></span>
          Manage FAQs
        </NavLink>

        <div className="sidebar-dropdown">
          <div 
            className="sidebar-item" 
            onClick={() => setHomeOpen(!homeOpen)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon"><MdHome /></span>
              Home Page
            </div>
            <span>{homeOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}</span>
          </div>
          
          {homeOpen && (
            <div className="sidebar-submenu" style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px', marginBottom: '10px' }}>
              <NavLink to="/manage-hero" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Manage Hero Section
              </NavLink>
              <NavLink to="/home-page" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Manage Home Page
              </NavLink>
              <NavLink to="/manage-reviews" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Manage Reviews
              </NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-dropdown">
          <div 
            className="sidebar-item" 
            onClick={() => setAboutOpen(!aboutOpen)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon"><MdInfo /></span>
              About Journal
            </div>
            <span>{aboutOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}</span>
          </div>
          
          {aboutOpen && (
            <div className="sidebar-submenu" style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px', marginBottom: '10px' }}>
              <NavLink to="/about-page" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                About the journal (aims & scope)
              </NavLink>
              <NavLink to="/editorial-board" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Editorial Board
              </NavLink>
            </div>
          )}
        </div>

        <div className="sidebar-dropdown">
          <div 
            className="sidebar-item" 
            onClick={() => setPoliciesOpen(!policiesOpen)}
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span className="icon"><MdPolicy /></span>
              Journal Policies
            </div>
            <span>{policiesOpen ? <MdKeyboardArrowDown /> : <MdKeyboardArrowRight />}</span>
          </div>
          
          {policiesOpen && (
            <div className="sidebar-submenu" style={{ paddingLeft: '40px', display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '5px', marginBottom: '10px' }}>
              <NavLink to="/journal-policies/author-submission-guidelines" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Author Guidelines
              </NavLink>
              <NavLink to="/journal-policies/peer-review-policy" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Peer Review Policy
              </NavLink>
              <NavLink to="/journal-policies/ethics-malpractice-statement" className={({ isActive }) => isActive ? "sidebar-subitem active" : "sidebar-subitem"} style={{ fontSize: '13px', color: '#cbd5e1', textDecoration: 'none', padding: '8px 0' }}>
                Ethics & Malpractice
              </NavLink>
            </div>
          )}
        </div>

        <NavLink to="/enquiries" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdEmail /></span>
          Contact Enquiries
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdPerson /></span>
          My Profile
        </NavLink>

        <NavLink to="/change-password" className={({ isActive }) => isActive ? "sidebar-item active" : "sidebar-item"}>
          <span className="icon"><MdLockOutline /></span>
          Change Password
        </NavLink>
      </div>

      <div className="sidebar-bottom">
        <div className="logout-btn" onClick={handleLogout}>
          <MdLogout className="logout-icon" /> Logout
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
