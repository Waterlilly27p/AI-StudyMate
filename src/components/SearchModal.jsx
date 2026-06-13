import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  FileText, 
  BookOpen, 
  Layers, 
  MessageSquare, 
  Lock, 
  HelpCircle, 
  LayoutDashboard, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  CornerDownLeft,
  FileDown
} from 'lucide-react';
import { api } from '../services/api.js';

export default function SearchModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notes, setNotes] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Monitor custom toggle event from navbar / page triggers
  useEffect(() => {
    const handleToggle = () => {
      setIsOpen(prev => !prev);
    };

    const handleOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('toggle-global-search', handleToggle);
    window.addEventListener('open-global-search', handleOpen);
    return () => {
      window.removeEventListener('toggle-global-search', handleToggle);
      window.removeEventListener('open-global-search', handleOpen);
    };
  }, []);

  // Monitor system-wide global key shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Fetch recent study notes when opened
  useEffect(() => {
    if (!isOpen) return;

    setSearchTerm('');
    setSelectedIndex(0);

    const fetchNotesIndex = async () => {
      try {
        setIsLoading(true);
        const data = await api.getNotes();
        setNotes(data || []);
      } catch (err) {
        console.error('Error fetching search indexing parameters:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotesIndex();

    // Auto focus the input after layout render
    // Timeout helps ensure focus goes to input once transitional modal loads
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // Unified modules definitions
  const modules = [
    {
      id: 'dash',
      title: 'Dashboard',
      description: 'Your learning overview panel and statistics',
      path: '/dashboard',
      icon: LayoutDashboard,
      keywords: ['home', 'dashboard', 'stats', 'main']
    },
    {
      id: 'expl',
      title: 'Simple Explainer',
      description: 'Explain complex topics or terms in layperson text',
      path: '/explain',
      icon: HelpCircle,
      keywords: ['explain', 'understand', 'concept', 'theory', 'ai']
    },
    {
      id: 'summ',
      title: 'Quick Summarizer',
      description: 'Upload files and get structured key-point summaries',
      path: '/summarize',
      icon: FileText,
      keywords: ['summarize', 'notes', 'upload', 'pdf', 'text', 'doc']
    },
    {
      id: 'quiz',
      title: 'Practice Quizzes',
      description: 'Interactive multiple choice and true/false assessment',
      path: '/quiz',
      icon: BookOpen,
      keywords: ['quiz', 'test', 'exam', 'question', 'assess']
    },
    {
      id: 'flash',
      title: 'Memory Cards',
      description: 'Cement core vocabulary and active recall decks',
      path: '/flashcards',
      icon: Layers,
      keywords: ['flashcards', 'cards', 'recall', 'cement', 'memory']
    },
    {
      id: 'chat',
      title: 'Chat with Files',
      description: 'Deep-dive query assistant referencing your notes',
      path: '/chat',
      icon: MessageSquare,
      keywords: ['chat', 'q&a', 'query', 'explain', 'pdf', 'converse']
    },
    {
      id: 'lock',
      title: 'Private Safe',
      description: 'Secure summaries encrypted with PIN combinations',
      path: '/locker',
      icon: Lock,
      keywords: ['locker', 'safe', 'secure', 'private', 'pin', 'encrypt']
    },
    {
      id: 'prof',
      title: 'My Progress Tracker',
      description: 'Chronological activity history logs and learning streak',
      path: '/profile',
      icon: TrendingUp,
      keywords: ['progress', 'profile', 'streak', 'score', 'history']
    }
  ];

  // Logic to build search results matching query
  const getFilteredItems = () => {
    if (!searchTerm.trim()) {
      // 1. Show modules
      const moduleItems = modules.map(m => ({
        type: 'module',
        id: `m-${m.id}`,
        title: m.title,
        description: m.description,
        icon: m.icon,
        onClick: () => {
          navigate(m.path);
          setIsOpen(false);
        }
      }));

      // 2. Show up to 4 recent notes
      const notesSorted = [...notes]
        .sort((a,b) => new Date(b.uploadDate || 0) - new Date(a.uploadDate || 0))
        .slice(0, 4);

      const recentNotesItems = notesSorted.map(n => ({
        type: 'note',
        id: `note-${n.id}`,
        title: n.filename || 'Untitled Document',
        description: `Study Note (${n.fileType?.toUpperCase() || 'TXT'})`,
        icon: FileText,
        onClick: () => {
          // Open in Safe by default or layout
          navigate('/locker', { state: { selectedNoteId: n.id } });
          setIsOpen(false);
        },
        actions: [
          {
            label: 'Chat',
            icon: MessageSquare,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/chat', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          },
          {
            label: 'Quiz',
            icon: BookOpen,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/quiz', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          },
          {
            label: 'Flashcards',
            icon: Layers,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/flashcards', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          }
        ]
      }));

      return [...moduleItems, ...recentNotesItems];
    }

    const query = searchTerm.toLowerCase();
    const results = [];

    // Filter modules matching keyword or title
    const filteredModules = modules.filter(m => 
      m.title.toLowerCase().includes(query) || 
      m.description.toLowerCase().includes(query) ||
      m.keywords.some(k => k.includes(query))
    );

    filteredModules.forEach(m => {
      results.push({
        type: 'module',
        id: `m-${m.id}`,
        title: m.title,
        description: m.description,
        icon: m.icon,
        onClick: () => {
          navigate(m.path);
          setIsOpen(false);
        }
      });
    });

    // Filter notes matching filename, fileType or summary fields
    const filteredNotes = notes.filter(n => {
      const nameMatch = n.filename?.toLowerCase().includes(query);
      const typeMatch = n.fileType?.toLowerCase().includes(query);
      const shortDescMatch = n.summary?.shortSummary?.toLowerCase().includes(query);
      const detailedMatch = n.summary?.detailedSummary?.toLowerCase().includes(query);
      const keyPointsMatch = n.summary?.keyPoints?.some(p => p.toLowerCase().includes(query));
      
      return nameMatch || typeMatch || shortDescMatch || detailedMatch || keyPointsMatch;
    });

    filteredNotes.forEach(n => {
      // Add direct safe view
      results.push({
        type: 'note',
        id: `note-${n.id}-safe`,
        title: n.filename || 'Untitled Document',
        description: `Open in Private Safe Vault (${n.fileType?.toUpperCase() || 'TXT'})`,
        icon: FileText,
        onClick: () => {
          navigate('/locker', { state: { selectedNoteId: n.id } });
          setIsOpen(false);
        },
        actions: [
          {
            label: 'Chat',
            icon: MessageSquare,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/chat', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          },
          {
            label: 'Quiz',
            icon: BookOpen,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/quiz', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          },
          {
            label: 'Cards',
            icon: Layers,
            onClick: (e) => {
              e.stopPropagation();
              navigate('/flashcards', { state: { noteId: n.id } });
              setIsOpen(false);
            }
          }
        ]
      });
    });

    return results;
  };

  const filteredItems = getFilteredItems();

  // Reset selectedIndex if it goes out of bounds
  useEffect(() => {
    if (selectedIndex >= filteredItems.length) {
      setSelectedIndex(0);
    }
  }, [searchTerm, filteredItems.length, selectedIndex]);

  // Handle keyboard interaction within list results
  const handleListKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onClick();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="search-portal-wrapper"
      className="fixed inset-0 z-50 flex items-start justify-center backdrop-blur-xs bg-slate-900/40 p-4 pt-[12vh] overflow-y-auto animate-fade-in select-none"
      onClick={() => setIsOpen(false)}
    >
      <div 
        id="search-box-container"
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[70vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleListKeyDown}
      >
        {/* Search header box */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
          <Search size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            id="global-search-input"
            ref={inputRef}
            type="text"
            placeholder="Type a file topic, note summary keyword, or page mode..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 text-sm text-slate-800 dark:text-slate-100 font-medium placeholder-slate-400"
          />
          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-850 border border-slate-250 dark:border-slate-800 rounded-md">
              ESC
            </span>
            <button 
              id="search-close-button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Results layout container */}
        <div id="search-results-list" className="flex-1 overflow-y-auto p-2 space-y-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 font-semibold text-xs flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Searching study vaults...</span>
            </div>
          ) : filteredItems.length > 0 ? (
            <div>
              {/* Category headers helper labels inside popup */}
              <div className="px-3 py-1.5 text-[9px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">
                {searchTerm ? 'Matching Search Items' : 'Quick Navigation Modules & Recent Files'}
              </div>

              {filteredItems.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const IconComponent = item.icon || FileText;

                return (
                  <div
                    id={`search-item-${item.id}`}
                    key={item.id}
                    onClick={() => item.onClick()}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer select-none border transition-all duration-100 ${
                      isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/60 translate-x-1' 
                        : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition ${
                        isSelected 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450'
                      }`}>
                        <IconComponent size={15} />
                      </div>
                      <div className="min-w-0">
                        <span className={`block text-xs font-black truncate leading-tight ${
                          isSelected ? 'text-indigo-950 dark:text-indigo-300' : 'text-slate-800 dark:text-slate-200'
                        }`}>
                          {item.title}
                        </span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium leading-none">
                          {item.description}
                        </span>
                      </div>
                    </div>

                    {/* Additional action pills inside matches for high-density document studies */}
                    {item.actions && item.actions.length > 0 ? (
                      <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                        {item.actions.map((act) => (
                          <button
                            key={act.label}
                            onClick={(e) => act.onClick(e)}
                            className="px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-350 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white hover:border-indigo-600 dark:hover:border-indigo-600 rounded-lg text-[9px] font-bold tracking-tight transition cursor-pointer flex items-center gap-1"
                          >
                            <act.icon size={10} />
                            <span>{act.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className={`shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform ${
                        isSelected ? 'translate-x-0.5 opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <CornerDownLeft size={13} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              <Sparkles size={20} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-extrabold text-slate-600 dark:text-slate-400">No matches found</p>
              <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                Try searching for other filenames, file formats or generic learning mode keywords.
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper panel */}
        <div id="search-input-footer" className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 shrink-0 text-[10px] text-slate-400 dark:text-slate-500 font-semibold">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="font-bold border border-slate-200 dark:border-slate-700 px-1 py-0.2 ml-0.5 rounded bg-white dark:bg-slate-900 scale-95 text-[9px]">↑↓</span> Arrow Key Selection
            </span>
            <span className="flex items-center gap-1">
              <span className="font-bold border border-slate-200 dark:border-slate-700 px-1 py-0.2 ml-0.5 rounded bg-white dark:bg-slate-900 scale-95 text-[9px]">Enter</span> Open
            </span>
          </div>
          <div>
            Press <span className="font-bold">Cmd + K</span> (or Ctrl + K) anytime to search
          </div>
        </div>
      </div>
    </div>
  );
}
