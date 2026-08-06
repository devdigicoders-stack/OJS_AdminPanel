import React from 'react';
import { MdMenu, MdSearch, MdNotificationsNone } from 'react-icons/md';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MdMenu />
        </button>
        <div className="header-greeting">
          Welcome back, Admin! <span className="wave">👋</span>
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <MdSearch className="search-icon" />
          <input type="text" placeholder="Search anything..." />
        </div>
      </div>

      <div className="header-right">
        <button className="icon-button notification-btn">
          <MdNotificationsNone />
          <span className="badge">3</span>
        </button>
        <div className="admin-profile">
          <div className="admin-avatar">AD</div>
          <div className="admin-info">
            <strong>Admin</strong>
            <span>Super Administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
