import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HelpCircle, 
  FileText, 
  BookOpen, 
  Layers, 
  MessageSquare, 
  TrendingUp, 
  Award, 
  Loader2,
  Trash2,
  Lock
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = api.getCurrentUser();

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const progress = await api.getProgressSummary();
        setStats(progress);
      } catch (err) {
        console.error('Error fetching dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Assembling student desktop...</span>
        </div>
      </div>
    );
  }

  const recentNotesCount = stats?.statistics?.notesSummarized || 0;
  const recentQuizzesCount = stats?.statistics?.quizzesGenerated || 0;
  const recentCardsCount = stats?.statistics?.flashcardsCreated || 0;
  const recentScore = stats?.statistics?.averageQuizScore || 0;

  // Compute percentage levels for progress indicators nicely
  const quizzesPercent = Math.min(100, Math.max(15, (recentQuizzesCount / 12) * 100));
  const notesPercent = Math.min(100, Math.max(10, (recentNotesCount / 30) * 100));
  const accuracyPercent = recentScore > 0 ? recentScore : 75;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-slate-50">
      {/* 4-Column Stat Summary Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* STAT 1: NOTES SUMMARIZED */}
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 shadow-sm min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 flex items-center justify-center border border-indigo-100">
            <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <span className="block text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight mb-1">Vault Files</span>
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-850 leading-tight block" title={`${recentNotesCount} Summarized`}>
              {recentNotesCount} Summarized
            </span>
          </div>
        </div>

        {/* STAT 2: QUIZZES GENERATED */}
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 shadow-sm min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-50 text-orange-600 shrink-0 flex items-center justify-center border border-orange-100">
            <BookOpen size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <span className="block text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight mb-1">Quiz Exercises</span>
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-850 leading-tight block">
              {recentQuizzesCount} Decks
            </span>
          </div>
        </div>

        {/* STAT 3: FLASHCARDS */}
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 shadow-sm min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-600 shrink-0 flex items-center justify-center border border-purple-100">
            <Layers size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <span className="block text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight mb-1">Recall Decks</span>
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-850 leading-tight block">
              {recentCardsCount} Batches
            </span>
          </div>
        </div>

        {/* STAT 4: RETENTION ACCURACY */}
        <div className="bg-white border border-slate-200 p-3.5 sm:p-4.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-4 shadow-sm min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 flex items-center justify-center border border-emerald-100">
            <Award size={16} className="sm:w-[18px] sm:h-[18px]" />
          </div>
          <div className="min-w-0 flex-1 w-full">
            <span className="block text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-tight mb-1">Knowledge Guard</span>
            <span className="text-sm sm:text-base md:text-lg font-black text-slate-850 leading-tight block">
              {recentScore}% Score
            </span>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROW 1 CARD 1: Simple Explainer */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-indigo-200/60 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">Simple Explainer</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Break down complex terms, ideas, coding blocks, or laws into basic, layperson terms using AI.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/explain')}
            className="mt-6 w-full py-2.5 px-4 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-xs border border-indigo-100/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-200 cursor-pointer animate-none"
          >
            Start Explaining
          </button>
        </div>

        {/* ROW 1 CARD 2: Quick Summarizer */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-purple-200/60 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-50 border border-purple-150 rounded-2xl flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-purple-600 transition-colors">Quick Summarizer</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Upload PDF manuals, articles, books, or texts to create beautifully structured key bullet points instantly.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/summarize')}
            className="mt-6 w-full py-2.5 px-4 bg-purple-50 text-purple-600 font-bold rounded-xl text-xs border border-purple-100/60 group-hover:bg-purple-600 group-hover:text-white group-hover:border-purple-600 transition-all duration-200 cursor-pointer"
          >
            Upload Files
          </button>
        </div>

        {/* ROW 1 CARD 3: Practice Quizzes */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-orange-200/60 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-orange-50 border border-orange-150 rounded-2xl flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-orange-600 transition-colors">Practice Quizzes</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Prepare automated multiple-choice or true/false practice questionnaires to check your learning level.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/quiz')}
            className="mt-6 w-full py-2.5 px-4 bg-orange-50 text-orange-600 font-bold rounded-xl text-xs border border-orange-100/60 group-hover:bg-orange-600 group-hover:text-white group-hover:border-orange-600 transition-all duration-200 cursor-pointer"
          >
            Take a Quiz
          </button>
        </div>

        {/* ROW 2 CARD 1: Study Planner */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-pink-200 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-pink-50 border border-pink-150 rounded-2xl flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-pink-600 transition-colors">Study Planner</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Generate realistic, step-by-step AI study plans tailored to your timeline, syllabus, and difficulty level.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/planner')}
            className="mt-6 w-full py-2.5 px-4 bg-pink-50 text-pink-600 font-bold rounded-xl text-xs border border-pink-100/60 group-hover:bg-pink-600 group-hover:text-white group-hover:border-pink-600 transition-all duration-200 cursor-pointer font-bold"
          >
            Create Plan
          </button>
        </div>

        {/* ROW 2 CARD 2: Private Safe */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-amber-200 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-50 border border-amber-150 rounded-2xl flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-amber-650 transition-colors">Private Safe</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Lock away summaries and files with individual security PIN combinations to keep your data private.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/locker')}
            className="mt-6 w-full py-2.5 px-4 bg-amber-50 text-amber-600 font-bold rounded-xl text-xs border border-amber-100/65 group-hover:bg-amber-600 group-hover:text-white group-hover:border-amber-600 transition-all duration-200 cursor-pointer font-bold"
          >
            Open Private Safe
          </button>
        </div>

        {/* ROW 2 CARD 3: Memory Cards */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between group hover:shadow-md hover:border-emerald-250 transition-all duration-250">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors">Memory Cards</h3>
              <p className="text-sm text-slate-500 leading-relaxed">Active recall memory decks designed to cement core facts, foreign vocabularies, definitions, and equations.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/flashcards')}
            className="mt-6 w-full py-2.5 px-4 bg-emerald-50 text-emerald-600 font-bold rounded-xl text-xs border border-emerald-100/60 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all duration-200 cursor-pointer font-bold"
          >
            Review Memory Cards
          </button>
        </div>

        {/* ROW 3: Chat with Notes Showcase - Span 2 columns */}
        <div className="bg-indigo-950 rounded-3xl p-6 lg:p-8 text-white lg:col-span-2 flex flex-col md:flex-row items-stretch justify-between gap-6 overflow-hidden relative shadow-lg border border-indigo-900">
          {/* Decorative glowing gradient circle */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500 rounded-full opacity-35 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 space-y-4 flex flex-col justify-between md:w-3/5">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-indigo-200 text-[10px] font-bold uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                New Features Live
              </div>
              <h3 className="text-2xl lg:text-3xl font-black leading-tight text-white font-sans">Chat with Study Files</h3>
              <p className="text-indigo-155 text-xs sm:text-sm leading-relaxed text-indigo-100 font-sans">
                Type direct natural questions about any PDF file. Perfect for explaining complex chapters, searching key terms quickly, and reviewing essential take-homes.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button 
                onClick={() => navigate('/chat')}
                className="px-5 py-2.5 bg-white text-indigo-950 hover:bg-slate-100 rounded-full font-extrabold text-xs shadow-md active:scale-95 transition cursor-pointer"
              >
                Start Chatting
              </button>
              <button 
                onClick={() => navigate('/flashcards')}
                className="px-5 py-2.5 bg-indigo-900 text-white hover:bg-indigo-850 rounded-full font-extrabold text-xs border border-white/10 active:scale-95 transition cursor-pointer"
              >
                Review Memory Cards
              </button>
            </div>
          </div>

          {/* Interactive preview UI panel inside Showcase */}
          <div className="md:w-1/3 shrink-0 bg-white/10 rounded-2xl backdrop-blur-md border border-white/15 p-4.5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex gap-1.5 items-center font-sans">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400/80"></div>
              </div>
              <div className="h-3 w-4/5 bg-white/20 rounded-full animate-pulse"></div>
              <div className="h-3 w-1/2 bg-white/15 rounded-full"></div>
            </div>
            <div className="bg-indigo-950/40 p-2.5 rounded-xl border border-white/10 text-[10px] text-indigo-200 font-mono">
              <p className="text-white font-bold mb-1">chat_helper.log</p>
              <p>&gt; Indexing complete</p>
              <p>&gt; 100% key-fact accuracy</p>
            </div>
          </div>
        </div>

        {/* ROW 3 CARD 3: Progress Summary Chart Widget */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-800">Knowledge Stats</h3>
              <Link to="/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Analytics</Link>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Quizzes Handled</span>
                  <span className="font-bold text-indigo-600">{recentQuizzesCount} / 12</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-300" style={{ width: `${quizzesPercent}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Documents Analyzed</span>
                  <span className="font-bold text-purple-600">{recentNotesCount} Files</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-300" style={{ width: `${notesPercent}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Avg Retention Accuracy</span>
                  <span className="font-bold text-emerald-600">{accuracyPercent}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${accuracyPercent}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Activity Chart Columns Matching spec exactly */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-end justify-between px-1 h-14">
            <div className="text-center">
              <div className="w-3.5 h-[1.5rem] bg-indigo-155 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">M</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[2.5rem] bg-indigo-200 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">T</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[1rem] bg-indigo-100 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">W</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[3rem] bg-indigo-500 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">T</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[2.2rem] bg-indigo-400 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">F</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[1.8rem] bg-indigo-300 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">S</span>
            </div>
            <div className="text-center">
              <div className="w-3.5 h-[0.5rem] bg-slate-100 rounded-sm mx-auto"></div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1">S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Activity Stream */}
      <div className="bg-white border border-slate-200 rounded-2xl h-14 px-5 sm:px-6 flex items-center justify-between text-xs font-semibold shadow-sm select-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">Live Log:</span>
          <p className="text-slate-600 truncate animate-fade-in">
            {stats?.recentActivities && stats.recentActivities.length > 0 
              ? `${stats.recentActivities[0].title} — ${stats.recentActivities[0].details}` 
              : 'Setup learning metrics tracker successfully'}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400 shrink-0">
          <span>v2.4.0-stable-js</span>
        </div>
      </div>
    </div>
  );
}
