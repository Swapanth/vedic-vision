import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ParticipantDashboard from './components/dashboard/participate/ParticipantDashboard';
import AdminDashboard from './components/dashboard/admin/AdminDashboard';
import MentorDashboard from './components/dashboard/mentor/MentorDashboard';
import Profile from './components/profile/Profile';
import Leaderboard from './components/leaderboard/Leaderboard';
import Landing from './components/landing/Landing';
import PhotoBooth from './components/photobooth/PhotoBooth';

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/photo-booth" element={<PhotoBooth />} />
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/swapanth/register" element={<Register />} />
              
              {/* Protected routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardWrapper />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/leaderboard"
                element={
                  <ProtectedRoute>
                    <Leaderboard />
                  </ProtectedRoute>
                }
              />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Component to render appropriate dashboard based on user role
const DashboardWrapper = () => {
  const { isSuperadmin, isMentor, isParticipant, user, loading } = useAuth();

  if (isSuperadmin) {
    return <AdminDashboard />;
  } else if (isMentor) {
    return <MentorDashboard />;
  } else if (isParticipant) {
    return <ParticipantDashboard />;
  } else {
    return <div>Error: Unknown user role: {user?.role}</div>;
  }
};

export default App;
