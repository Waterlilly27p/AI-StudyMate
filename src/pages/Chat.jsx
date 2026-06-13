import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  MessageSquare, 
  Sparkles, 
  Loader2, 
  Send, 
  Bot, 
  User, 
  AlertCircle,
  ChevronRight,
  UploadCloud,
  File,
  Plus
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Chat() {
  const location = useLocation();
  const stateNoteId = location.state?.noteId;

  // State configurations
  const [notesList, setNotesList] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(stateNoteId || '');
  const [pastSessions, setPastSessions] = useState([]);

  // Message logging states
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Upload actions state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const notes = await api.getNotes();
        setNotesList(notes);
        
        const sessions = await api.getChatSessions();
        setPastSessions(sessions);

        // Preload past conversation from this note if it exists
        if (selectedNoteId) {
          const matchingSession = sessions.find(s => s.notesId === selectedNoteId);
          if (matchingSession) {
            setMessages(matchingSession.messages);
          } else {
            // First time greeting
            const chosenNote = notes.find(n => n.id === selectedNoteId);
            setMessages([
              {
                sender: 'ai',
                text: `Hi there! I have indexed your notes for "${chosenNote?.filename || 'Document'}". Ask me any detailed questions, formula expansions, or chapter summaries. I will answer strictly referencing your material.`,
                createdAt: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (err) {
        console.error('Error loading chat session materials:', err);
      }
    }
    loadInitialData();
  }, [selectedNoteId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectNoteChanged = (noteId) => {
    setSelectedNoteId(noteId);
    setError(null);
    if (!noteId) {
      setMessages([]);
      return;
    }

    const matchingSession = pastSessions.find(s => s.notesId === noteId);
    if (matchingSession) {
      setMessages(matchingSession.messages);
    } else {
      const chosenNote = notesList.find(n => n.id === noteId);
      setMessages([
        {
          sender: 'ai',
          text: `Hi there! I have indexed your notes for "${chosenNote?.filename || 'Document'}". Ask me any detailed questions, formula expansions, or chapter summaries. I will answer strictly referencing your material.`,
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  // Process files selected from files gallery
  const handleFileUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const validTypes = ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      if (!validTypes.includes(file.type) && ext !== 'pdf' && ext !== 'txt' && ext !== 'docx') {
        throw new Error('Invalid file format. Please upload a PDF, DOCX, or TXT file.');
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('This file exceeds our 10MB size limit for processing.');
      }

      const reader = new FileReader();

      const readAsDataURLPromise = () => {
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const result = e.target?.result;
            const base64Content = result.split(',')[1] || result;
            resolve({
              filename: file.name,
              fileType: file.type || (ext === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'),
              base64Content,
              rawText: ''
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      };

      const readAsTextPromise = () => {
        return new Promise((resolve, reject) => {
          reader.onload = (e) => {
            const text = e.target?.result;
            resolve({
              filename: file.name,
              fileType: 'text/plain',
              base64Content: btoa(unescape(encodeURIComponent(text))),
              rawText: text
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsText(file);
        });
      };

      const payload = (file.type === 'text/plain' || ext === 'txt') 
        ? await readAsTextPromise() 
        : await readAsDataURLPromise();

      const uploadResult = await api.summarizeNotes(
        payload.filename,
        payload.fileType,
        payload.base64Content,
        payload.rawText
      );

      // Reload list of notes
      const updatedNotes = await api.getNotes();
      setNotesList(updatedNotes);

      // Focus right into chat mode on the newly indexed note ID
      setSelectedNoteId(uploadResult.noteId);
      
    } catch (err) {
      console.error('Chat file ingestion error:', err);
      setUploadError(err.message || 'We could not index your document. Please verify structure.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelected = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !selectedNoteId || isLoading) return;

    setError(null);
    const userMsgText = inputValue.trim();
    setInputValue('');

    const newMsg = {
      sender: 'user',
      text: userMsgText,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, newMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const chatRes = await api.chatWithNotes(selectedNoteId, updatedMessages);
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: chatRes.reply,
          createdAt: new Date().toISOString()
        }
      ]);

      // Reload sessions lists
      const sessions = await api.getChatSessions();
      setPastSessions(sessions);
    } catch (err) {
      setError(err.message || 'Conversational query failed. Please verify source note.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-hidden h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* Hidden gallery file selector */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={handleFileSelected}
        disabled={isUploading}
      />

      {/* Dynamic Left sidebar panel: locker search */}
      <div className="hidden lg:flex w-72 bg-white border-r border-slate-200 flex-col p-6 space-y-6 shrink-0 h-full font-sans">
        <div className="space-y-4 font-sans">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-950 font-black">
              <MessageSquare size={16} />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-none">Conversation Lab</h3>
              <p className="text-[10px] text-slate-400 mt-1">Chat context references</p>
            </div>
          </div>

          {/* Quick upload trigger button inside sidebar */}
          <div className="pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/15 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Indexing note...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-white" />
                  <span>Upload From Gallery</span>
                </>
              )}
            </button>
            {uploadError && (
              <p className="text-[10px] text-red-500 mt-2 leading-tight font-medium bg-red-50 p-2 rounded-lg border border-red-100 text-center">{uploadError}</p>
            )}
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Choose Note File</label>
            <select
              value={selectedNoteId}
              onChange={(e) => handleSelectNoteChanged(e.target.value)}
              className="w-full text-xs px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 cursor-pointer text-slate-850"
            >
              <option value="">-- Choose Study Notes --</option>
              {notesList.map((n) => (
                <option key={n.id} value={n.id}>{n.filename}</option>
              ))}
            </select>
          </div>
        </div>

        {/* List of active sessions */}
        <div className="flex-1 flex flex-col min-h-0 space-y-4">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none font-sans">Recent Discussions</h4>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {pastSessions.length > 0 ? (
              pastSessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectNoteChanged(session.notesId)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs transition cursor-pointer ${selectedNoteId === session.notesId ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950 font-bold' : 'bg-white border-slate-150 hover:bg-slate-50'}`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-slate-800 block truncate">{session.notesTitle}</span>
                    <span className="text-[9px] text-slate-450 block truncate leading-relaxed text-slate-500">Last prompt: {session.messages[session.messages.length - 1]?.text}</span>
                  </div>
                  <ChevronRight size={13} className="text-slate-400 shrink-0" />
                </button>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center py-6 block pr-1 leading-normal">No recorded chat histories.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Column messaging stage */}
      <div className="flex-grow flex flex-col h-full bg-slate-50/50 relative overflow-hidden font-sans">
        {selectedNoteId ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Top context card banner */}
            <div className="bg-white border-b border-slate-200 px-4 py-3 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-sans">
              <div className="flex items-center space-x-2.5 min-w-0 flex-1">
                <span className="w-5 h-5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 flex items-center justify-center text-[10px] uppercase shrink-0">RAG</span>
                
                {/* Note selector in head, giving quick switcher and mobile compatibility */}
                <select
                  value={selectedNoteId}
                  onChange={(e) => handleSelectNoteChanged(e.target.value)}
                  className="bg-transparent border-0 font-bold text-xs text-slate-800 focus:ring-0 cursor-pointer focus:outline-none py-1 rounded truncate max-w-[150px] sm:max-w-[240px] md:max-w-xs"
                >
                  {notesList.map((n) => (
                    <option key={n.id} value={n.id}>{n.filename}</option>
                  ))}
                </select>

                {/* Additional Quick upload trigger on top menu bar */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="text-[10px] font-bold bg-indigo-600 border border-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg shrink-0 flex items-center space-x-1 transition shadow hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isUploading ? (
                    <Loader2 size={12} className="animate-spin text-white" />
                  ) : (
                    <Plus size={12} className="text-white" />
                  )}
                  <span>Add note</span>
                </button>
              </div>

              <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded leading-none shrink-0 inline-flex items-center self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1.5 animate-pulse"></span>
                <span>Contextual lock active</span>
              </div>
            </div>

            {/* Scrolling Dialogue Logs */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-50/20">
              {messages.map((m, index) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                    <div className={`flex items-start space-x-2.5 max-w-[85%] md:max-w-[75%] ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      {/* Avatar bubbles */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 shadow-sm leading-none text-xs font-bold font-mono select-none
                        ${isAI ? 'bg-indigo-50 border-indigo-150 text-indigo-950' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
                      >
                        {isAI ? <Bot size={15} /> : <User size={15} />}
                      </div>

                      {/* Msg bubble card */}
                      <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans shadow-sm whitespace-pre-wrap select-text
                        ${isAI 
                          ? 'bg-white border border-slate-200 text-slate-800' 
                          : 'bg-indigo-950 text-white font-medium'}`}
                      >
                        {m.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start animate-pulse">
                  <div className="flex items-start space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-950 flex items-center justify-center shrink-0 shadow-sm text-xs">
                      <Bot size={15} />
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-2.5 shadow-sm text-xs font-semibold text-slate-400">
                      <Loader2 className="h-4 w-4 text-indigo-950 animate-spin shrink-0" />
                      <span>AI StudyMate is reading notes...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center p-2">
                  <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3.5 rounded-xl">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Submission Footer Bar */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center">
                <input
                  type="text"
                  required
                  placeholder="Ask a question about this notes document... (e.g. Expand on the core definitions)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading}
                  className="w-full text-xs py-3.5 pl-4 pr-16 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50 transition-all font-sans"
                />
                
                {/* Submit button on right margin */}
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-lg transition-all shadow shadow-indigo-600/10 hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
                  aria-label="Send query"
                >
                  <Send size={14} className="fill-current text-white" />
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Landing Screen Prompt Instructing selected notes */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-50/50 font-sans overflow-y-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-950 font-black mb-4 shadow-sm animate-bounce">
              <MessageSquare size={20} />
            </div>

            <h3 className="font-extrabold text-sm text-slate-850 leading-tight">Interactive Conversation Lab</h3>
            <p className="text-xs text-slate-500 mt-1.5 max-w-sm leading-relaxed mb-6">Choose active study notes below or upload a new file from your device gallery to begin a contextual Q&A chat with your AI buddy.</p>

            {/* Selector and Dropzone Choice */}
            <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-6">
              <div className="space-y-2 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none font-sans">1. Select locker document</label>
                <select
                  value={selectedNoteId}
                  onChange={(e) => handleSelectNoteChanged(e.target.value)}
                  className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white cursor-pointer shadow-sm text-slate-800"
                >
                  <option value="">-- Choose Study Notes --</option>
                  {notesList.map((n) => (
                    <option key={n.id} value={n.id}>{n.filename}</option>
                  ))}
                </select>
              </div>

              <div className="relative flex items-center justify-center">
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-center">
                  <div className="border-t border-slate-150 w-full"></div>
                </div>
                <span className="relative bg-white px-3 text-[10px] uppercase tracking-widest font-extrabold text-slate-400">Or Upload from Gallery</span>
              </div>

              {/* Drag & Drop uploader area */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl py-10 px-4 text-center cursor-pointer transition-all duration-155 flex flex-col items-center justify-center
                  ${dragActive ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-300'}
                  ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-xs font-bold text-slate-800">Processing Study Document...</p>
                    <p className="text-[10px] text-slate-400">Extracting context and indexing chapters</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-3">
                      <UploadCloud className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">Drag & drop notes, or browse your PC</p>
                    <p className="text-[10px] text-slate-400 mt-1">Supports PDF, DOCX, or TXT file types</p>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3.5 rounded-xl text-left">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

