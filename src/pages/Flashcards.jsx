import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Layers, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight, 
  HelpCircle, 
  Play, 
  ThumbsUp, 
  Award,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Flashcards() {
  const location = useLocation();
  const stateNoteId = location.state?.noteId;
  const stateNoteTitle = location.state?.noteTitle;

  // Configurations
  const [topic, setTopic] = useState('');
  const [noteId, setNoteId] = useState(stateNoteId || '');
  const [cardCount, setCardCount] = useState(8);
  const [notesList, setNotesList] = useState([]);

  // Engine States
  const [activeSet, setActiveSet] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Playing States
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Tracking feedback reviews states
  const [knownCards, setKnownCards] = useState({});
  const [reviewedDecks, setReviewedDecks] = useState([]);

  useEffect(() => {
    async function loadNotes() {
      try {
        const notes = await api.getNotes();
        setNotesList(notes);
        
        const sets = await api.getFlashcardSets();
        setReviewedDecks(sets);
      } catch (err) {
        console.error('Error fetching list references:', err);
      }
    }
    loadNotes();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !noteId) {
      setError('Please choose either a note document or enter a study topic to formulate flashcards.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveSet(null);
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownCards({});

    try {
      const cardData = await api.generateFlashcards(topic, noteId, cardCount);
      setActiveSet(cardData);
      
      const sets = await api.getFlashcardSets();
      setReviewedDecks(sets);
    } catch (err) {
      setError(err.message || 'Error occurred creating your study memory cards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleNext = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % activeSet.cards.length);
    }, 150);
  };

  const handlePrev = () => {
    if (!activeSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev - 1 + activeSet.cards.length) % activeSet.cards.length);
    }, 150);
  };

  const markKnown = (isKnown) => {
    setKnownCards(prev => ({
      ...prev,
      [currentIdx]: isKnown
    }));
    handleNext();
  };

  const loadPastSet = (set) => {
    setActiveSet(set);
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownCards({});
  };

  const activeCard = activeSet ? activeSet.cards[currentIdx] : null;
  const knownCount = Object.values(knownCards).filter(Boolean).length;
  const totalCount = activeSet ? activeSet.cards.length : 0;
  const progressPercent = totalCount > 0 ? Math.round((Object.keys(knownCards).length / totalCount) * 100) : 0;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side Config Column */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-900">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Flashcard Planner</h3>
                <p className="text-[10px] text-slate-400 leading-none">Formulate recall deck summaries</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3 rounded-xl">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Note uploads locker picker */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Locker Document Source</label>
                <select
                  value={noteId}
                  onChange={(e) => {
                    setNoteId(e.target.value);
                    if (e.target.value) setTopic(''); // Clear Backup topic input
                  }}
                  disabled={isLoading}
                  className="w-full text-xs px-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="">-- Generic Subject Topic Instead --</option>
                  {notesList.map((n) => (
                    <option key={n.id} value={n.id}>{n.filename}</option>
                  ))}
                </select>
              </div>

              {/* Topic backup */}
              {!noteId && (
                <div className="animate-fade-in text-xs">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Subject Topic Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Organic Chemistry, Sorting Algorithms"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 focus:bg-white"
                  />
                </div>
              )}

              {/* Card deck volume counts */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Card Deck Volume</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[5, 8, 12, 16].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setCardCount(count)}
                      disabled={isLoading}
                      className={`py-2 rounded-xl text-xs font-bold border transition duration-150 text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${cardCount === count ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15' : 'bg-white text-slate-600 border-slate-250 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!topic.trim() && !noteId)}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Formulating smart deck...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current" />
                    <span>Generate Flashcard Deck</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Past Generated Flashcard sets lists */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center font-sans">
              <Layers size={14} className="text-purple-500 mr-2 shrink-0" />
              <span>Library Decks ({reviewedDecks.length})</span>
            </h4>

            {reviewedDecks.length > 0 ? (
              <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
                {reviewedDecks.map((set) => (
                  <button
                    key={set.id}
                    onClick={() => loadPastSet(set)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${activeSet?.id === set.id ? 'bg-purple-50/50 border-purple-200 text-purple-950 font-bold' : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50'}`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="font-semibold text-slate-800 block truncate">{set.title}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{set.cards.length} Interactive Cards</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 italic text-slate-400 text-center py-4">No deconstructed flashcards library sets present.</p>
            )}
          </div>
        </div>

        {/* Right Pane: Flashcard Active Studio Stage */}
        <div className="lg:col-span-2 space-y-6">
          {activeSet && activeCard ? (
            <div className="space-y-6 font-sans">
              
              {/* Stats overview metrics */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-6">
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 leading-none">Deck status</span>
                    <span className="text-xs font-bold text-slate-800 block mt-1">{currentIdx + 1} of {totalCount} card reviews</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-bold text-slate-400 leading-none">Card mastered rate</span>
                    <span className="text-xs font-bold text-emerald-600 block mt-1">{knownCount} mastered</span>
                  </div>
                </div>

                <div className="w-1/3 space-y-1.5 self-center">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <span>Mastery Progress</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-650 rounded-full transition-all duration-300 animate-pulse"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* flip card mechanism style */}
              <div 
                className="w-full h-80 relative cursor-pointer group rounded-2xl select-none" 
                onClick={handleFlip}
              >
                {!isFlipped ? (
                  /* Front Side */
                  <div className="absolute inset-0 w-full h-full bg-white border border-slate-200 rounded-2xl p-8 flex flex-col justify-between shadow-md hover:shadow-lg hover:border-slate-350 transition-all duration-200 animate-fade-in font-sans">
                    <div className="flex items-center justify-between text-indigo-900">
                      <span className="text-[10px] font-bold text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">FRONT QUESTION</span>
                      <HelpCircle size={16} />
                    </div>
                    <div className="text-center font-bold text-sm sm:text-base text-slate-800 leading-relaxed px-4">
                      {activeCard.front}
                    </div>
                    <div className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest select-none">
                      Tap card to reveal explanation answer
                    </div>
                  </div>
                ) : (
                  /* Back Side */
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-indigo-50/20 via-white to-purple-50/20 border-2 border-indigo-900 rounded-2xl p-8 flex flex-col justify-between shadow-md animate-fade-in font-sans">
                    <div className="flex items-center justify-between text-purple-900 flex-row">
                      <span className="text-[10px] font-bold text-purple-950 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md uppercase tracking-wider">RECALL BACK ANSWER</span>
                      <Award size={16} />
                    </div>
                    <div className="text-center text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[145px] overflow-y-auto px-4 font-semibold select-text">
                      {activeCard.back}
                    </div>
                    <div className="text-center text-[10px] text-indigo-950 font-bold uppercase tracking-widest select-none">
                      Tap card to toggle back to question
                    </div>
                  </div>
                )}
              </div>

              {/* Controls bar layout */}
              <div className="flex items-center justify-between font-sans">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                    className="w-11 h-11 rounded-xl bg-white border-2 border-slate-250 hover:border-indigo-400 text-slate-700 flex items-center justify-center transition hover:scale-[1.05] active:scale-[0.95] cursor-pointer shadow-sm"
                    aria-label="Previous card"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNext(); }}
                    className="w-11 h-11 rounded-xl bg-white border-2 border-slate-250 hover:border-indigo-400 text-slate-700 flex items-center justify-center transition hover:scale-[1.05] active:scale-[0.95] cursor-pointer shadow-sm"
                    aria-label="Next card"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); markKnown(false); }}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-5 rounded-xl text-xs cursor-pointer transition shadow hover:scale-[1.01] active:scale-[0.98]"
                  >
                    <ThumbsUp size={12} className="rotate-180" />
                    <span>Need Review</span>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); markKnown(true); }}
                    className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-5 rounded-xl text-xs cursor-pointer transition shadow-md hover:shadow-emerald-600/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <CheckCircle2 size={12} />
                    <span>Got It! Mastered</span>
                  </button>
                </div>
              </div>

            </div>
          ) : isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Sparkles size={16} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Formulating memorization cards...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">Reading through core summaries, compiling short vocab keys, fact indices, and mnemonic maps.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <Layers size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Flashcard Deck Active</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Select a summarized lecture note from your locker or enter a specialized subject prompt on the left settings planner to launch an active study session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
