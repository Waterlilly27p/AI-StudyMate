import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, HelpCircle, FileText, BookOpen, Layers, MessageSquare, ArrowRight, CheckCircle, Zap, Mail, Phone, MapPin, Bot, ChevronDown, ChevronUp, X, ShieldCheck, Scale } from 'lucide-react';
import { api, getToken } from '../services/api.js';

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!getToken();

  // State management for FAQ section
  const [openFaq, setOpenFaq] = useState({});

  // State management for Privacy & Terms modals
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const toggleFaq = (idx) => {
    setOpenFaq(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  useEffect(() => {
    // Check if dark class was active on the root document element
    const hadDark = document.documentElement.classList.contains('dark');
    
    // Always remove 'dark' class on Home viewport mount to stay in pristine light mode
    document.documentElement.classList.remove('dark');
    
    return () => {
      // Re-apply dark mode class if it was previously active when leaving the Home landing page
      if (hadDark) {
        document.documentElement.classList.add('dark');
      }
    };
  }, []);

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const featurePillars = [
    {
      title: "Topic Explainer",
      description: "Break down complex concepts into simple, clear explanations.",
      icon: HelpCircle,
      badge: "Clarify"
    },
    {
      title: "Quick Synopsis",
      description: "Summarize books, files, and dense records instantly.",
      icon: FileText,
      badge: "Summarize"
    },
    {
      title: "Practice Quizzes",
      description: "Convert any lesson into interactive multiple-choice tests.",
      icon: BookOpen,
      badge: "Recall"
    },
    {
      title: "Recall Flashcards",
      description: "Generate adaptive study decks for rapid exam revision.",
      icon: Layers,
      badge: "Memorize"
    },
    {
      title: "Document Chat",
      description: "Chat with your private vault to find answers fast.",
      icon: MessageSquare,
      badge: "Understand"
    }
  ];

  const faqs = [
    {
      question: "What files can I upload to AI StudyMate?",
      answer: "We support PDF, DOCX, and TXT files up to 10MB in size. You can also paste copied texts directly into our tools for instant processing."
    },
    {
      question: "How accurate is the study material generator?",
      answer: "Highly accurate! Powered by Google Gemini, the AI analyzes your uploads to extract key terms, generate custom practice quiz questions, write precise summaries, and build active-recall memory cards that match your exact content."
    },
    {
      question: "Is my study locker safe and private?",
      answer: "Completely. Your private locker is secured under your account credentials. For highly sensitive papers, you can configure an optional Security PIN to establish a dual-locked vault inside your locker profile."
    },
    {
      question: "Is AI StudyMate free to use?",
      answer: "Yes, joining and starting to learn is completely free. You can use all core AI tools, quizzes, flashcards, and explainers without any upfront cost."
    },
    {
      question: "Can I sync study tasks to a planner?",
      answer: "Absolutely! The study planner organizes your tasks, and you can even leverage integrated endpoints to streamline incoming material lists and emails into structured study routines."
    }
  ];

  return (
    <div className="bg-[#fafbfe] dark:bg-[#0b0c10] min-h-[100dvh] text-slate-800 dark:text-slate-150 flex flex-col justify-between relative overflow-hidden transition-colors duration-300 font-sans">
      
      {/* Radiant Background Pastel & Neon Glows - Theme Aware */}
      {/* Light Mode Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] md:w-[50vw] md:h-[50vw] rounded-full bg-gradient-to-br from-indigo-300/25 via-fuchsia-200/15 to-transparent blur-[100px] md:blur-[140px] pointer-events-none dark:hidden" />
      <div className="absolute top-[20%] left-[-20%] w-[60vw] h-[60vw] md:w-[40vw] md:h-[40vw] rounded-full bg-gradient-to-tr from-sky-300/25 via-cyan-200/15 to-transparent blur-[100px] md:blur-[140px] pointer-events-none dark:hidden" />
      <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] md:w-[40vw] md:h-[40vw] rounded-full bg-gradient-to-tl from-orange-200/25 via-rose-200/15 to-transparent blur-[100px] md:blur-[140px] pointer-events-none dark:hidden" />

      {/* Dark Mode Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-600/10 to-transparent blur-[130px] pointer-events-none hidden dark:block" />
      <div className="absolute top-[30%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-cyan-500/10 via-blue-600/10 to-transparent blur-[130px] pointer-events-none hidden dark:block" />
      <div className="absolute bottom-[-10%] right-[5%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tl from-pink-500/10 via-rose-600/5 to-transparent blur-[130px] pointer-events-none hidden dark:block" />

      {/* Futuristic Delicate Semi-Transparent Grid Overlay - Theme Aware */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#fafbfe]/40 to-[#fafbfe] dark:via-[#0b0c10]/40 dark:to-[#0b0c10] opacity-90 pointer-events-none" />

      {/* Public Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 h-20 flex items-center justify-between border-b border-slate-200/60 dark:border-white/5 select-none z-10 relative bg-white/40 dark:bg-[#0b0c10]/40 backdrop-blur-md">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-500/10 dark:border-white/10 active:scale-95 transition-all">
            <Bot size={22} className="text-white animate-pulse" style={{ animationDuration: '3s' }} />
          </div>
          <div>
            <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight block leading-none font-sans">
              AI StudyMate
            </span>
          </div>
        </div>

        {/* Smooth Scroll Navigation Links */}
        <div className="hidden md:flex items-center space-x-6 lg:space-x-8 text-sm font-extrabold text-slate-600 dark:text-slate-300">
          <button 
            type="button"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-indigo-600 transition cursor-pointer"
          >
            How It Works
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-indigo-600 transition cursor-pointer"
          >
            Features
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-indigo-600 transition cursor-pointer"
          >
            About
          </button>
          <button 
            type="button"
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="hover:text-indigo-600 transition cursor-pointer"
          >
            FAQs
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <Link 
              to="/dashboard" 
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-full transition-all shadow-[0_4px_15px_rgba(79,70,229,0.15)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.3)] active:scale-[0.98] hover:scale-[1.02] border border-indigo-500/10 dark:border-white/10"
            >
              Enter Study Portal
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-slate-650 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-extrabold px-4 py-2 transition hover:underline">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-full transition-all shadow-[0_4px_15px_rgba(79,70,229,0.15)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.3)] active:scale-[0.98] hover:scale-[1.02] border border-indigo-500/10 dark:border-white/10"
              >
                Join Free
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Header Area */}
      <main className="flex-1 z-10 relative">
        <section className="max-w-5xl mx-auto px-6 pt-12 sm:pt-20 md:pt-24 pb-10 sm:pb-16 md:pb-20 text-center relative z-20">
          <div className="inline-flex items-center bg-white/80 dark:bg-white/5 border border-slate-200/90 dark:border-white/10 text-slate-800 dark:text-indigo-300 font-extrabold text-xs px-4 py-2 rounded-full tracking-wide mb-8 shadow-sm">
            <Sparkles size={14} className="mr-2 inline animate-pulse text-indigo-500 dark:text-indigo-400" />
            Try the new AI Study Assistant
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6 font-sans">
            Master your studies with <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-500 to-orange-500 dark:from-indigo-400 dark:via-purple-400 dark:via-pink-400 dark:to-amber-300">AI StudyMate</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-400 text-base sm:text-lg md:text-xl font-medium leading-relaxed mb-8 sm:mb-10">
            Upload your files, lectures, and notes. Our AI will automatically generate interactive flashcards, practice quizzes, and explain complex topics instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-500 dark:to-purple-600 hover:from-indigo-550 hover:to-purple-555 text-white font-extrabold text-base px-8 py-4 rounded-full transition-all shadow-[0_10px_30px_rgba(79,70,229,0.15)] dark:shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:shadow-[0_15px_35px_rgba(79,70,229,0.25)] dark:hover:shadow-[0_15px_35px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 group cursor-pointer border border-indigo-500/10 dark:border-white/10 active:scale-[0.98]"
            >
              <span>Start Learning Free</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-white/85 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/10 text-slate-800 dark:text-white font-extrabold text-base px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 active:scale-[0.98] text-center shadow-md dark:shadow-none"
            >
              Log In to Portal
            </Link>
          </div>

          <div className="mt-8 sm:mt-12 md:mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm text-slate-705 dark:text-slate-300 font-semibold max-w-2xl mx-auto">
            <span className="flex items-center bg-indigo-50/70 border border-indigo-100/50 px-4 py-2 rounded-2xl shadow-sm"><CheckCircle size={16} className="text-indigo-600 mr-2" /> Free Sign Up</span>
            <span className="flex items-center bg-purple-50/70 border border-purple-100/50 px-4 py-2 rounded-2xl shadow-sm"><CheckCircle size={16} className="text-purple-600 mr-2" /> File Uploads</span>
            <span className="flex items-center bg-pink-50/70 border border-pink-100/50 px-4 py-2 rounded-2xl shadow-sm"><CheckCircle size={16} className="text-pink-600 mr-2" /> Interactive AI</span>
          </div>
        </section>

        {/* Mobile-Only Quick Navigation Row (Borderless visual tabs) */}
        <div className="flex md:hidden items-center justify-center space-x-4 py-3.5 border-y border-slate-200/50 dark:border-white/5 bg-slate-50/40 dark:bg-white/[0.01] max-w-sm mx-auto my-6 px-4 rounded-xl z-20 relative font-sans">
          <button 
            type="button" 
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          >
            How It Works
          </button>
          <span className="text-slate-200 dark:text-white/10 select-none">•</span>
          <button 
            type="button" 
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          >
            Features
          </button>
          <span className="text-slate-200 dark:text-white/10 select-none">•</span>
          <button 
            type="button" 
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          >
            About
          </button>
          <span className="text-slate-200 dark:text-white/10 select-none">•</span>
          <button 
            type="button" 
            onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition cursor-pointer"
          >
            FAQs
          </button>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-12 sm:py-20 md:py-24 z-10 relative scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-16">
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full inline-block mb-4">
              Simple 3-Step Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4 font-sans">
              How AI StudyMate Works
            </h2>
            <p className="text-base text-slate-650 leading-relaxed font-semibold">
              Get from raw reading notes to active retention with absolute simplicity.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Visual connector line for desktop */}
            <div className="hidden md:block absolute top-[40%] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-indigo-100 via-purple-100 to-indigo-100 -z-10" />

            {/* Step 1 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition-all shadow-[0_4px_20px_rgba(148,163,184,0.03)] text-center relative group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-500/10">
                1
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-3 group-hover:text-indigo-600 transition-colors">Upload Materials</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Import any PDF, Word file, text document, or paste custom content inside your study locker.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition-all shadow-[0_4px_20px_rgba(148,163,184,0.03)] text-center relative group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-500/10">
                2
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-3 group-hover:text-indigo-600 transition-colors">AI Synthesis</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Our secure server proxies process the text and formulate customized summaries or questions.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-8 hover:border-indigo-200 transition-all shadow-[0_4px_20px_rgba(148,163,184,0.03)] text-center relative group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-extrabold text-lg flex items-center justify-center mx-auto mb-6 shadow-md shadow-indigo-500/10">
                3
              </div>
              <h3 className="text-lg font-extrabold text-slate-950 mb-3 group-hover:text-indigo-600 transition-colors">Active Recall</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Practice immediately using auto-generated quizzes, review custom flashcards, or discuss topics on the chat.
              </p>
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section id="features" className="bg-slate-50/60 dark:bg-[#12131a]/40 backdrop-blur-md py-10 sm:py-14 md:py-16 border-y border-slate-200/60 dark:border-white/5 shadow-[inset_0_10px_30px_rgba(0,0,0,0.01)] z-10 relative scroll-mt-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 font-sans">
                Turn hours of studying into minutes
              </h2>
              <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-semibold dark:font-normal">
                AI StudyMate uses advanced intelligence to create flashcards, summaries, and quizzes out of any material instantly. Step into the future of learning.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {featurePillars.map((feat, index) => (
                <div 
                  key={index}
                  className="group study-card p-5 sm:p-6 bg-white/95 dark:bg-[#161722]/80 border border-slate-200/80 dark:border-white/5 rounded-2xl flex flex-col justify-between hover:scale-[1.01] hover:-translate-y-0.5 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(99,102,241,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_10px_25px_rgba(99,102,241,0.08)]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/80 dark:to-purple-950/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100/20 dark:border-indigo-500/20 group-hover:from-indigo-100 group-hover:to-purple-100 dark:group-hover:from-indigo-900 dark:group-hover:to-purple-900 transition-all">
                        <feat.icon size={24} />
                      </div>
                      <span className="text-[9px] uppercase font-extrabold dark:font-bold tracking-widest text-indigo-600 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/10 border border-indigo-100/20 dark:border-indigo-500/20 px-2 py-0.5 rounded-full">{feat.badge}</span>
                    </div>
                    <h3 className="text-lg font-extrabold dark:font-bold text-slate-900 dark:text-white mb-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{feat.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold dark:font-normal">{feat.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="max-w-6xl mx-auto px-6 py-10 sm:py-14 md:py-16 z-10 relative scroll-mt-20">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">
            
            {/* Ambient backdrop bubbles */}
            <div className="absolute top-0 right-0 w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[70px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[150px] h-[150px] bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />

            <div className="max-w-xl relative z-10 text-left">
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-300 bg-white/10 px-3 py-1.5 rounded-full inline-block mb-3 border border-white/5">
                Our Story
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4 leading-tight text-white font-sans">
                A Personal Study Assistant Made for Active Recall
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold mb-4">
                AI StudyMate was designed to eliminate the exhausting hours spent passively reading textbooks, slides, and lecture notes. We believe in active comprehension—replacing slow review with auto-generated exams, flashcards, and instant clarifications to double your learning speed.
              </p>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold">
                Our mission is simple: to supply students, developers, and lifelong researchers with a secure, highly organized visual dashboard where complex topics are split into straightforward study routines.
              </p>
            </div>

            <div className="w-full md:w-auto shrink-0 relative z-10 flex flex-col gap-3 text-left max-w-sm">
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <h4 className="font-extrabold text-[#fafbfe] text-xs mb-0.5">Upload Any Files</h4>
                <p className="text-[11px] text-slate-405 dark:text-slate-400 font-semibold leading-relaxed">Import PDFs, DOCX, TXT files, or paste raw notes directly into the system.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <h4 className="font-extrabold text-[#fafbfe] text-xs mb-0.5">State-of-the-Art Core AI</h4>
                <p className="text-[11px] text-slate-405 dark:text-slate-400 font-semibold leading-relaxed">Powered by Google Gemini to analyze, translate, and explain heavy materials accurately.</p>
              </div>
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                <h4 className="font-extrabold text-[#fafbfe] text-xs mb-0.5">Ironclad Private Vault</h4>
                <p className="text-[11px] text-slate-405 dark:text-slate-400 font-semibold leading-relaxed">Store reading files inside your secure locker with custom security lock PIN option.</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Accordion Section */}
        <section id="faq" className="max-w-4xl mx-auto px-6 py-12 sm:py-20 md:py-24 z-10 relative scroll-mt-20">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 font-sans">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
              Have questions about how to get the most out of AI StudyMate? We've got you covered.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = !!openFaq[idx];
              return (
                <div 
                  key={idx}
                  className="bg-white/95 border border-slate-200/85 rounded-2xl overflow-hidden transition-all duration-300 hover:border-indigo-200 shadow-[0_4px_15px_rgba(148,163,184,0.02)]"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 font-extrabold text-slate-900 cursor-pointer select-none group"
                  >
                    <span className="text-base sm:text-lg group-hover:text-indigo-600 transition-colors">
                      {faq.question}
                    </span>
                    <span className="p-1.5 rounded-xl bg-slate-100/80 text-slate-550 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all flex-shrink-0">
                      {isOpen ? (
                        <ChevronUp size={18} className="stroke-[2.5]" />
                      ) : (
                        <ChevronDown size={18} className="stroke-[2.5]" />
                      )}
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out border-slate-100 overflow-hidden ${
                      isOpen ? 'max-h-[500px] opacity-100 py-5 px-6 border-t bg-[#fafbfe]' : 'max-h-0 opacity-0 pointer-events-none'
                    }`}
                  >
                    <p className="text-sm sm:text-base text-slate-650 leading-relaxed font-semibold dark:font-normal">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Pre-Footer Grid (Upper Footer Section) */}
      <section className="bg-white/60 dark:bg-[#0b0c10]/60 backdrop-blur-xl border-t border-slate-200/80 dark:border-white/5 py-16 app-viewport-container z-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            {/* Left Brand Summary */}
            <div className="max-w-md">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border-indigo-500/10 dark:border-white/10">
                  <Bot size={22} className="text-white animate-pulse" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">AI StudyMate</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-semibold dark:font-normal leading-relaxed">
                An adaptive, beautiful AI platform designed to clarify complex subjects, build diagnostic quizzes, and accelerate your learning through active memory recall.
              </p>
            </div>

            {/* Right Contact/Developer Signature */}
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 text-sm text-slate-700 dark:text-slate-300">
              <div className="space-y-2">
                <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Help Desk</span>
                <a href="mailto:support@studymate.ai" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">support@studymate.ai</a>
              </div>
              <div className="space-y-2">
                <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Location</span>
                <span className="font-bold text-slate-900 dark:text-white">Ahmedabad, India</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer copyright */}
      <footer className="bg-slate-50 dark:bg-[#08090d] border-t border-slate-200/80 dark:border-white/5 text-slate-500 py-8 text-sm z-20 relative font-sans">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-y-4 text-center sm:text-left">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-300">© 2026 AI StudyMate</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-semibold">
              Handcrafted in India by Patel Fenil
            </p>
            {/* Legal triggers */}
            <div className="mt-2.5 flex items-center justify-center sm:justify-start space-x-3 text-xs font-semibold">
              <button 
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="text-slate-500 hover:text-indigo-600 transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <span className="text-slate-300">•</span>
              <button 
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-slate-500 hover:text-indigo-600 transition cursor-pointer"
              >
                Terms of Service
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 px-4 py-2 rounded-full border border-slate-200 dark:border-white/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] dark:shadow-inner">
            <Sparkles size={14} className="text-indigo-500 dark:text-indigo-400 animate-pulse" />
            <span className="font-extrabold dark:font-bold text-slate-700 dark:text-slate-300 text-xs">Powered by Gemini AI</span>
          </div>
        </div>
      </footer>

      {/* Privacy Policy Modal overlay */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <ShieldCheck size={22} className="shrink-0" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Privacy Policy</h3>
                  <p className="text-xs text-slate-550 font-semibold">Last updated: June 2026</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrivacyModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-600 leading-relaxed font-sans text-sm sm:text-base text-left">
              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">1. Cohesive Privacy Framework</h4>
                <p className="font-medium">
                  At AI StudyMate, we are strictly committed to safeguarding the database privacy of our students and learners. We adhere to high standards of visual and procedural integrity, ensuring that any information uploaded inside your secure locker is fully guarded from unauthorized telemetry checks.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">2. Information We Securely Process</h4>
                <p className="font-medium">
                  To offer our diagnostic AI services, we store and optimize credentials registered inside our system:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1 font-semibold text-slate-700">
                  <li><strong>Registered Login Session Profiles:</strong> Simple, user-managed credentials.</li>
                  <li><strong>Study Materials & Files:</strong> PDF, TXT, or DOCX texts chosen for interactive active recalls.</li>
                  <li><strong>Progression Data:</strong> Logged streaks, quiz performance logs, and diagnostic scores.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">3. Zero Data Commercialization</h4>
                <p className="font-medium">
                  Your research notes and uploaded literature belong solely to you. Your locker files are passed with absolute security via server-to-server API proxies to formulate interactive quiz cards. We never sell, lease, or monetize your intellectual publications, period.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">4. User Autonomy & Deletion</h4>
                <p className="font-medium">
                  Any storage created remains under your full authoritativeness. If you choose to remove a document from your private locker, this acts as a permanent database deletion command across all persistent databases.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">5. Updates</h4>
                <p className="font-medium">
                  This policy may be revised occasionally to support newly integrated APIs. Contact us any time for details at support@studymate.ai.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPrivacyModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal overlay */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in text-slate-800">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-scale-up">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <Scale size={22} className="shrink-0" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900">Terms of Service</h3>
                  <p className="text-xs text-slate-550 font-semibold">Last updated: June 2026</p>
                </div>
              </div>
              <button 
                onClick={() => setShowTermsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-600 leading-relaxed font-sans text-sm sm:text-base text-left">
              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">1. Terms of Educational Access</h4>
                <p className="font-medium">
                  By joining AI StudyMate, you agree to access our platform solely as an interactive self-testing, explanation, and memory preservation companion. Our platform serves to augment and streamline active study workflows.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">2. User Account Security</h4>
                <p className="font-medium">
                  To secure your study data, you must establish registered account credentials. You are solely responsible for safeguarding any custom Security PINs configured to preserve double-locked document libraries inside your local browser or accounts.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">3. Acceptable Material Upload Scope</h4>
                <p className="font-medium">
                  Students retain full ownership over any material uploaded to AI StudyMate. You agree only to upload study guides, research documents, and text files for which you possess the rightful license or fair educational use allowance. Uploading malicious parameters, files exceeding sizes, or destructive payloads is strictly restricted.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">4. Auxiliary Service Nature</h4>
                <p className="font-medium">
                  Our smart flashcard decks and quiz generators are designed as assistive aids. While we build robust server engines powered by state-of-the-art Gemini LLMs, users must verify crucial mathematical or scientific equations directly before professional examinations.
                </p>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-950 mb-2">5. Jurisdiction & Inquiries</h4>
                <p className="font-medium">
                  These terms shall be governed under simple educational platform principles. If you have any inquiries, you can reach out directly via support@studymate.ai.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-slate-150 bg-slate-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition cursor-pointer shadow-md"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
