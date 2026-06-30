import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('ca_theme');
    const isLight = saved === 'light';
    if (isLight) document.documentElement.classList.add('light');
    return !isLight;
  });

  function toggle() {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem('ca_theme', next ? 'dark' : 'light');
      document.documentElement.classList.toggle('light', !next);
      return next;
    });
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
