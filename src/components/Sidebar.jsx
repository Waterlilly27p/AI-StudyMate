import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  HelpCircle, 
  Layers, 
  MessageSquare, 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  User, 
  LogOut,
  X,
  Flame,
  Zap,
  Sparkles,
  Lock,
  Calendar,
  Mail,
  Bot
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Sidebar({ onMobileClose }) {
  const navigate = useNavigate();
  const currentUser = api.getCurrentUser();
  const [streak, setStreak] = useState(0);
  const [completePercent, setCompletePercent] = useState(0);

  useEffect(() => {
    async function loadStreakInfo() {
      try {
        const stats = await api.getProgressSummary();
        const baseStreak = stats?.statistics?.currentStreak || 0;
        setStreak(baseStreak);
        const percent = Math.min(100, Math.floor((baseStreak / (baseStreak + 3 || 1)) * 100));
        setCompletePercent(percent);
      } catch (err) {
        console.error('Error getting progress for streak:', err);
      }
    }
    if (currentUser) {
      loadStreakInfo();
    }
  }, [currentUser]);

  const handleLogout = () => {
    api.logout();
    if (onMobileClose) onMobileClose();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Assistant', path: '/assistant', icon: Sparkles },
    { name: 'Simple Explainer', path: '/explain', icon: HelpCircle },
    { name: 'Quick Summarizer', path: '/summarize', icon: FileText },
    { name: 'Practice Quizzes', path: '/quiz', icon: BookOpen },
    { name: 'Memory Cards', path: '/flashcards', icon: Layers },
    { name: 'Chat with Files', path: '/chat', icon: MessageSquare },
    { name: 'Study Planner', path: '/planner', icon: Calendar },
    { name: 'Private Safe', path: '/locker', icon: Lock },
    { name: 'My Progress', path: '/profile', icon: TrendingUp },
  ];

  return (
    <aside className="w-64 bg-indigo-950 text-white flex flex-col h-full border-r border-indigo-900/60 p-5 shadow-2xl relative z-10">
      {/* Sidebar Header logo */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-indigo-900/40">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-9 h-9 bg-indigo-900 rounded-xl flex items-center justify-center border border-indigo-500/25 shadow-md">
            <Bot size={18} className="text-white animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white select-none block leading-tight font-sans">
              AI StudyMate
            </span>
            <span className="text-[9px] text-[#8f8ff5] tracking-widest font-bold uppercase block leading-none mt-0.5">
              Smart Study Hub
            </span>
          </div>
        </div>
        {onMobileClose && (
          <button 
            onClick={onMobileClose}
            className="lg:hidden text-indigo-300 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        )}
      </div>      {/* Scrollable Layout Content Container */}
      <div className="flex-1 flex flex-col overflow-y-auto pr-1 -mr-2 space-y-5">
        {/* Navigation Section */}
        <nav className="space-y-1.5 shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onMobileClose && onMobileClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs tracking-wide transition-all duration-150 border
                ${isActive 
                  ? 'bg-white/10 text-white border-white/10 shadow-md shadow-indigo-950/20 font-bold' 
                  : 'text-indigo-200 border-transparent hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={16} className="shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Streak Dashboard widget inside scroll block */}
        {currentUser && (
          <div className="p-4 bg-indigo-900/50 border border-indigo-800/30 rounded-2xl shrink-0">
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                <Flame size={14} className="fill-orange-200 text-orange-600" />
              </div>
              <div>
                <div className="text-[10px] text-indigo-300 font-bold tracking-wider uppercase leading-none">Streak Count</div>
                <div className="text-xs font-extrabold text-white">{streak} DAY STREAK</div>
              </div>
            </div>
            <div className="w-full bg-indigo-950/80 h-1.5 rounded-full overflow-hidden border border-indigo-900/40">
              <div 
                className="bg-gradient-to-r from-orange-400 to-indigo-400 h-full rounded-full transition-all duration-300"
                style={{ width: `${completePercent}%` }}
              ></div>
            </div>
            <p className="text-[10px] mt-2 text-indigo-300 font-medium font-mono">Next Milestone: {streak + 3} Days</p>
          </div>
        )}

        {/* Sidebar Footer User Details inside scroll block */}
        <div className="pt-4 border-t border-indigo-900/40 bg-indigo-950 shrink-0">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-full bg-indigo-900 flex items-center justify-center shrink-0 border border-indigo-800/30">
              <User size={16} className="text-indigo-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-100 truncate">{currentUser?.name || 'Learner'}</p>
              <p className="text-[10px] text-indigo-300 truncate font-mono">{currentUser?.email || 'learner@domain.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-indigo-900/30 hover:bg-rose-950/30 hover:border-rose-900/45 hover:text-rose-200 text-indigo-200 border border-indigo-900/50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer"
          >
            <LogOut size={13} />
            <span>Secure Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
