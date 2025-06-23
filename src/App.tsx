import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import SessionManager from './components/Auth/SessionManager';
import AIChat from './components/Chat/AIChat';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Milestones from './pages/Milestones';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Landing page without header/footer */}
          <Route path="/" element={<Landing />} />
          
          {/* Password reset page */}
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected app pages with header/footer */}
          <Route path="/dashboard" element={
            user ? (
              <>
                <Header />
                <main className="flex-1">
                  <Dashboard />
                </main>
                <Footer />
                <AIChat />
                <SessionManager />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          <Route path="/milestones" element={
            user ? (
              <>
                <Header />
                <main className="flex-1">
                  <Milestones />
                </main>
                <Footer />
                <AIChat />
                <SessionManager />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          <Route path="/community" element={
            user ? (
              <>
                <Header />
                <main className="flex-1">
                  <Community />
                </main>
                <Footer />
                <AIChat />
                <SessionManager />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />
          
          <Route path="/profile" element={
            user ? (
              <>
                <Header />
                <main className="flex-1">
                  <Profile />
                </main>
                <Footer />
                <AIChat />
                <SessionManager />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />

          <Route path="/admin" element={
            user ? (
              <>
                <Header />
                <main className="flex-1">
                  <AdminDashboard />
                </main>
                <Footer />
                <SessionManager />
              </>
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;