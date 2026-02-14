import React, { useEffect } from 'react';
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
import NotAuthorized from './pages/NotAuthorized';
import { ProtectedAdminRoute } from './components/Admin/ProtectedAdminRoute';
import AdminOverview from './pages/admin/AdminOverview';
import AdminPrograms from './pages/admin/AdminPrograms';
import AdminMilestones from './pages/admin/AdminMilestones';
import AdminSubmissions from './pages/admin/AdminSubmissions';
import AdminRewards from './pages/admin/AdminRewards';
import AdminSettings from './pages/admin/AdminSettings';
import AdminSeedData from './pages/admin/AdminSeedData';
import { useAuth } from './hooks/useAuth';
import { supabase } from './services/supabase';
import { databaseService } from './services/database';

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Handle email confirmation when user returns from email link
    const handleEmailConfirmation = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (data.session?.user && !user) {
        // User just confirmed their email, create their profile if it doesn't exist
        try {
          const existingUser = await databaseService.getCurrentUser();
          if (!existingUser) {
            // Create user profile from auth user data
            const authUser = data.session.user;
            await databaseService.createUser({
              email: authUser.email!,
              name: authUser.user_metadata?.full_name || authUser.email!.split('@')[0],
              auth_user_id: authUser.id,
            });
          }
        } catch (error) {
          console.error('Error creating user profile after email confirmation:', error);
        }
      }
    };

    handleEmailConfirmation();
  }, [user]);

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

          <Route path="/programs" element={
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

          {/* Not Authorized page */}
          <Route path="/not-authorized" element={<NotAuthorized />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedAdminRoute>
              <AdminOverview />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/programs" element={
            <ProtectedAdminRoute>
              <AdminPrograms />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/milestones" element={
            <ProtectedAdminRoute>
              <AdminMilestones />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/submissions" element={
            <ProtectedAdminRoute>
              <AdminSubmissions />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/rewards" element={
            <ProtectedAdminRoute>
              <AdminRewards />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedAdminRoute>
              <AdminSettings />
            </ProtectedAdminRoute>
          } />
          <Route path="/admin/seed-data" element={
            <ProtectedAdminRoute>
              <AdminSeedData />
            </ProtectedAdminRoute>
          } />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;