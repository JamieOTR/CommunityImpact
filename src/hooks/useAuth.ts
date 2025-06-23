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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await loadUserData(data.user.id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

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
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
}