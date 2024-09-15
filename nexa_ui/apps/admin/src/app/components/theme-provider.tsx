import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext({
  theme: window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light',
  setTheme: (theme: string) => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState("light");

  useEffect(()=>{
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
