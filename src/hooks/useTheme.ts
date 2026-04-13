import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
const KEY = 'ss-theme';

function getInitial(): Theme {
  const stored = localStorage.getItem(KEY) as Theme | null;
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const toggle = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
};
