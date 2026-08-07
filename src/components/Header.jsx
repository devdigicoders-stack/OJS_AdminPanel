import React from 'react';
import { MdMenu, MdSearch, MdNotificationsNone } from 'react-icons/md';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const [admin, setAdmin] = React.useState(null);

  React.useEffect(() => {
    const userStr = localStorage.getItem('adminUser');
    if (userStr) {
      try {
        setAdmin(JSON.parse(userStr));
      } catch (e) {
        console.error("Failed to parse adminUser", e);
      }
    }
  }, []);

  const name = admin?.name || 'Admin';
  const role = admin?.role === 'Admin' ? 'Super Administrator' : (admin?.role || 'Super Administrator');
  const initials = admin?.name ? admin.name.substring(0, 2).toUpperCase() : 'AD';

  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={toggleSidebar}>
          <MdMenu />
        </button>
        <div className="header-greeting">
          Welcome back, {name}! <span className="wave">👋</span>
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
          <div className="admin-avatar">{initials}</div>
          <div className="admin-info">
            <strong>{name}</strong>
            <span>{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
