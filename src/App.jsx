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
import Faqs from './pages/Faqs';
import Enquiries from './pages/Enquiries';
import EditJournalPage from './pages/EditJournalPage';
import EditAboutPage from './pages/EditAboutPage';
import EditHomePage from './pages/EditHomePage';
import ManageHero from './pages/ManageHero';
import ManageReviews from './pages/ManageReviews';
import EditEditorialBoard from './pages/EditEditorialBoard';
import { Toaster } from 'react-hot-toast';
import './App.css';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Admin Layout Routes */}
        <Route element={<ProtectedRoute />}>
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
          <Route path="faqs" element={<Faqs />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="journal-policies/:slug" element={<EditJournalPage />} />
          <Route path="about-page" element={<EditAboutPage />} />
          <Route path="home-page" element={<EditHomePage />} />
          <Route path="manage-hero" element={<ManageHero />} />
          <Route path="manage-reviews" element={<ManageReviews />} />
          <Route path="editorial-board" element={<EditEditorialBoard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="change-password" element={<ChangePassword />} />
        </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
