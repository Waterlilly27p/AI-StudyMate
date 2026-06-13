/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Lock, MessageSquare, TrendingUp } from 'lucide-react';
import Sidebar from './components/Sidebar.jsx';
import Navbar from './components/Navbar.jsx';
import SearchModal from './components/SearchModal.jsx';
import FloatingAssistant from './components/FloatingAssistant.jsx';
import { api, getToken } from './services/api.js';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Explain from './pages/Explain.jsx';
import Summarize from './pages/Summarize.jsx';
import Quiz from './pages/Quiz.jsx';
import Flashcards from './pages/Flashcards.jsx';
import Chat from './pages/Chat.jsx';
import Profile from './pages/Profile.jsx';
import Locker from './pages/Locker.jsx';
import Planner from './pages/Planner.jsx';
import Assistant from './pages/Assistant.jsx';

/**
 * Protected layout that acts as our main application shell guard
 */
function ProtectedLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [token, setToken] = useState(getToken());

  // Ensure sidebar resets on resize so it doesn't break alignment across breakpoints
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);

    const handleAuthExpired = () => {
      setToken(null);
      navigate('/login', { replace: true });
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, [navigate]);
  
  if (!token) {
    // If no session token found, push the client back to the login landing pad
    return <Navigate to="/login" replace />;
  }

  // Determine Title based on pathname
  const pathname = location.pathname;
  let title = 'AI StudyMate';
  if (pathname === '/dashboard') title = 'Dashboard';
  else if (pathname === '/assistant') title = 'AI Assistant';
  else if (pathname === '/explain') title = 'Simple Explainer';
  else if (pathname === '/summarize') title = 'Quick Summarizer';
  else if (pathname === '/quiz') title = 'Practice Quizzes';
  else if (pathname === '/flashcards') title = 'Memory Cards';
  else if (pathname === '/chat') title = 'Chat with Files';
  else if (pathname === '/locker') title = 'Private Safe';
  else if (pathname === '/planner') title = 'Study Planner';
  else if (pathname === '/profile') title = 'My Progress';

  const mobileNavItems = [
    { name: 'Home', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Summaries', path: '/summarize', icon: FileText },
    { name: 'Private Safe', path: '/locker', icon: Lock },
    { name: 'AI Chat', path: '/chat', icon: MessageSquare },
    { name: 'My Progress', path: '/profile', icon: TrendingUp },
  ];

  return (
    <div className="flex h-[100dvh] w-[100dvw] bg-slate-50 overflow-hidden relative">
      {/* Sidebar - Desktop Layout (visible on lg+) and Mobile Drawer Layout */}
      <div className={`fixed inset-y-0 left-0 w-64 z-40 transform lg:relative lg:translate-x-0 transition-transform duration-300 lg:flex h-full shrink-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onMobileClose={() => setIsMobileOpen(false)} />
      </div>

      {/* Mobile backdrop overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-35 lg:hidden"
        />
      )}
      
      {/* Core main workspace viewport */}
      <div className="app-viewport-container flex-1 flex flex-col min-w-0 overflow-hidden pb-16 lg:pb-0 relative z-10 bg-slate-50">
        <Navbar onMobileOpen={() => setIsMobileOpen(true)} title={title} />
        <main className="flex-grow flex flex-col overflow-hidden h-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible only on screen < lg) */}
      <nav className={`app-bottom-nav fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 h-16 z-30 lg:hidden flex justify-center shadow-lg select-none transition-all duration-300 ${isMobileOpen ? 'translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'}`}>
        <div className="flex items-center justify-around w-full max-w-md px-2 pb-safe h-full">
          {mobileNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-bold tracking-tight transition-all duration-155
                ${isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon size={18} className={`mb-1 shrink-0 ${isActive ? 'stroke-[2.5] text-indigo-600' : 'stroke-[2] text-slate-400'}`} />
                  <span className="truncate max-w-full scale-90">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Global Quick-Navigation Search Bar */}
      <SearchModal />

      {/* Floating AI Assistant Pop Logo & Widget Container */}
      <FloatingAssistant />
    </div>
  );
}


export default function App() {
  useEffect(() => {
    const saved = localStorage.getItem('study-theme');
    if (saved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public view landing page hierarchy */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Guarded student portal locker pathways */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/explain" element={<Explain />} />
          <Route path="/summarize" element={<Summarize />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/locker" element={<Locker />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback structural reroute */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
