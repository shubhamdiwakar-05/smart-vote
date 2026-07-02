import { useState, useEffect } from 'react';
import { useUser } from '@clerk/react';
import { supabase } from '../lib/supabaseClient';

/**
 * Custom hook that checks if the currently authenticated user is an admin.
 * Fetches the profiles table and reads is_admin.
 */
export function useAdminCheck() {
  const { user: clerkUser, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!clerkUser) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', clerkUser.id)
          .maybeSingle();

        if (error) {
          console.error('Admin check error:', error);
          setIsAdmin(false);
        } else {
          setIsAdmin(data?.is_admin === true);
        }
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [clerkUser, isLoaded]);

  return { isAdmin, loading };
}
