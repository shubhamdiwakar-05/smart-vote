import React, { useContext, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThemeContext } from '../contexts/ThemeContext';
import { Button } from './ui/button';
import { Moon, Sun, Menu, X, Vote, ShieldCheck } from 'lucide-react';
import { Show, UserButton } from '@clerk/react';
import { useAdminCheck } from '../hooks/useAdminCheck';
import { useTranslation } from 'react-i18next';
import GovBanner from './GovBanner';

// Keys mapped to locales
const navItems = [
  { key: 'home', path: '/' },
  { key: 'about', path: '/about' },
  { key: 'contact', path: '/contact' },
];

export default function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdmin } = useAdminCheck();
  const { t } = useTranslation();

  return (
    <>
      <GovBanner />
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="h-1 w-full bg-tricolor-gradient" />
        <div className="container mx-auto max-w-7xl px-4 flex h-16 items-center justify-between gap-4 border-b border-border/40">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 font-bold text-foreground hover:opacity-80 transition-opacity">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md border border-primary/20">
              <Vote className="h-5 w-5" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg leading-none tracking-tight mb-0.5">SmartVote</span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground font-semibold">National E-Voting Portal</span>
            </div>
          </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`
              }
            >
              {t(`nav.${item.key}`)}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Show when="signed-in">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-950/30 transition-all hover:shadow-[0_0_15px_rgba(220,38,38,0.15)]"
              >
                <ShieldCheck className="h-4 w-4" />
                {t('nav.admin')}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => navigate('/dashboard')} className="hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all">
              {t('nav.dashboard')}
            </Button>
            <UserButton afterSignOutUrl="/" />
          </Show>

          <Show when="signed-out">
            <Button variant="outline" size="sm" onClick={() => navigate('/login')} className="hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition-all">
              {t('nav.login')}
            </Button>
            <Button size="sm" onClick={() => navigate('/register')} className="hover:shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all">
              {t('nav.register')}
            </Button>
          </Show>
        </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="container mx-auto max-w-7xl">
              <div className="flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent'
                      }`
                    }
                  >
                    {t(`nav.${item.key}`)}
                  </NavLink>
                ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border mt-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="justify-start gap-2">
                  {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                </Button>
                <div className="my-2 h-px bg-border" />
                <Show when="signed-in">
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { navigate('/admin'); setOpen(false); }}
                      className="justify-start gap-2 border-red-200 text-red-600 dark:border-red-900/40 dark:text-red-400"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      {t('nav.admin')}
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => { navigate('/dashboard'); setOpen(false); }}>
                    {t('nav.dashboard')}
                  </Button>
                  <div className="py-2">
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </Show>
                
                <Show when="signed-out">
                  <Button variant="outline" size="sm" onClick={() => { navigate('/login'); setOpen(false); }}>
                    {t('nav.login')}
                  </Button>
                  <Button size="sm" onClick={() => { navigate('/register'); setOpen(false); }}>
                    {t('nav.register')}
                  </Button>
                </Show>
              </div>
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
    </>
  );
}
