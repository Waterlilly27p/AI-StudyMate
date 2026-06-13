import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Unlock, 
  Trash2, 
  Search, 
  Filter, 
  FileText, 
  ArrowRight, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  MessageSquare,
  Shield, 
  ShieldAlert,
  Loader2, 
  CheckCircle, 
  Calendar,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api.js';

export default function Locker() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [lockFilter, setLockFilter] = useState('all');
  
  // Modal & PIN entry states
  const [selectedNote, setSelectedNote] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinAction, setPinAction] = useState('lock'); // 'lock' or 'unlock'
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  
  // Expanded summary accordion state
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  
  // Custom temporary unlock storage in state (keeps file unlocked during this session)
  const [sessionUnlockedNoteIds, setSessionUnlockedNoteIds] = useState(new Set());

  // Message notifications
  const [notification, setNotification] = useState(null);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const data = await api.getNotes();
      setNotes(data || []);
    } catch (err) {
      console.error('Error fetching locker notes:', err);
      showNotification('Error', 'Failed to retrieve notes index', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const showNotification = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleToggleLockClick = (note, action) => {
    setSelectedNote(note);
    setPinAction(action);
    setPinInput('');
    setPinError('');
    setShowPinModal(true);
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    if (pinInput.length < 4) {
      setPinError('Security PIN must are at least 4 digits');
      return;
    }

    try {
      const isLocking = pinAction === 'lock';
      const response = await api.toggleNoteLock(selectedNote.id, pinInput, isLocking);
      
      if (response.success) {
        if (isLocking) {
          showNotification('Document Secured', `"${selectedNote.filename}" is now fully encrypted with your PIN.`, 'success');
          // Remove from session unlocked set if it was there
          const newUnlocked = new Set(sessionUnlockedNoteIds);
          newUnlocked.delete(selectedNote.id);
          setSessionUnlockedNoteIds(newUnlocked);
        } else {
          showNotification('Access Granted', `"${selectedNote.filename}" has been unlocked.`, 'success');
          const newUnlocked = new Set(sessionUnlockedNoteIds);
          newUnlocked.add(selectedNote.id);
          setSessionUnlockedNoteIds(newUnlocked);
        }
        
        setShowPinModal(false);
        setSelectedNote(null);
        await fetchNotes();
      }
    } catch (err) {
      console.error('PIN transaction error:', err);
      setPinError(err.message || 'Incorrect PIN code or security transaction failed.');
    }
  };

  const handleDeleteClick = async (note) => {
    if (note.isLocked && !sessionUnlockedNoteIds.has(note.id)) {
      handleToggleLockClick(note, 'unlock');
      return;
    }

    if (window.confirm(`Are you absolutely sure you want to delete "${note.filename}"? This action cannot be undone.`)) {
      try {
        await api.deleteNote(note.id);
        showNotification('Deleted', 'Document deleted successfully from secure locker', 'success');
        await fetchNotes();
      } catch (err) {
        showNotification('Error', err.message || 'Failed to delete note', 'error');
      }
    }
  };

  const handleStudyAction = (note, route) => {
    // If securely locked, require unlocking first
    if (note.isLocked && !sessionUnlockedNoteIds.has(note.id)) {
      handleToggleLockClick(note, 'unlock');
      return;
    }
    // Navigate with document state or URL search parameter
    navigate(route, { state: { selectedNoteId: note.id } });
  };

  const toggleAccordion = async (note) => {
    if (note.isLocked && !sessionUnlockedNoteIds.has(note.id)) {
      handleToggleLockClick(note, 'unlock');
      return;
    }
    if (expandedNoteId === note.id) {
      setExpandedNoteId(null);
    } else {
      setExpandedNoteId(note.id);
    }
  };

  // Filters logic
  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.filename.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || 
                        (typeFilter === 'pdf' && n.fileType?.includes('pdf')) ||
                        (typeFilter === 'youtube' && n.fileType === 'youtube') ||
                        (typeFilter === 'text' && !n.fileType?.includes('pdf') && n.fileType !== 'youtube');
    
    const matchesLock = lockFilter === 'all' ||
                        (lockFilter === 'locked' && n.isLocked) ||
                        (lockFilter === 'unlocked' && !n.isLocked);
                        
    return matchesSearch && matchesType && matchesLock;
  });

  const totalFiles = notes.length;
  const lockedFiles = notes.filter(n => n.isLocked).length;
  const securedPercent = totalFiles > 0 ? Math.round((lockedFiles / totalFiles) * 100) : 0;

  return (
    <div className="flex-grow flex flex-col overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 space-y-6 select-none relative h-full">
      
      {/* Dynamic Alerts */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-start gap-3 border max-w-sm sm:max-w-md ${
              notification.type === 'error' 
                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                : 'bg-indigo-50 text-indigo-800 border-indigo-200'
            }`}
          >
            <div className={`p-1.5 rounded-lg ${notification.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'}`}>
              <Info size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-extrabold text-xs tracking-wider uppercase leading-none mb-1">{notification.title}</h4>
              <p className="text-xs font-medium leading-normal">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Locker Metric Overview Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Documents Stats Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition min-w-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-100 shrink-0">
            <Shield size={22} className="text-indigo-650" />
          </div>
          <div className="min-w-0">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Safe Vault</span>
            <span className="text-xl font-black text-slate-800 leading-none block truncate">{totalFiles} {totalFiles === 1 ? 'Document' : 'Documents'}</span>
          </div>
        </div>

        {/* Security Lock count Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition min-w-0">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shrink-0">
            <Lock size={22} className="text-amber-600" />
          </div>
          <div className="min-w-0">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Secured Files</span>
            <span className="text-xl font-black text-slate-800 leading-none block truncate">{lockedFiles} Encrypted</span>
          </div>
        </div>

        {/* Storage Health Indicator Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition sm:col-span-2 lg:col-span-1 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shrink-0">
            <CheckCircle size={22} className="text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="block text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-none mb-1.5">Vault Safety Index</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-800 leading-none block">{securedPercent}%</span>
              <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[120px]">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${securedPercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel: Filters & Search bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-4.5 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar Input */}
        <div className="relative flex-1 min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search files inside study safe..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150 text-slate-700"
          />
        </div>

        {/* Dropdown Filters group */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.8 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-600">
            <Filter size={13} className="text-indigo-500" />
            <span className="hidden xs:inline">Type:</span>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 py-1"
            >
              <option value="all">All Materials</option>
              <option value="pdf">PDF Documents</option>
              <option value="text">Pasted Texts</option>
              <option value="youtube">Web Videos</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.8 rounded-xl text-[11px] sm:text-xs font-semibold text-slate-600">
            <Lock size={13} className="text-amber-500" />
            <span className="hidden xs:inline">Lock Status:</span>
            <select 
              value={lockFilter} 
              onChange={(e) => setLockFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer pr-1 py-1"
            >
              <option value="all">Show All</option>
              <option value="locked">Only Locked</option>
              <option value="unlocked">Only Unlocked</option>
            </select>
          </div>

          <button 
            onClick={fetchNotes}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 transition duration-150 shrink-0"
            title="Refresh Safe"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Main Locker Content Grid */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-20 bg-white border border-slate-200 rounded-3xl shadow-sm">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
            <span className="text-xs text-slate-400 font-bold tracking-wider uppercase font-sans">Decrypting safe archives...</span>
          </div>
        </div>
      ) : filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
          {filteredNotes.map((note) => {
            const isLocked = note.isLocked;
            const isSessionUnlocked = sessionUnlockedNoteIds.has(note.id);
            const isFullyBlocked = isLocked && !isSessionUnlocked;
            const uploadFormatted = new Date(note.uploadDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            });

            return (
              <motion.div 
                key={note.id}
                layoutId={`note-card-${note.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-sm overflow-hidden flex flex-col justify-between group ${
                  isFullyBlocked 
                    ? 'border-amber-100 hover:border-amber-200/80 bg-amber-50/5' 
                    : 'border-slate-200 hover:border-indigo-200/60'
                }`}
              >
                {/* Card Title & Meta Headers */}
                <div className="p-5.5 space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        isFullyBlocked 
                          ? 'bg-amber-50 text-amber-600 border-amber-150' 
                          : 'bg-slate-50 text-slate-600 border-slate-150'
                      }`}>
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-[#111827] text-sm tracking-tight leading-snug truncate pr-2" title={note.filename}>
                          {note.filename}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 leading-none uppercase">
                            <Calendar size={11} /> {uploadFormatted}
                          </span>
                          <span className="text-slate-350 select-none text-[10px]">&#8226;</span>
                          <span className="text-[10px] font-black uppercase text-indigo-500 leading-none">
                            {note.fileType || 'Text'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Locker toggle clicker */}
                    <button
                      onClick={() => handleToggleLockClick(note, isLocked ? 'unlock' : 'lock')}
                      className={`p-2 rounded-xl transition-colors shrink-0 ${
                        isLocked 
                          ? 'bg-amber-100 hover:bg-amber-200/85 text-amber-700' 
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-500'
                      }`}
                      title={isLocked ? 'Document Secured. Click to toggle unlock.' : 'Unsecured note. Click to lock with PIN.'}
                    >
                      {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                    </button>
                  </div>

                  {/* Locked Blur Placeholder */}
                  {isFullyBlocked ? (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex flex-col items-center text-center space-y-2 select-none">
                      <ShieldAlert size={28} className="text-amber-500 animate-pulse" />
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-amber-900 uppercase tracking-wide">SECURED LOCK COMPACTED</h5>
                        <p className="text-[10px] text-amber-700 font-semibold leading-relaxed max-w-xs">
                          To view notes summaries, construct quiz reviews, or start Q&A sessions, please click the lock symbol to verify PIN authorization credentials.
                        </p>
                      </div>
                      <button 
                        onClick={() => handleToggleLockClick(note, 'unlock')}
                        className="py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] font-extrabold shadow transition active:scale-95 cursor-pointer uppercase tracking-wider"
                      >
                        Enter Decryption PIN
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* Summary previews excerpt */}
                      <p className="text-xs text-slate-550 text-slate-500 leading-relaxed font-medium line-clamp-3 bg-slate-50/50 border border-slate-150/40 p-3 rounded-xl">
                        {note.summary?.shortSummary || note.content?.substring(0, 200) || 'No summary parameters available.'}
                      </p>

                      {/* Summary Interactive accordion trigger */}
                      {note.summary && (
                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                          <button
                            onClick={() => toggleAccordion(note)}
                            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100/70 border-b border-slate-100 transition text-left min-w-0"
                          >
                            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 min-w-0">
                              {expandedNoteId === note.id ? <EyeOff size={11} className="shrink-0" /> : <Eye size={11} className="shrink-0" />}
                              <span className="truncate">{expandedNoteId === note.id ? 'Hide Summary' : 'View Summary'}</span>
                            </span>
                            <span className="text-[9px] bg-indigo-50 border border-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-black tracking-wide leading-none shrink-0">
                              AI Summarized
                            </span>
                          </button>
                          
                          <AnimatePresence>
                            {expandedNoteId === note.id && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="transition-all overflow-hidden bg-white px-3.5 py-3 text-xs space-y-3 border-t border-slate-100"
                              >
                                <div>
                                  <h6 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-sans">Executive Digest</h6>
                                  <p className="text-slate-650 leading-relaxed font-medium">{note.summary.detailedSummary}</p>
                                </div>
                                {note.summary.keyPoints && note.summary.keyPoints.length > 0 && (
                                  <div>
                                    <h6 className="font-extrabold text-[10px] text-slate-400 uppercase tracking-widest mb-1.5 font-sans">Crucial Keypoints</h6>
                                    <ul className="space-y-1 pl-3.5 list-disc text-slate-650 font-medium">
                                      {note.summary.keyPoints.map((pt, index) => (
                                        <li key={index} className="leading-relaxed">{pt}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer Row */}
                <div className={`px-5.5 py-3.5 bg-slate-50/50 border-t ${
                  isFullyBlocked ? 'border-amber-100/50 bg-amber-500/[0.01]' : 'border-slate-150/60'
                } flex items-center justify-between gap-4`}>
                  {/* Quick-play study shortcuts */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleStudyAction(note, '/chat')}
                      disabled={isFullyBlocked}
                      className="p-2 bg-white border border-slate-200 hover:border-indigo-400 text-slate-500 hover:text-indigo-650 rounded-xl transition disabled:opacity-50 cursor-pointer"
                      title="Q&A Chat Notebook"
                    >
                      <MessageSquare size={13} />
                    </button>
                    <button
                      onClick={() => handleStudyAction(note, '/quiz')}
                      disabled={isFullyBlocked}
                      className="p-2 bg-white border border-slate-200 hover:border-orange-400 text-slate-500 hover:text-orange-650 rounded-xl transition disabled:opacity-50 cursor-pointer"
                      title="Practice Quiz Assessment"
                    >
                      <BookOpen size={13} />
                    </button>
                    <button
                      onClick={() => handleStudyAction(note, '/flashcards')}
                      disabled={isFullyBlocked}
                      className="p-2 bg-white border border-slate-200 hover:border-purple-400 text-slate-500 hover:text-purple-650 rounded-xl transition disabled:opacity-50 cursor-pointer"
                      title="Recall Flashcards Deck"
                    >
                      <Layers size={13} />
                    </button>
                  </div>

                  {/* Right side navigation buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeleteClick(note)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0 cursor-pointer"
                      title="Delete document permanently"
                    >
                      <Trash2 size={13} />
                    </button>
                    
                    <button
                      onClick={() => handleStudyAction(note, '/chat')}
                      disabled={isFullyBlocked}
                      className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-55 disabled:hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition shadow active:scale-95 cursor-pointer"
                    >
                      <span>Study Now</span>
                      <ArrowRight size={11} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white border border-slate-200 rounded-3xl shadow-sm text-center">
          <div className="w-14 h-14 bg-slate-50 text-slate-400 border rounded-2xl flex items-center justify-center mb-4">
            <Lock size={24} className="stroke-1 text-slate-400" />
          </div>
          <h4 className="text-sm font-extrabold text-slate-800 tracking-tight">No locker items located</h4>
          <p className="text-xs text-slate-400 mt-1.5 max-w-sm leading-relaxed">
            Please search for other filenames or reset filter choices above. Upload documents or slides inside Quick Summarizer to save them here.
          </p>
          <button 
            onClick={() => navigate('/summarize')}
            className="mt-5 py-2 px-4 bg-indigo-650 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer shadow"
          >
            Go Upload Documents
          </button>
        </div>
      )}

      {/* Security PIN code input modal */}
      <AnimatePresence>
        {showPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPinModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden relative z-10"
            >
              {/* Box header indicator */}
              <div className="p-6 pb-4 border-b border-slate-100 flex items-center gap-3.5 bg-slate-50/50">
                <div className={`p-2.5 rounded-xl ${pinAction === 'lock' ? 'bg-amber-55 bg-amber-50 text-amber-500' : 'bg-indigo-50 text-indigo-650'}`}>
                  <Shield size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest leading-none mb-1">
                    Safe Security Gate
                  </h4>
                  <p className="text-xs font-extrabold text-[#111827]">
                    {pinAction === 'lock' ? 'Secure with custom PIN' : 'Verify credentials'}
                  </p>
                </div>
              </div>

              {/* Form submit container */}
              <form onSubmit={handlePinSubmit} className="p-6 space-y-4">
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  {pinAction === 'lock' 
                    ? 'Enter a secure 4-digit PIN code to seal this note. Sealing this document will lock its summary data, exam practice triggers, and chat session indexing.' 
                    : 'Please input your 4-digit PIN code matching this document schema to verify authorization and unlock this study session.'}
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">
                    Safe Passcode PIN
                  </label>
                  <input
                    type="password"
                    maxLength={10}
                    placeholder="Enter 4+ digit PIN"
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value.replace(/\D/g, ''));
                      setPinError('');
                    }}
                    autoFocus
                    className="w-full text-center tracking-widest text-[#111827] text-lg font-black bg-slate-50 border border-slate-200 rounded-xl py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
                  />
                  {pinError && (
                    <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1">
                      <AlertTriangle size={11} />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 text-xs font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-1.5 px-3 rounded-xl text-white text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                      pinAction === 'lock' 
                        ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/10' 
                        : 'bg-indigo-650 hover:bg-indigo-700 shadow-indigo-600/15'
                    }`}
                  >
                    {pinAction === 'lock' ? 'Lock File' : 'Decrypt File'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
