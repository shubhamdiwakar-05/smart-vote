import React, { useEffect, useMemo, useState } from 'react';
import { Toaster, toast } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import { ThemeContext } from './contexts/ThemeContext';

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = window.localStorage.getItem('smart-vote-theme');
    return saved || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('smart-vote-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  const themeContext = useMemo(
    () => ({ theme, toggleTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={themeContext}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
        <Toaster richColors position="bottom-right" theme={theme} />
      </div>
    </ThemeContext.Provider>
  );
}

export default App;
