import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { databaseService, type User } from '../lib/database';
import { ensureSampleDataExists } from '../lib/sampleData';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user.id);
      } else {
        // For demo purposes, create a mock session
        createDemoSession();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const createDemoSession = async () => {
    try {
      // For demo purposes, we'll create a mock user session
      // In production, this would be handled by actual authentication
      const demoUser = await ensureSampleDataExists();
      if (demoUser) {
        setUser(demoUser);
      }
    } catch (err) {
      console.error('Error creating demo session:', err);
      setError('Failed to initialize demo session');
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (authUserId: string) => {
    try {
      setLoading(true);
      setError(null);

      const userData = await databaseService.getCurrentUser();
      if (userData) {
        setUser(userData);
      } else {
        // User exists in auth but not in our users table
        // This might happen during the signup process
        setError('User profile not found');
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // For demo purposes, check if it's the demo credentials
      if (email === 'demo@communityimpact.org' && password === 'demo123') {
        const demoUser = await ensureSampleDataExists();
        if (demoUser) {
          setUser(demoUser);
          return { success: true };
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before signing in.');
        } else {
          throw error;
        }
      }

      if (data.user) {
        await loadUserData(data.user.id);
        return { success: true };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters long');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        } else {
          throw error;
        }
      }

      if (data.user) {
        // Create user profile
        const newUser = await databaseService.createUser({
          email,
          name,
          auth_user_id: data.user.id,
        });

        if (newUser) {
          setUser(newUser);
        }

        // Check if email confirmation is required
        if (!data.session) {
          return { success: true, needsVerification: true };
        }

        return { success: true, needsVerification: false };
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        if (error.message.includes('User not found')) {
          throw new Error('No account found with this email address');
        } else {
          throw error;
        }
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, token: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });

      if (error) {
        if (error.message.includes('Token has expired')) {
          throw new Error('Verification code has expired. Please request a new one.');
        } else if (error.message.includes('Invalid token')) {
          throw new Error('Invalid verification code. Please check and try again.');
        } else {
          throw error;
        }
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to verify email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
      
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      
      if (data.user) {
        await loadUserData(data.user.id);
      }
      
      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Failed to refresh session');
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyEmail,
    updatePassword,
    refreshSession,
    clearError: () => setError(null)
  };
}