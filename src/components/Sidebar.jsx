import React from 'react';
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
  MdLogout
} from 'react-icons/md';
import logo from '../assets/logo.png';
import './Sidebar.css';

const Sidebar = ({ isOpen }) => {
  const navigate = useNavigate();

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
