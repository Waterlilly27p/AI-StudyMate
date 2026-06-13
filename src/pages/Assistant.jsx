import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  MessageSquare, 
  ArrowRight,
  BookOpen,
  BrainCircuit,
  CalendarDays,
  Gauge
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Assistant() {
  const [sessions, setSessions] = useState([]);
  const [activeNotesId, setActiveNotesId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Fetch all saved chats and retrieve only the General Assistant threads
   */
  const loadSessions = async (selectId = null) => {
    try {
      const allChats = await api.getChatSessions();
      // Filter out only chat sessions belonging to general assistant threads
      const assistantChats = allChats.filter(c => c.notesId.startsWith('assistant'));
      setSessions(assistantChats);

      if (selectId) {
        setActiveNotesId(selectId);
        const activeChat = assistantChats.find(c => c.notesId === selectId);
        setMessages(activeChat ? activeChat.messages : []);
      } else if (assistantChats.length > 0) {
        // Default to first assistant thread
        setActiveNotesId(assistantChats[0].notesId);
        setMessages(assistantChats[0].messages);
      } else {
        // No threads exist yet, create a fresh default one
        createNewSession(assistantChats);
      }
    } catch (err) {
      console.error('Error fetching tutor conversations:', err);
      setError('Could not connect to past tutor discussions.');
    }
  };

  /**
   * Instantiate a fresh general tutoring discussion thread
   */
  const createNewSession = async (existingList = sessions) => {
    setError(null);
    const newThreadId = `assistant-thread-${Date.now()}`;
    const defaultGreeting = {
      sender: 'ai',
      text: "Hi there! I am your AI StudyMate Academic Assistant. Welcome to your personalized tutoring lab!\n\nI can help you build comprehensive study guides, clarify notes, brainstorm explanations using intuitive analogies, or practice mock quiz drills. What would you like to learn today?",
      createdAt: new Date().toISOString()
    };

    const newThread = {
      id: newThreadId,
      notesId: newThreadId,
      notesTitle: 'New Discussion Thread',
      messages: [defaultGreeting]
    };

    setActiveNotesId(newThreadId);
    setMessages([defaultGreeting]);
    setSessions([newThread, ...existingList]);
  };

  /**
   * Process and delete a tutoring thread context locally and remotely
   */
  const handleDeleteSession = async (notesId, e) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this study session history?")) {
      try {
        // Delete endpoint we are adding to server.ts, fallback local filter in state if not supported
        await api.deleteChatSession(notesId);
        const remaining = sessions.filter(s => s.notesId !== notesId);
        setSessions(remaining);
        
        if (activeNotesId === notesId) {
          if (remaining.length > 0) {
            setActiveNotesId(remaining[0].notesId);
            setMessages(remaining[0].messages);
          } else {
            createNewSession([]);
          }
        }
      } catch (err) {
        // Local fallback removal in case delete endpoint is cached/offline
        const remaining = sessions.filter(s => s.notesId !== notesId);
        setSessions(remaining);
        if (activeNotesId === notesId) {
          if (remaining.length > 0) {
            setActiveNotesId(remaining[0].notesId);
            setMessages(remaining[0].messages);
          } else {
            createNewSession([]);
          }
        }
      }
    }
  };

  /**
   * Switch the active discussion loaded on screen
   */
  const handleSelectSession = (notesId) => {
    setActiveNotesId(notesId);
    setError(null);
    const chosen = sessions.find(s => s.notesId === notesId);
    setMessages(chosen ? chosen.messages : []);
  };

  /**
   * Handle user dialogue submit
   */
  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === 'string' ? customText : inputValue.trim();
    if (!textToSend || isLoading) return;

    setError(null);
    if (!customText) setInputValue('');

    const userMsg = {
      sender: 'user',
      text: textToSend,
      createdAt: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const activeSession = sessions.find(s => s.notesId === activeNotesId);
      
      const res = await api.chatWithAssistant(activeNotesId, updatedMessages);
      
      const newMessagesList = [
        ...updatedMessages,
        {
          sender: 'ai',
          text: res.reply,
          createdAt: new Date().toISOString()
        }
      ];
      setMessages(newMessagesList);

      // Reload lists, maintaining correct thread names
      const allChats = await api.getChatSessions();
      let assistantChats = allChats.filter(c => c.notesId.startsWith('assistant'));
      
      // If we just spoke for the first time in a 'New Discussion Thread', let's name it dynamically
      let currentSessionInState = assistantChats.find(c => c.notesId === activeNotesId);
      if (currentSessionInState && (!activeSession || activeSession.notesTitle === 'New Discussion Thread')) {
        // Name thread based on first user prompt
        const displayTitle = textToSend.length > 25 ? textToSend.substring(0, 25) + '...' : textToSend;
        currentSessionInState.notesTitle = displayTitle;
      }
      
      setSessions(assistantChats);
    } catch (err) {
      console.error('Tutor chat failed:', err);
      setError(err.message || 'Tutoring connection failed. Please check the network.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    handleSendMessage(promptText);
  };

  /**
   * Matches the visual Markdown renderer style from Explain.jsx
   */
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 1. Heading level 3: ### Heading
      if (line.startsWith('###')) {
        return (
          <h3 key={index} className="text-sm font-bold text-slate-800 mt-4 mb-2 flex items-center font-sans border-b border-slate-100 pb-1">
            {line.replace('###', '').trim()}
          </h3>
        );
      }
      
      // 2. Heading level 2: ## Heading
      if (line.startsWith('##')) {
        return (
          <h2 key={index} className="text-base font-black text-indigo-950 mt-6 mb-3 border-b border-indigo-50 pb-1.5 font-sans">
            {line.replace('##', '').trim()}
          </h2>
        );
      }

      // 3. Heading level 1: # Heading
      if (line.startsWith('#')) {
        return (
          <h1 key={index} className="text-base font-extrabold text-slate-900 mt-6 mb-3 font-sans">
            {line.replace('#', '').trim()}
          </h1>
        );
      }

      // 4. Bullets: - item or * item
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const itemContent = line.trim().replace(/^[-*]\s*/, '');
        return (
          <li key={index} className="text-xs text-slate-600 leading-relaxed list-none pl-5 relative mb-1.5 font-sans">
            <span className="absolute left-1.5 top-2.5 w-1 h-1 rounded-full bg-indigo-500"></span>
            {parseInlineStyles(itemContent)}
          </li>
        );
      }

      // 5. Block quotes
      if (line.trim().startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-indigo-400 bg-indigo-50/40 rounded-r-xl px-3 py-2 text-xs italic text-indigo-900 my-3 leading-relaxed font-sans">
            {parseInlineStyles(line.trim().replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // 6. Horizontal Rule
      if (line.trim() === '---') {
        return <div key={index} className="h-px bg-slate-100 my-4"></div>;
      }

      // 7. Standard Paragraph
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }

      return (
        <p key={index} className="text-xs text-slate-600 leading-relaxed mb-2 font-sans">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  /**
   * Parses strong **text**, `code` matching inline logic
   */
  const parseInlineStyles = (text) => {
    let parts = [text];
    
    // Process Bold inline matches
    const tempParts = [];
    parts.forEach(part => {
      if (typeof part !== 'string') {
        tempParts.push(part);
        return;
      }
      
      const splitArr = part.split('**');
      if (splitArr.length > 1) {
        splitArr.forEach((sub, subIdx) => {
          if (subIdx % 2 !== 0) {
            tempParts.push(<strong key={`b-${subIdx}`} className="font-extrabold text-[#111827]">{sub}</strong>);
          } else if (sub !== '') {
            tempParts.push(sub);
          }
        });
      } else {
        tempParts.push(part);
      }
    });
    
    // Process Backtick Code inline matches
    const finalParts = [];
    tempParts.forEach(part => {
      if (typeof part !== 'string') {
        finalParts.push(part);
        return;
      }
      
      const splitArr = part.split('`');
      if (splitArr.length > 1) {
        splitArr.forEach((sub, subIdx) => {
          if (subIdx % 2 !== 0) {
            finalParts.push(
              <code key={`c-${subIdx}`} className="font-mono text-[10px] bg-slate-100 text-pink-650 px-1 py-0.5 rounded border border-slate-200 coding-style select-all">{sub}</code>
            );
          } else if (sub !== '') {
            finalParts.push(sub);
          }
        });
      } else {
        finalParts.push(part);
      }
    });
    
    return finalParts.map((item, idx) => <span key={idx}>{item}</span>);
  };

  const starterPrompts = [
    {
      title: "Quick Analogies",
      icon: BrainCircuit,
      color: "bg-teal-50 border-teal-100 text-teal-800",
      description: "Explain difficult core terminology using simple intuitive scenarios.",
      prompt: "I am trying to learn a complicated academic concept. Please explain it to me like I am 12 years old, using a fun real-world analogy and a summary walkthrough."
    },
    {
      title: "Drill Me",
      icon: BookOpen,
      color: "bg-blue-50 border-blue-100 text-blue-800",
      description: "Ask difficult testing questions on a topic and review my answers.",
      prompt: "Please act as my personal academic tutor. Quiz me on a topic of your choice: ask me one challenging question at a time and wait for my response before grading it and giving suggestions."
    },
    {
      title: "Study Schedule",
      icon: CalendarDays,
      color: "bg-orange-50 border-orange-100 text-orange-850",
      description: "Schedule dynamic daily goals prior to a testing milestone.",
      prompt: "Can you create a highly efficient daily study schedule for learning a new technical language or syllabus in exactly 14 days? Detail the Pomodoro counts and active recall intervals."
    },
    {
      title: "Memory Hacks",
      icon: Sparkles,
      color: "bg-indigo-50 border-indigo-100 text-indigo-850",
      description: "Map acronyms and mnemonics to facts for fast recall.",
      prompt: "Give me some clever study hacks, memory mnemonics, or retrieval cues that I can use to comfortably memorize lists, formulas, and vocabulary definitions for my upcoming test."
    }
  ];

  const activeSessionTitle = sessions.find(s => s.notesId === activeNotesId)?.notesTitle || 'AI Academic Companion';

  return (
    <div className="flex-grow flex overflow-hidden h-[calc(100vh-4rem)] bg-slate-50 relative">
      
      {/* Sidebar: Lists active discussion channels/threads */}
      <div className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-6 space-y-6 shrink-0 h-full font-sans">
        <div className="space-y-4">
          <div className="flex items-center space-x-2.5">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-950 font-black">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-800 leading-none">Tutoring Lounge</h3>
              <p className="text-[10px] text-slate-400 mt-1">General learning conversations</p>
            </div>
          </div>

          <button
            onClick={() => createNewSession()}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 border-2 border-indigo-600 text-white font-extrabold text-xs rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/10 active:scale-[0.98] cursor-pointer"
          >
            <Plus size={14} className="text-white" />
            <span>New Discussion</span>
          </button>
        </div>

        <div className="flex-grow flex flex-col min-h-0 space-y-3">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">History Threads</h4>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 min-h-0">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => handleSelectSession(session.notesId)}
                  className={`w-full text-left p-3.5 rounded-xl border flex items-center justify-between text-xs transition relative group cursor-pointer ${activeNotesId === session.notesId ? 'bg-indigo-50/60 border-indigo-200 text-indigo-950 font-bold' : 'bg-white border-slate-150 hover:bg-slate-50'}`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-slate-800 block truncate">{session.notesTitle}</span>
                    <span className="text-[9px] text-slate-400 block truncate leading-normal transition-colors font-sans mt-0.5">
                      {session.messages[session.messages.length - 1]?.text || "Empty Discussion"}
                    </span>
                  </div>
                  
                  <button
                    onClick={(e) => handleDeleteSession(session.notesId, e)}
                    className="p-1 px-1.5 hover:bg-indigo-100 hover:text-red-700 text-slate-450 rounded-lg shrink-0 transition md:opacity-0 group-hover:opacity-100 cursor-pointer"
                    title="Delete discussion"
                  >
                    <Trash2 size={12} />
                  </button>
                </button>
              ))
            ) : (
              <p className="text-[10px] text-slate-400 italic text-center py-6 leading-normal block">No discusses saved.</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Area: Conversational workspace */}
      <div className="flex-grow flex flex-col h-full bg-slate-50/50 relative overflow-hidden font-sans">
        
        {/* Banner header bar */}
        <div className="bg-white border-b border-slate-200 px-5 py-3.5 shrink-0 flex items-center justify-between font-sans">
          <div className="flex items-center space-x-3.5 min-w-0">
            <div className="w-5 h-5 rounded bg-indigo-50 border border-indigo-100 text-indigo-850 flex items-center justify-center font-bold text-[9px] uppercase shrink-0">HQ</div>
            <h2 className="font-extrabold text-xs text-slate-800 truncate select-all">{activeSessionTitle}</h2>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {/* Quick action button to trigger New session on mobile layout too */}
            <button
              onClick={() => createNewSession()}
              className="md:hidden p-1.5 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
              title="New Discussion"
            >
              <Plus size={16} />
            </button>
            <div className="text-[10px] font-bold text-indigo-850 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded leading-none shrink-0 inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block mr-1.5 animate-pulse"></span>
              <span>General intelligent node</span>
            </div>
          </div>
        </div>

        {/* Messaging Timeline board */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-50/20">
          
          {/* If there are no custom user queries, offer standard guidance cards (onboarding experience) */}
          {messages.length <= 1 ? (
            <div className="max-w-3xl mx-auto space-y-6 pt-4 pb-8 font-sans">
              
              {/* Header card */}
              <div className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-md shadow-indigo-950/10 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Sparkles size={120} className="text-white" />
                </div>
                
                <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <Sparkles className="text-white animate-bounce" size={20} />
                </div>
                <h3 className="text-base font-extrabold tracking-tight">AI StudyMate Academic Advisor</h3>
                <p className="text-xs text-indigo-200 mt-1.5 max-w-md mx-auto leading-relaxed">Ask study strategy questions, clarify technical subjects, practice code setups, or test your topic revision comfortably.</p>
              </div>

              {/* Grid block starters */}
              <div className="space-y-2.5">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none font-sans">1. Quick Learning Pathways</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {starterPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickPrompt(item.prompt)}
                      disabled={isLoading}
                      className="text-left bg-white border border-slate-200 rounded-2xl p-4 hover:border-indigo-400 hover:shadow-md active:scale-[0.99] transition-all cursor-pointer group disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-2.5 mb-2.5">
                        <span className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${item.color}`}>
                          <item.icon size={13} />
                        </span>
                        <span className="font-bold text-xs text-slate-800 group-hover:text-indigo-900 transition-colors leading-none">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-normal leading-relaxed">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, index) => {
              const isAI = m.sender === 'ai';
              return (
                <div key={index} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                  <div className={`flex items-start space-x-2.5 max-w-[85%] md:max-w-[75%] ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
                    
                    {/* Avatar bubbles */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border shrink-0 shadow-sm leading-none text-xs font-bold select-none
                      ${isAI ? 'bg-indigo-50 border-indigo-150 text-indigo-950 animate-fade-in' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
                    >
                      {isAI ? <Bot size={15} /> : <User size={15} />}
                    </div>

                    {/* Speech card bubble */}
                    <div className={`p-4 rounded-2xl text-xs leading-relaxed font-sans shadow-sm whitespace-pre-wrap select-text
                      ${isAI 
                        ? 'bg-white border border-slate-200 text-slate-800' 
                        : 'bg-indigo-950 text-white font-medium'}`}
                    >
                      {isAI ? renderFormattedText(m.text) : m.text}
                    </div>

                  </div>
                </div>
              );
            })
          )}

          {/* Inline active loader */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-150 text-indigo-950 flex items-center justify-center shrink-0 shadow-sm text-xs">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center space-x-2.5 shadow-sm text-xs font-semibold text-slate-400">
                  <Loader2 className="h-4 w-4 text-indigo-950 animate-spin shrink-0" />
                  <span>AI Assistant is writing a lesson...</span>
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

        {/* Messaging footer submit block */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }} 
            className="max-w-4xl mx-auto relative flex items-center"
          >
            <input
              type="text"
              required
              placeholder="Ask anything or request explanations... (e.g., Explain standard active recall intervals)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="w-full text-xs py-3.5 pl-4 pr-16 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50 transition-all font-sans"
            />
            
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="absolute right-2 p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-lg transition-all shadow shadow-indigo-600/10 hover:scale-105 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
              aria-label="Send lesson query"
            >
              <Send size={14} className="fill-current text-white" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
