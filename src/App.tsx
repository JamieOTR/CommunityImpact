import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AIChat from './components/Chat/AIChat';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Milestones from './pages/Milestones';
import Community from './pages/Community';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Landing page without header/footer */}
          <Route path="/" element={<Landing />} />
          
          {/* App pages with header/footer */}
          <Route path="/dashboard" element={
            <>
              <Header />
              <main className="flex-1">
                <Dashboard />
              </main>
              <Footer />
              <AIChat />
            </>
          } />
          
          <Route path="/milestones" element={
            <>
              <Header />
              <main className="flex-1">
                <Milestones />
              </main>
              <Footer />
              <AIChat />
            </>
          } />
          
          <Route path="/community" element={
            <>
              <Header />
              <main className="flex-1">
                <Community />
              </main>
              <Footer />
              <AIChat />
            </>
          } />
          
          <Route path="/profile" element={
            <>
              <Header />
              <main className="flex-1">
                <Profile />
              </main>
              <Footer />
              <AIChat />
            </>
          } />

          <Route path="/admin" element={
            <>
              <Header />
              <main className="flex-1">
                <AdminDashboard />
              </main>
              <Footer />
            </>
          } />

          {/* Redirect unknown routes to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;