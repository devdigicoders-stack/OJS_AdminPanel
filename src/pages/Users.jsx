import React, { useState, useMemo } from 'react';
import { 
  MdPeople, MdPersonAdd, MdSearch, MdFilterList, MdEdit, MdOutlineRemoveRedEye, MdDeleteOutline,
  MdArrowUpward, MdArrowDownward, MdCheckCircle, MdAccessTime, MdBlock, MdClose
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Users.css';

const initialUsers = [
  { id: 1, name: 'Dr. Sarah Johnson', initials: 'DR', email: 'sarah.johnson@university.edu', role: 'Author', status: 'Active', date: 'May 19, 2025', avatarColor: 'purple' },
  { id: 2, name: 'Michael Brown', initials: 'MB', email: 'michael.brown@institute.edu', role: 'Reviewer', status: 'Active', date: 'May 18, 2025', avatarColor: 'green' },
  { id: 3, name: 'Dr. Emily Davis', initials: 'ED', email: 'emily.davis@college.edu', role: 'Editor', status: 'Active', date: 'May 17, 2025', avatarColor: 'orange' },
  { id: 4, name: 'James Wilson', initials: 'JW', email: 'james.wilson@research.org', role: 'Author', status: 'Inactive', date: 'May 16, 2025', avatarColor: 'blue' },
  { id: 5, name: 'Dr. Olivia Taylor', initials: 'OT', email: 'olivia.taylor@university.edu', role: 'Reviewer', status: 'Active', date: 'May 15, 2025', avatarColor: 'purple' },
  { id: 6, name: 'Admin User', initials: 'AD', email: 'admin@ojs.com', role: 'Admin', status: 'Active', date: 'May 10, 2025', avatarColor: 'green' },
  { id: 7, name: 'Robert Fox', initials: 'RF', email: 'robert.fox@example.com', role: 'Editor', status: 'Active', date: 'May 08, 2025', avatarColor: 'blue' },
  { id: 8, name: 'Eleanor Pena', initials: 'EP', email: 'eleanor.pena@example.com', role: 'Author', status: 'Inactive', date: 'May 05, 2025', avatarColor: 'orange' },
  { id: 9, name: 'Albert Flores', initials: 'AF', email: 'albert.flores@example.com', role: 'Reviewer', status: 'Active', date: 'May 02, 2025', avatarColor: 'green' },
  { id: 10, name: 'Kathryn Murphy', initials: 'KM', email: 'kathryn.murphy@example.com', role: 'Admin', status: 'Active', date: 'Apr 28, 2025', avatarColor: 'purple' },
  { id: 11, name: 'Jacob Jones', initials: 'JJ', email: 'jacob.jones@example.com', role: 'Author', status: 'Active', date: 'Apr 25, 2025', avatarColor: 'blue' },
  { id: 12, name: 'Kristin Watson', initials: 'KW', email: 'kristin.watson@example.com', role: 'Reviewer', status: 'Inactive', date: 'Apr 20, 2025', avatarColor: 'orange' },
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Users');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Author', status: 'Active' });

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.role.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchesTab = true;
      if (activeTab === 'Authors') matchesTab = user.role === 'Author';
      if (activeTab === 'Reviewers') matchesTab = user.role === 'Reviewer';
      if (activeTab === 'Editors') matchesTab = user.role === 'Editor';
      if (activeTab === 'Admin') matchesTab = user.role === 'Admin';

      return matchesSearch && matchesTab;
    });
  }, [users, searchTerm, activeTab]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const counts = {
    'All Users': users.length,
    'Authors': users.filter(u => u.role === 'Author').length,
    'Reviewers': users.filter(u => u.role === 'Reviewer').length,
    'Editors': users.filter(u => u.role === 'Editor').length,
    'Admin': users.filter(u => u.role === 'Admin').length,
  };

  const handleOpenModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    if (user && (type === 'edit' || type === 'view')) {
      setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    } else {
      setFormData({ name: '', email: '', role: 'Author', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (modalType === 'add') {
      const newUser = {
        id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
        ...formData,
        initials: formData.name.substring(0, 2).toUpperCase(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        avatarColor: ['purple', 'green', 'orange', 'blue'][Math.floor(Math.random() * 4)]
      };
      setUsers([newUser, ...users]);
      toast.success('New user added successfully!');
    } else if (modalType === 'edit') {
      setUsers(users.map(u => u.id === selectedUser.id ? { 
        ...u, ...formData, initials: formData.name.substring(0, 2).toUpperCase() 
      } : u));
      toast.success('User updated successfully!');
    }
    handleCloseModal();
  };

  const handleDeleteUser = () => {
    setUsers(users.filter(u => u.id !== selectedUser.id));
    toast.success('User deleted successfully!');
    handleCloseModal();
  };

  return (
    <div className="users-container">
      
      <div className="page-header">
        <h1 className="page-title">Manage Users</h1>
        <p className="breadcrumb">Dashboard / <span>Manage Users</span></p>
      </div>

      <div className="stats-row">
        <div className="stat-card stat-anim">
          <div className="stat-icon-wrap blue"><MdPeople /></div>
          <div className="stat-content">
            <p>Total Users</p>
            <h3>{users.length}</h3>
            <span className="trend positive"><MdArrowUpward/> 12.5% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.1s'}}>
          <div className="stat-icon-wrap green"><MdCheckCircle /></div>
          <div className="stat-content">
            <p>Active Users</p>
            <h3>{users.filter(u => u.status === 'Active').length}</h3>
            <span className="trend positive"><MdArrowUpward/> 10.3% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.2s'}}>
          <div className="stat-icon-wrap orange"><MdAccessTime /></div>
          <div className="stat-content">
            <p>New Users</p>
            <h3>142</h3>
            <span className="trend positive"><MdArrowUpward/> 8.7% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{animationDelay: '0.3s'}}>
          <div className="stat-icon-wrap purple"><MdBlock /></div>
          <div className="stat-content">
            <p>Inactive Users</p>
            <h3>{users.filter(u => u.status === 'Inactive').length}</h3>
            <span className="trend negative"><MdArrowDownward/> 3.2% <span>from last month</span></span>
          </div>
        </div>
      </div>

      <div className="table-card">
        <div className="table-header-top">
          <h2 className="table-title">All Users</h2>
          <div className="table-controls">
            <div className="search-box">
              <MdSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search user by name, email or role..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <button className="btn-filter"><MdFilterList /> Filters</button>
            <button className="btn-primary" onClick={() => handleOpenModal('add')}>
              <MdPersonAdd /> Add New User
            </button>
          </div>
        </div>

        <div className="table-tabs">
          {Object.keys(counts).map(tab => (
            <button 
              key={tab} 
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
            >
              {tab} <span className="count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>User Name &uarr;&darr;</th>
                <th>Email &uarr;&darr;</th>
                <th>Role &uarr;&darr;</th>
                <th>Status &uarr;&darr;</th>
                <th>Date Joined &uarr;&darr;</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.length > 0 ? currentUsers.map((user, index) => (
                <tr key={user.id} className="table-row-animate" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td>{user.id}</td>
                  <td>
                    <div className="user-name-cell">
                      <div className={`avatar ${user.avatarColor}`}>{user.initials}</div>
                      <span className="user-fullname">{user.name}</span>
                    </div>
                  </td>
                  <td className="email-cell">{user.email}</td>
                  <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                  <td><span className={`status-badge ${user.status.toLowerCase()}`}>{user.status}</span></td>
                  <td className="date-cell">{user.date}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn edit" title="Edit" onClick={() => handleOpenModal('edit', user)}><MdEdit /></button>
                      <button className="action-btn view" title="View" onClick={() => handleOpenModal('view', user)}><MdOutlineRemoveRedEye /></button>
                      <button className="action-btn delete" title="Delete" onClick={() => handleOpenModal('delete', user)}><MdDeleteOutline /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" className="empty-state">No users found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="entries-info">
            Show 
            <select 
              className="entries-select" 
              value={entriesPerPage} 
              onChange={(e) => { setEntriesPerPage(Number(e.target.value)); setCurrentPage(1); }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            entries
          </div>
          <div className="showing-info">
            Showing {filteredUsers.length === 0 ? 0 : (currentPage - 1) * entriesPerPage + 1} to {Math.min(currentPage * entriesPerPage, filteredUsers.length)} of {filteredUsers.length} entries
          </div>
          <div className="pagination">
            <button className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}>&laquo;</button>
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                className={`page-btn ${currentPage === i + 1 ? 'active' : ''}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className={`page-btn ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}`} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}>&raquo;</button>
          </div>
        </div>
      </div>
      
      {/* Modal Component */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalType === 'add' && 'Add New User'}
                {modalType === 'edit' && 'Edit User'}
                {modalType === 'view' && 'User Details'}
                {modalType === 'delete' && 'Delete User'}
              </h2>
              <button className="close-btn" onClick={handleCloseModal}><MdClose /></button>
            </div>
            
            <div className="modal-body">
              {modalType === 'delete' ? (
                <div className="delete-confirm">
                  <div className="delete-icon-large"><MdDeleteOutline /></div>
                  <h3>Are you sure?</h3>
                  <p>Do you really want to delete <strong>{selectedUser?.name}</strong>? This process cannot be undone.</p>
                  <div className="modal-actions-center">
                    <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                    <button type="button" className="btn-danger" onClick={handleDeleteUser}>Delete</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSaveUser}>
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      required 
                      disabled={modalType === 'view'}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      required 
                      disabled={modalType === 'view'}
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select 
                        disabled={modalType === 'view'}
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                      >
                        <option value="Author">Author</option>
                        <option value="Reviewer">Reviewer</option>
                        <option value="Editor">Editor</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select 
                        disabled={modalType === 'view'}
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value})}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  {modalType !== 'view' && (
                    <div className="modal-actions">
                      <button type="button" className="btn-cancel" onClick={handleCloseModal}>Cancel</button>
                      <button type="submit" className="btn-primary">
                        {modalType === 'add' ? 'Add User' : 'Save Changes'}
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dash-footer">
        © 2025 Open Journal Systems. All rights reserved.
      </div>
    </div>
  );
};

export default Users;
