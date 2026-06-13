import { useState, useEffect } from 'react';
import { Menu, Calendar, Sparkles, Search, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Navbar({ onMobileOpen, title }) {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();
  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Learner';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('study-theme');
    if (saved) return saved;
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('study-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
  const shortcutHint = isMac ? '⌘K' : 'Ctrl+K';

  // Dynamic subtitle generation for exact High Density layout
  let headerTitle = title;
  let subtitle = 'Empower your mind with AI-enhanced learning tools';

  if (title === 'Dashboard') {
    headerTitle = `Welcome back, ${firstName}`;
    subtitle = 'What would you like to study or learn today?';
  } else if (title === 'Simple Explainer') {
    headerTitle = 'Simple Explainer';
    subtitle = 'Explain any complex topic, coding language, or terminology in everyday terms.';
  } else if (title === 'Quick Summarizer') {
    headerTitle = 'Quick Summarizer';
    subtitle = 'Turn articles, documents, notes, or pasted texts into instant, clear bullet summaries.';
  } else if (title === 'Practice Quizzes') {
    headerTitle = 'Practice Quizzes';
    subtitle = 'Test your retention and understand any topic with automated quizzes.';
  } else if (title === 'Memory Cards') {
    headerTitle = 'Memory Cards';
    subtitle = 'Interactive recall cards to lock in key facts, vocabularies, and study concepts.';
  } else if (title === 'Chat with Files') {
    headerTitle = 'Chat with Files';
    subtitle = 'Ask questions, retrieve key points, and query your study materials directly.';
  } else if (title === 'My Progress') {
    headerTitle = 'My Learning Progress';
    subtitle = 'Review your score reports, study history, and milestone streaks.';
  } else if (title === 'Private Safe') {
    headerTitle = 'Private Safe Folder';
    subtitle = 'Keep your summaries and notes safe with private PIN passcode protection.';
  }

  return (
    <header className="main-navbar h-20 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 select-none">
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile menu trigger */}
        <button
          onClick={onMobileOpen}
          className="lg:hidden text-slate-500 hover:text-slate-800 hover:bg-slate-100 p-2 rounded-xl transition"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        
        {/* Title and Subtitle Block */}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight truncate leading-none mb-1">
            {headerTitle}
          </h1>
          <p className="text-xs text-slate-500 font-medium truncate hidden sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        {/* Functional Quick-Navigation Search Trigger (Desktop) */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-global-search'))}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-semibold transition duration-150 cursor-pointer shadow-xs active:scale-95 select-none"
          title={`Open Search Index (${isMac ? 'Cmd' : 'Ctrl'} + K)`}
        >
          <Search size={13} className="text-primary dark:text-primary shrink-0" />
          <span>Search library...</span>
          <span className="ml-1 px-1.5 py-0.2 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-700 text-[10px] text-slate-400 rounded leading-none shrink-0">
            {shortcutHint}
          </span>
        </button>

        {/* Mobile/Tablet Search Icon Trigger */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('toggle-global-search'))}
          className="lg:hidden flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl transition duration-150 cursor-pointer shadow-xs active:scale-95 select-none"
          title="Open Search"
        >
          <Search size={15} className="text-primary dark:text-primary shrink-0" />
        </button>

        {/* Date visual pill */}
        <div className="hidden sm:flex items-center text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold gap-2">
          <Calendar size={13} className="text-primary shrink-0" />
          <span>{today}</span>
        </div>

        {/* Active Engine status badge */}
        <div className="hidden xl:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase scale-90">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>AI Active</span>
        </div>

        {/* Light/Dark Theme Switcher Toggler */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-xl transition duration-150 cursor-pointer shadow-sm select-none"
          title={`Switch to ${theme === 'light' ? 'Dark Mode (Late-Night Study)' : 'Light Mode'}`}
        >
          {theme === 'light' ? (
            <Moon size={16} className="text-primary fill-primary/10" />
          ) : (
            <Sun size={16} className="text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
          )}
        </button>

        {/* User avatar with gradient background matching spec exactly */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right hidden md:block">
            <span 
              onClick={() => navigate('/profile')}
              className="block text-xs font-bold text-slate-800 leading-tight cursor-pointer hover:text-primary transition duration-150"
              title="View Profile Stats"
            >
              {currentUser?.name || 'Learner'}
            </span>
            <span 
              onClick={() => navigate('/locker')}
              className="text-[9px] text-slate-400 font-extrabold uppercase tracking-widest cursor-pointer hover:text-amber-600 transition duration-150 inline-block mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/50"
              title="Open Private Safe"
            >
              🔐 Private Safe
            </span>
          </div>
          <div 
            onClick={() => navigate('/profile')}
            className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-hover border-2 border-white shadow-sm flex items-center justify-center font-bold text-white text-xs select-none shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150"
            title="View Profile Stats"
          >
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
          </div>
        </div>
      </div>
    </header>
  );
}
