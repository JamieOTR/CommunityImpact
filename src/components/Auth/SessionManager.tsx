import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import { useAuth } from '../../hooks/useAuth';

export default function SessionManager() {
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<number | null>(null);
  const { refreshSession, signOut, user } = useAuth();

  useEffect(() => {
    if (!user) return;

    // Check session expiry every minute
    const interval = setInterval(() => {
      checkSessionExpiry();
    }, 60000);

    // Initial check
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [user]);

  const checkSessionExpiry = () => {
    // In a real app, you'd get this from the JWT token
    // For demo purposes, we'll simulate session expiry
    const sessionStart = localStorage.getItem('session_start');
    if (!sessionStart) {
      localStorage.setItem('session_start', Date.now().toString());
      return;
    }

    const elapsed = Date.now() - parseInt(sessionStart);
    const sessionDuration = 60 * 60 * 1000; // 1 hour
    const warningThreshold = 10 * 60 * 1000; // 10 minutes before expiry

    const timeLeft = sessionDuration - elapsed;

    if (timeLeft <= 0) {
      // Session expired
      handleSessionExpired();
    } else if (timeLeft <= warningThreshold) {
      // Show warning
      setSessionTimeLeft(Math.floor(timeLeft / 60000)); // minutes
      setShowSessionWarning(true);
    }
  };

  const handleSessionExpired = async () => {
    localStorage.removeItem('session_start');
    await signOut();
    alert('Your session has expired. Please sign in again.');
  };

  const handleRefreshSession = async () => {
    try {
      await refreshSession();
      localStorage.setItem('session_start', Date.now().toString());
      setShowSessionWarning(false);
      setSessionTimeLeft(null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const handleSignOut = async () => {
    localStorage.removeItem('session_start');
    await signOut();
  };

  return (
    <AnimatePresence>
      {showSessionWarning && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 right-4 z-50 w-80"
        >
          <Card className="border-yellow-200 bg-yellow-50">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-yellow-800">
                  Session Expiring Soon
                </h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your session will expire in {sessionTimeLeft} minute{sessionTimeLeft !== 1 ? 's' : ''}. 
                  Would you like to extend it?
                </p>
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={handleRefreshSession}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Extend Session
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSignOut}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    <LogOut className="w-3 h-3 mr-1" />
                    Sign Out
                  </Button>
                </div>
              </div>
              <button
                onClick={() => setShowSessionWarning(false)}
                className="text-yellow-600 hover:text-yellow-800"
              >
                ×
              </button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}