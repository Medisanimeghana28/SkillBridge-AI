import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

const AuthContext = createContext();

const DEMO_STUDENT_USER = {
  id: 'u1',
  name: 'Aarav Sharma',
  email: 'student@demo.com',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const session = localStorage.getItem('sb_session');
      if (session === 'logged_out') return null;
      if (session) return JSON.parse(session);
      return DEMO_STUDENT_USER;
    } catch (e) {
      return DEMO_STUDENT_USER;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep local storage in sync
    if (user) {
      localStorage.setItem('sb_session', JSON.stringify(user));
    }
  }, [user]);

  const login = async (email, password) => {
    const userData = await authService.login(email, password);
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
