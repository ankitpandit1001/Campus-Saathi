import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Read saved theme from localStorage (or fallback to 'system')
  const [theme, setThemeState] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('campusfix_theme');
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          return saved;
        }
      }
    } catch (e) {
      // ignore
    }
    return 'system';
  });

  // Track system preference
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Media query listener
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemIsDark(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Compute active dark mode state
  const isDark = useMemo(() => {
    if (theme === 'dark') return true;
    if (theme === 'light') return false;
    return systemIsDark;
  }, [theme, systemIsDark]);

  // Synchronize DOM elements (both html and body)
  const applyThemeToDOM = useCallback((dark) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    if (dark) {
      root.classList.add('dark');
      if (body) {
        body.classList.add('dark');
        body.style.backgroundColor = '#050814';
      }
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      root.style.backgroundColor = '#050814';
    } else {
      root.classList.remove('dark');
      if (body) {
        body.classList.remove('dark');
        body.style.backgroundColor = '#f8fafc';
      }
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      root.style.backgroundColor = '#f8fafc';
    }
  }, []);

  // Sync DOM whenever isDark changes
  useEffect(() => {
    applyThemeToDOM(isDark);
    try {
      localStorage.setItem('campusfix_theme', theme);
    } catch (e) {
      // ignore
    }
  }, [isDark, theme, applyThemeToDOM]);

  // Explicit theme setter (accepts 'dark', 'light', 'system', or callback)
  const setTheme = useCallback(
    (newTheme) => {
      setThemeState((prevTheme) => {
        const resolved = typeof newTheme === 'function' ? newTheme(prevTheme) : newTheme;
        try {
          localStorage.setItem('campusfix_theme', resolved);
        } catch (e) {}

        const effectiveDark =
          resolved === 'dark'
            ? true
            : resolved === 'light'
            ? false
            : typeof window !== 'undefined' && window.matchMedia
            ? window.matchMedia('(prefers-color-scheme: dark)').matches
            : false;

        applyThemeToDOM(effectiveDark);
        return resolved;
      });
    },
    [applyThemeToDOM]
  );

  // 1-click Toggle: reliably toggles to dark or light mode
  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const currentDark =
        prevTheme === 'dark'
          ? true
          : prevTheme === 'light'
          ? false
          : typeof window !== 'undefined' && window.matchMedia
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : false;

      return currentDark ? 'light' : 'dark';
    });
  }, [setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

