import { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

function resolveTheme(choice) {
  if (choice === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  }
  return choice === 'dark' ? 'dark' : 'light';
}

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeChoice] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sb_theme') || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const apply = () => {
      const resolved = resolveTheme(localStorage.getItem('sb_theme') || 'system');
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    };
    apply();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if ((localStorage.getItem('sb_theme') || 'system') === 'system') apply();
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((choice) => {
    const next = ['light', 'dark', 'system'].includes(choice) ? choice : 'light';
    localStorage.setItem('sb_theme', next);
    setThemeChoice(next);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolveTheme(next));
  }, []);

  const toggleTheme = useCallback(() => {
    const resolved = resolveTheme(theme);
    setTheme(resolved === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
