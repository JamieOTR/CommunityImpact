import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '../services/supabase';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth(): AdminAuthState {
  const { user } = useAuth();
  const [state, setState] = useState<AdminAuthState>({
    isAdmin: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkAdminStatus() {
      if (!user) {
        setState({ isAdmin: false, isLoading: false, error: null });
        return;
      }

      try {
        // Query the users table to check is_admin status
        const { data, error } = await supabase
          .from('users')
          .select('is_admin, community_id')
          .eq('auth_user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error checking admin status:', error);
          setState({ isAdmin: false, isLoading: false, error: error.message });
          return;
        }

        // User is admin if is_admin is true
        setState({
          isAdmin: data?.is_admin || false,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        console.error('Error in admin check:', err);
        setState({
          isAdmin: false,
          isLoading: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }

    checkAdminStatus();
  }, [user]);

  return state;
}
