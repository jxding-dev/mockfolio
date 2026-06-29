import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './themeContext';

const STORAGE_KEY = 'mf_theme';

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function readInitial(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch { /* ignore */ }
  return systemPrefersDark() ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitial);

  // Apply the resolved theme to <html> and keep the address-bar color in sync.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0F172A' : '#6366F1');
  }, [theme]);

  // Follow the OS theme until the user makes an explicit choice.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        if (!window.localStorage.getItem(STORAGE_KEY)) setThemeState(mq.matches ? 'dark' : 'light');
      } catch { /* ignore */ }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const setTheme = useCallback((t: Theme) => {
    try { window.localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
    setThemeState(t);
  }, []);

  const toggle = useCallback(() => setTheme(theme === 'dark' ? 'light' : 'dark'), [theme, setTheme]);

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}
