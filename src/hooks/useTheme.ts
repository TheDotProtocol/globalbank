'use client';

import { useState, useEffect } from 'react';

export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);
  const theme: 'light' | 'dark' = darkMode ? 'dark' : 'light';

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setDarkMode((prev) => !prev);

  return { darkMode, theme, toggleTheme };
}
