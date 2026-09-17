import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } = { subscription: { unsubscribe: () => {} } } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, []);

  const value = {
    user,
    role: user?.profile?.role || null,
    loading,
    login: (email, password) => authService.login(email, password),
    register: (payload) => authService.register(payload),
    logout: () => authService.logout()
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
