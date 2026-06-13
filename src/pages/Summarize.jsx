import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ChevronRight, ListCollapse, AlertCircle, Copy, Check, FileInput, Loader2, MessageSquare, BookOpen, Layers, Sparkles, CheckCircle2, Youtube } from 'lucide-react';
import FileUpload from '../components/FileUpload.jsx';
import { api } from '../services/api.js';

export default function Summarize() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upload');
  const [pastedText, setPastedText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeTitle, setYoutubeTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Active processed summary note
  const [activeNote, setActiveNote] = useState(null);
  const [pastNotes, setPastNotes] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchPastNotes();
  }, []);

  const fetchPastNotes = async () => {
    try {
      const notes = await api.getNotes();
      setPastNotes(notes);
    } catch (err) {
      console.error('Error fetching past notes:', err);
    }
  };

  const handleFileUpload = async (filePayload) => {
    setIsLoading(true);
    setError(null);
    setActiveNote(null);

    try {
      const data = await api.summarizeNotes(
        filePayload.filename,
        filePayload.fileType,
        filePayload.base64Content,
        filePayload.rawText
      );
      
      const fullNote = await api.getNoteById(data.noteId);
      setActiveNote(fullNote);
      fetchPastNotes();
    } catch (err) {
      setError(err.message || 'Summarization processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteSubmit = async (e) => {
    e.preventDefault();
    if (!pastedText.trim() || !pasteTitle.trim()) return;

    setIsLoading(true);
    setError(null);
    setActiveNote(null);

    try {
      const base64Content = btoa(unescape(encodeURIComponent(pastedText)));
      const data = await api.summarizeNotes(
        `${pasteTitle.trim()}.txt`,
        'text/plain',
        base64Content,
        pastedText
      );

      const fullNote = await api.getNoteById(data.noteId);
      setActiveNote(fullNote);
      fetchPastNotes();
    } catch (err) {
      setError(err.message || 'Failed to summarize pasted notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setIsLoading(true);
    setError(null);
    setActiveNote(null);

    try {
      const data = await api.summarizeYoutube(youtubeUrl.trim(), youtubeTitle.trim() || undefined);
      const fullNote = await api.getNoteById(data.noteId);
      setActiveNote(fullNote);
      setYoutubeUrl('');
      setYoutubeTitle('');
      fetchPastNotes();
    } catch (err) {
      setError(err.message || 'Failed to analyze and summarize YouTube video.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPastNote = async (noteId) => {
    setIsLoading(true);
    setError(null);
    try {
      const fullNote = await api.getNoteById(noteId);
      setActiveNote(fullNote);
    } catch (err) {
      setError('Could not retrieve chosen document from locker.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySummary = () => {
    if (!activeNote?.summary) return;
    const summaryText = `${activeNote.summary.shortSummary}\n\nDETAILED REVIEW:\n${activeNote.summary.detailedSummary}`;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const initiateQuizFromNote = () => {
    if (!activeNote) return;
    navigate('/quiz', { state: { noteId: activeNote.id, noteTitle: activeNote.filename } });
  };

  const initiateFlashcardsFromNote = () => {
    if (!activeNote) return;
    navigate('/flashcards', { state: { noteId: activeNote.id, noteTitle: activeNote.filename } });
  };

  const initiateChatFromNote = () => {
    if (!activeNote) return;
    navigate('/chat', { state: { noteId: activeNote.id, noteTitle: activeNote.filename } });
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Upload materials */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-900">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Study Materials Locker</h3>
                <p className="text-[10px] text-slate-450 leading-none font-sans">Upload or paste slide lecture notes</p>
              </div>
            </div>

             {/* Selector bar */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                disabled={isLoading}
                className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${activeTab === 'upload' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                disabled={isLoading}
                className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${activeTab === 'paste' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                Paste text
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                disabled={isLoading}
                className={`py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition cursor-pointer ${activeTab === 'youtube' ? 'bg-white text-indigo-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                YouTube Link
              </button>
            </div>

            {error && (
              <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3 rounded-xl">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: UPLOAD FILE */}
            {activeTab === 'upload' && (
              <div className="space-y-4">
                <FileUpload onFileLoaded={handleFileUpload} isLoading={isLoading} />
              </div>
            )}

            {/* TAB 2: COPY / PASTE */}
            {activeTab === 'paste' && (
              <form onSubmit={handlePasteSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Intro to Artificial Intelligence"
                    value={pasteTitle}
                    onChange={(e) => setPasteTitle(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Lecture Notes / Concepts</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste or type study concepts, terms, definitions, formulas, or slide printouts..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50 resize-y font-sans h-44"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !pastedText.trim() || !pasteTitle.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Processing Paste...</span>
                    </>
                  ) : (
                    <>
                      <span>Synthesize Notes</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* TAB 3: YOUTUBE VIDEO LINK */}
            {activeTab === 'youtube' && (
              <form onSubmit={handleYoutubeSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">YouTube Video URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Custom Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Intro to Modern Physics lecture"
                    value={youtubeTitle}
                    onChange={(e) => setYoutubeTitle(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50"
                  />
                  <p className="text-[10px] mt-1 text-slate-450 italic">If left blank, AI StudyMate will automatically look up/generate the video title.</p>
                </div>
                <button
                  type="submit"
                  disabled={isLoading || !youtubeUrl.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                      <span>Synthesizing Video...</span>
                    </>
                  ) : (
                    <>
                      <Youtube size={14} className="text-red-500 animate-pulse shrink-0 mr-1" />
                      <span>Summarize video</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Past Notes list */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center font-sans">
              <FileInput size={14} className="text-slate-400 mr-2 shrink-0" />
              <span>Study Locker ({pastNotes.length})</span>
            </h4>

            {pastNotes.length > 0 ? (
              <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1">
                {pastNotes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => loadPastNote(note.id)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${activeNote?.id === note.id ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' : 'bg-slate-50/50 border-slate-150 hover:bg-slate-50 hover:border-slate-300'}`}
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <span className="font-semibold text-slate-800 block truncate">{note.filename}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">Uploaded {new Date(note.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <ChevronRight size={14} className="text-slate-400 shrink-0" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-450 text-slate-400 italic text-center py-4">Locker is currently empty.</p>
            )}
          </div>
        </div>

        {/* Right Side: Active summaries presentation */}
        <div className="lg:col-span-2 space-y-6">
          {activeNote?.summary ? (
            <div className="space-y-6 animate-fade-in font-sans">
              
              {/* Floating note overview summary */}
              <div className="bg-white border border-indigo-150 rounded-2xl p-6 shadow-sm border-l-4 border-l-indigo-650 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-900 flex items-center justify-center border border-indigo-100">
                      <Sparkles size={16} />
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 leading-tight block">{activeNote.filename}</h4>
                      <p className="text-[10px] text-slate-400 leading-none mt-1">AI StudyMate smart synthesis overview</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center space-x-1.5 text-xs text-indigo-700 hover:text-indigo-850 hover:bg-slate-50 border border-indigo-250 hover:border-indigo-350 px-3 py-1.5 rounded-lg active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600 font-bold">Copied Summary</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Summary</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-700 bg-indigo-50/30 font-medium p-4 rounded-xl leading-relaxed font-sans">
                  {activeNote.summary.shortSummary}
                </p>
              </div>

              {/* Grid: Detailed summary & Key takeaway checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
                
                {/* Narrated detailed review */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col h-full justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                      <ListCollapse size={14} className="mr-2 text-indigo-950 shrink-0" />
                      <span>Detailed Review Synopsis</span>
                    </h4>
                    <p className="text-xs text-slate-650 leading-relaxed text-slate-600 font-sans whitespace-pre-wrap">
                      {activeNote.summary.detailedSummary}
                    </p>
                  </div>
                  {/* Locker tools trigger */}
                  <div className="pt-4 border-t border-slate-100 mt-4 flex flex-col space-y-2">
                    <button
                      onClick={initiateQuizFromNote}
                      className="flex items-center justify-between text-xs font-bold text-amber-800 bg-amber-50/50 hover:bg-amber-100/60 p-3 rounded-xl border border-amber-200 hover:border-amber-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      <span className="flex items-center font-extrabold"><BookOpen size={14} className="text-amber-600 mr-2 shrink-0" /> Test folder with Quiz</span>
                      <ChevronRight size={14} className="text-amber-500" />
                    </button>
                    <button
                      onClick={initiateFlashcardsFromNote}
                      className="flex items-center justify-between text-xs font-bold text-purple-800 bg-purple-50/50 hover:bg-purple-100/60 p-3 rounded-xl border border-purple-200 hover:border-purple-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      <span className="flex items-center font-extrabold"><Layers size={14} className="text-purple-600 mr-2 shrink-0" /> Study Spaced Flashcards</span>
                      <ChevronRight size={14} className="text-purple-500" />
                    </button>
                    <button
                      onClick={initiateChatFromNote}
                      className="flex items-center justify-between text-xs font-bold text-blue-800 bg-blue-50/50 hover:bg-blue-100/60 p-3 rounded-xl border border-blue-200 hover:border-blue-400 active:scale-[0.98] transition-all cursor-pointer shadow-sm hover:shadow"
                    >
                      <span className="flex items-center font-extrabold"><MessageSquare size={14} className="text-blue-600 mr-2 shrink-0" /> Chat with Slide Document</span>
                      <ChevronRight size={14} className="text-blue-500" />
                    </button>
                  </div>
                </div>

                {/* Key takeaway checkboxes */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3 h-full">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center">
                    <CheckCircle2 size={14} className="mr-2 text-emerald-500 shrink-0" />
                    <span>Important Takeaways</span>
                  </h4>
                  <ul className="space-y-3 pl-1">
                    {activeNote.summary.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start text-xs text-slate-600 leading-relaxed font-sans">
                        <CheckCircle2 size={14} className="text-emerald-500 mr-2.5 shrink-0 mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Glossary of factored facts */}
              {activeNote.summary.importantDefinitions && activeNote.summary.importantDefinitions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                    <BookOpen size={14} className="mr-2 text-indigo-950 shrink-0" />
                    <span>Glossary Fact Terms ({activeNote.summary.importantDefinitions.length})</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeNote.summary.importantDefinitions.map((item, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-150/60 p-4 rounded-xl space-y-1.5 transition hover:id-indigo-100 hover:border-indigo-200">
                        <span className="font-extrabold text-[#111827] text-xs leading-tight block">{item.term}</span>
                        <p className="text-[11px] text-slate-500 leading-normal">{item.definition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-6 text-center space-y-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Sparkles size={18} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Summarizing study materials...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating clear key summaries, logical bullet points, action checklists, and interactive definitions.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <FileText size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Note Selected From Locker</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Please upload a notes file (.pdf, .txt, .docx) or paste custom study text content in the locker panel to generate an AI study companion layout.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
