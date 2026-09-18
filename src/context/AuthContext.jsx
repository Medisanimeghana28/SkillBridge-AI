import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';
import { profileService } from '@/services/profileService';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const currentUser = await authService.getCurrentUser();
    setUser(currentUser);
    return currentUser;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } = { subscription: { unsubscribe: () => {} } } } =
      supabase.auth.onAuthStateChange(async (event, session) => {
        try {
          if (session?.user) {
            await refreshUser();
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Auth state change error:', error);
        } finally {
          setLoading(false);
        }
      });

    return () => {
      subscription?.unsubscribe?.();
    };
  }, [refreshUser]);

  const updateProfile = useCallback(async (updates) => {
    if (!user) throw new Error('No authenticated user.');
    const dbUpdates = { ...updates };
    if (typeof dbUpdates.hasCompletedOnboarding === 'boolean') {
      dbUpdates.has_completed_onboarding = dbUpdates.hasCompletedOnboarding;
      delete dbUpdates.hasCompletedOnboarding;
    }
    if (dbUpdates.targetRole !== undefined) {
      dbUpdates.target_role = dbUpdates.targetRole;
      delete dbUpdates.targetRole;
    }
    const updated = await profileService.updateProfile(user.id, dbUpdates);
    setUser((prev) => (prev ? { ...prev, ...toAppFields(updated), profile: updated } : prev));
    return updated;
  }, [user]);

  const value = {
    user,
    role: user?.role || null,
    loading,
    login: (email, password) => authService.login(email, password),
    register: (payload) => authService.register(payload),
    logout: async () => {
      await authService.logout();
      setUser(null);
    },
    resendConfirmation: (email) => authService.resendConfirmation(email),
    refreshUser,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

function toAppFields(profile) {
  if (!profile) return {};
  return {
    role: profile.role,
    hasCompletedOnboarding: profile.has_completed_onboarding ?? false,
    targetRole: profile.target_role || null,
  };
}

export const useAuth = () => {
  return useContext(AuthContext);
};
