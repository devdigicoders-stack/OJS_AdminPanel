import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Journals from './pages/Journals';
import JournalDetails from './pages/JournalDetails';
import UserDetails from './pages/UserDetails';
import Announcements from './pages/Announcements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ChangePassword from './pages/ChangePassword';
import UpdateStatus from './pages/UpdateStatus';
import ApproveReject from './pages/ApproveReject';
import Publish from './pages/Publish';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Layout Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="journals" element={<Journals />} />
          <Route path="journals/:id" element={<JournalDetails />} />
          <Route path="update-status" element={<UpdateStatus />} />
          <Route path="approve-reject" element={<ApproveReject />} />
          <Route path="publish" element={<Publish />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
