import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdPeople, MdPersonAdd, MdSearch, MdFilterList, MdEdit, MdOutlineRemoveRedEye, MdDeleteOutline,
  MdArrowUpward, MdArrowDownward, MdCheckCircle, MdAccessTime, MdBlock, MdClose
} from 'react-icons/md';
import toast from 'react-hot-toast';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All Users');
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add', 'edit', 'view', 'delete'
  const [selectedUser, setSelectedUser] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Author', status: 'Active' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();

      if (response.ok) {
        // Map backend _id to id for frontend logic
        const formattedUsers = data.map(user => ({
          ...user,
          id: user._id,
          date: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }));
        setUsers(formattedUsers);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      toast.error('Error connecting to server');
    }
  };

  // Filter Logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = (user.name?.toLowerCase().includes(searchLower)) ||
        (user.email?.toLowerCase().includes(searchLower)) ||
        (user.role?.toLowerCase().includes(searchLower));

      let matchesTab = true;
      if (activeTab === 'Authors') matchesTab = user.role === 'Author';
      if (activeTab === 'Reviewers') matchesTab = user.role === 'Reviewer';
      if (activeTab === 'Editors') matchesTab = user.role === 'Editor';

      let matchesStatus = true;
      if (filterStatus !== 'All') {
        matchesStatus = user.status === filterStatus;
      }

      return matchesSearch && matchesTab && matchesStatus;
    });
  }, [users, searchTerm, activeTab, filterStatus]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / entriesPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

  const counts = {
    'All Users': users.length,
    'Authors': users.filter(u => u.role === 'Author').length,
    'Reviewers': users.filter(u => u.role === 'Reviewer').length,
    'Editors': users.filter(u => u.role === 'Editor').length,
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

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        toast.error('Authorization token missing');
        return;
      }

      if (modalType === 'add') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          // default password for new users, they can reset it later
          body: JSON.stringify({ ...formData, password: 'password123' })
        });
        const data = await response.json();

        if (response.ok) {
          const newUser = {
            ...data,
            id: data._id,
            date: new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          };
          setUsers([newUser, ...users]);
          toast.success('New user added successfully!');
          handleCloseModal();
        } else {
          toast.error(data.message || 'Failed to add user');
        }
      } else if (modalType === 'edit') {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        });
        const data = await response.json();

        if (response.ok) {
          setUsers(users.map(u => u.id === selectedUser.id ? {
            ...u, ...formData, initials: formData.name.substring(0, 2).toUpperCase(), status: formData.status
          } : u));
          toast.success('User updated successfully!');
          handleCloseModal();
        } else {
          toast.error(data.message || 'Failed to update user');
        }
      }
    } catch (error) {
      toast.error('Server connection error');
    }
  };

  const handleDeleteUser = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u.id !== selectedUser.id));
        toast.success('User deleted successfully!');
        handleCloseModal();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete user');
      }
    } catch (error) {
      toast.error('Server connection error');
    }
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
            <span className="trend positive"><MdArrowUpward /> 12.5% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{ animationDelay: '0.1s' }}>
          <div className="stat-icon-wrap green"><MdCheckCircle /></div>
          <div className="stat-content">
            <p>Active Users</p>
            <h3>{users.filter(u => u.status === 'Active').length}</h3>
            <span className="trend positive"><MdArrowUpward /> 10.3% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{ animationDelay: '0.2s' }}>
          <div className="stat-icon-wrap orange"><MdAccessTime /></div>
          <div className="stat-content">
            <p>New Users</p>
            <h3>{users.filter(u => new Date(u.createdAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</h3>
            <span className="trend positive"><MdArrowUpward /> 8.7% <span>from last month</span></span>
          </div>
        </div>
        <div className="stat-card stat-anim" style={{ animationDelay: '0.3s' }}>
          <div className="stat-icon-wrap purple"><MdBlock /></div>
          <div className="stat-content">
            <p>Inactive Users</p>
            <h3>{users.filter(u => u.status === 'Inactive').length}</h3>
            <span className="trend negative"><MdArrowDownward /> 3.2% <span>from last month</span></span>
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
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-filter" 
                onClick={() => setShowFilterMenu(!showFilterMenu)}
              >
                <MdFilterList /> {filterStatus === 'All' ? 'Filters' : filterStatus}
              </button>
              
              {showFilterMenu && (
                <div className="filter-dropdown" style={{
                  position: 'absolute', top: '100%', right: 0, marginTop: '5px',
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', zIndex: 10, width: '150px'
                }}>
                  <div style={{ padding: '8px', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>FILTER BY STATUS</div>
                  <div 
                    onClick={() => {setFilterStatus('All'); setShowFilterMenu(false); setCurrentPage(1);}}
                    style={{ padding: '8px 12px', cursor: 'pointer', background: filterStatus === 'All' ? '#f1f5f9' : 'transparent' }}
                  >All Users</div>
                  <div 
                    onClick={() => {setFilterStatus('Active'); setShowFilterMenu(false); setCurrentPage(1);}}
                    style={{ padding: '8px 12px', cursor: 'pointer', background: filterStatus === 'Active' ? '#f1f5f9' : 'transparent' }}
                  >Active</div>
                  <div 
                    onClick={() => {setFilterStatus('Inactive'); setShowFilterMenu(false); setCurrentPage(1);}}
                    style={{ padding: '8px 12px', cursor: 'pointer', background: filterStatus === 'Inactive' ? '#f1f5f9' : 'transparent' }}
                  >Inactive</div>
                </div>
              )}
            </div>
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
                  <td>{(currentPage - 1) * entriesPerPage + index + 1}</td>
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
                      <button className="action-btn view" title="View" onClick={() => navigate(`/users/${user._id || user.id}`)}><MdOutlineRemoveRedEye /></button>
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
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Role</label>
                      <select
                        disabled={modalType === 'view'}
                        value={formData.role}
                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                      >
                        <option value="Author">Author</option>
                        <option value="Reviewer">Reviewer</option>
                        <option value="Editor">Editor</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        disabled={modalType === 'view'}
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
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
