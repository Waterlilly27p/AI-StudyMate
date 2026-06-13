import { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare,
  ChevronDown,
  RefreshCw,
  HelpCircle,
  HelpCircle as CheckCircle // Fallback or standard UI icons
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api, getToken } from '../services/api.js';

export default function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threadId, setThreadId] = useState('');
  
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // Check if token exists before making any mounts or calls
  const token = getToken();

  useEffect(() => {
    if (token) {
      loadOrCreateFloatingSession();
    }
  }, [token]);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Autofocus input on open (with a minor lag for exit/entry transitions)
      setTimeout(() => {
        chatInputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  /**
   * Loads past floating chat conversation thread or instantiates a fresh session
   */
  const loadOrCreateFloatingSession = async () => {
    try {
      const allChats = await api.getChatSessions();
      // We reserve a static named thread "assistant-floating-singleton" for simple, fast context persistence
      const floatingThread = allChats.find(c => c.notesId === 'assistant-floating-singleton');

      if (floatingThread) {
        setThreadId('assistant-floating-singleton');
        setMessages(floatingThread.messages);
      } else {
        // Start fresh structure
        const defaultGreeting = {
          sender: 'ai',
          text: "Hi there! I am your quick AI StudyMate Assistant. How can I help you learn or study today? Ask me to explain a concept step-by-step, draft a custom analogy, or practice a topic quiz!",
          createdAt: new Date().toISOString()
        };
        setThreadId('assistant-floating-singleton');
        setMessages([defaultGreeting]);
      }
    } catch (err) {
      console.error('Error establishing quick tutor session:', err);
      // Failover safely to client memory state
      setThreadId('assistant-floating-singleton');
      setMessages([
        {
          sender: 'ai',
          text: "Hello! I am your quick AI StudyMate Assistant. I'm operating in offline local session mode. What subject should we focus on?",
          createdAt: new Date().toISOString()
        }
      ]);
    }
  };

  /**
   * Reset floating session history
   */
  const handleClearHistory = async () => {
    if (confirm("Would you like to clear this assistant discussion history?")) {
      setError(null);
      try {
        await api.deleteChatSession('assistant-floating-singleton');
      } catch (e) {
        console.warn('Could not remote delete, resetting state anyway.');
      }
      const freshGreeting = {
        sender: 'ai',
        text: "History cleared! Let's start a fresh learning topic. What can I explain for you now?",
        createdAt: new Date().toISOString()
      };
      setMessages([freshGreeting]);
    }
  };

  /**
   * Send text to Gemini tutor API 
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

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setIsLoading(true);

    try {
      const res = await api.chatWithAssistant('assistant-floating-singleton', newMsgs);
      setMessages([
        ...newMsgs,
        {
          sender: 'ai',
          text: res.reply,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (err) {
      console.error('Quick assistant query failed:', err);
      setError('Connection interrupted. Let\'s try resending.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutClick = (promptText) => {
    handleSendMessage(promptText);
  };

  /**
   * Beautiful formatting engine similar to primary pages to guarantee gorgeous lists and blocks
   */
  const renderFormattedText = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 1. Heading level 3: ### Heading
      if (line.startsWith('###')) {
        return (
          <h4 key={index} className="text-xs font-bold text-slate-800 mt-2 mb-1 flex items-center border-b border-slate-100 pb-0.5">
            {line.replace('###', '').trim()}
          </h4>
        );
      }
      
      // 2. Heading level 2: ## Heading
      if (line.startsWith('##')) {
        return (
          <h3 key={index} className="text-xs font-black text-indigo-950 mt-3 mb-1.5 border-b border-indigo-50 pb-1">
            {line.replace('##', '').trim()}
          </h3>
        );
      }

      // 3. Bullets: - item or * item
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const itemContent = line.trim().replace(/^[-*]\s*/, '');
        return (
          <li key={index} className="text-[11px] text-slate-650 leading-relaxed list-none pl-4 relative mb-1">
            <span className="absolute left-1 top-2 w-1 h-1 rounded-full bg-indigo-500"></span>
            {parseInlineStyles(itemContent)}
          </li>
        );
      }

      // 4. Block quotes
      if (line.trim().startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-2 border-indigo-400 bg-indigo-50/50 rounded-r-lg px-2 py-1 text-[11px] italic text-indigo-900 my-2 leading-relaxed">
            {parseInlineStyles(line.trim().replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // 5. Standard Paragraph spacing helper
      if (line.trim() === '') {
        return <div key={index} className="h-1.5"></div>;
      }

      return (
        <p key={index} className="text-[11px] text-slate-650 leading-relaxed mb-1.5">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  const parseInlineStyles = (text) => {
    let parts = [text];
    
    // Bold parsing
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
            tempParts.push(<strong key={`b-${subIdx}`} className="font-bold text-slate-900">{sub}</strong>);
          } else if (sub !== '') {
            tempParts.push(sub);
          }
        });
      } else {
        tempParts.push(part);
      }
    });
    
    // Inline Backtick parsing
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
              <code key={`c-${subIdx}`} className="font-mono text-[9px] bg-slate-150 text-indigo-950 px-1 py-0.5 rounded border border-slate-200 select-all">{sub}</code>
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

  if (!token) return null; // Only available when logged in

  const suggestions = [
    { label: "💡 Simple Analogy", prompt: "Explain a difficult concept to me using an awesome reallife analogy." },
    { label: "⏱️ Study Intervals", prompt: "How should I structure active recall intervals for exam prep?" },
    { label: "🧠 Mind Hack", prompt: "Give me study retrieval mnemomics for memorising formulas easily." }
  ];

  return (
    <div id="floating-assistant-wrapper" className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 flex flex-col items-end pointer-events-none">
      
      {/* Dynamic Pop Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-assistant-panel"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="w-[calc(100vw-2rem)] sm:w-96 h-[460px] max-h-[70vh] bg-white rounded-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden pointer-events-auto mb-3.5 relative"
          >
            {/* Header Block bar */}
            <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white px-4 py-3 shrink-0 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center border border-white/10">
                  <Sparkles size={12} className="text-indigo-200 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-xs">AI Assistant Hub</h3>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="text-[9px] text-indigo-200 font-semibold uppercase tracking-wider">Active Companion Node</span>
                  </div>
                </div>
              </div>

              {/* Utility close and clear controls */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={handleClearHistory}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-200 hover:text-white transition cursor-pointer"
                  title="Clear conversation history"
                >
                  <RefreshCw size={12} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-indigo-200 hover:text-white transition cursor-pointer"
                  title="Minimize Panel"
                >
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* Content chat timeline message boards */}
            <div className="flex-grow overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 min-h-0 select-text">
              {messages.map((m, idx) => {
                const isAI = m.sender === 'ai';
                return (
                  <div key={idx} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                    <div className={`flex items-start space-x-1.5 max-w-[85%] ${isAI ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      {/* Avatar */}
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border text-[9px] font-bold select-none
                        ${isAI ? 'bg-indigo-50 border-indigo-100 text-indigo-950' : 'bg-slate-900 border-slate-800 text-slate-100'}`}
                      >
                        {isAI ? <Bot size={11} /> : <User size={11} />}
                      </div>

                      {/* Bubble */}
                      <div className={`p-3 rounded-xl text-[11px] leading-relaxed select-text whitespace-pre-wrap shadow-xs
                        ${isAI ? 'bg-white border border-slate-150 text-slate-850' : 'bg-indigo-950 text-white font-medium'}`}
                      >
                        {isAI ? renderFormattedText(m.text) : m.text}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Suggestions chips when the helper is freshly greeted */}
              {messages.length <= 1 && (
                <div className="pt-2 pb-1 space-y-1.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Quick Starters</span>
                  <div className="flex flex-col space-y-1.5">
                    {suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleShortcutClick(s.prompt)}
                        disabled={isLoading}
                        className="text-left w-full text-[10px] py-1.5 px-2.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-900 hover:bg-indigo-50/20 active:scale-[0.99] transition cursor-pointer disabled:opacity-50"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat typing indicator loader */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-1.5">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-950 flex items-center justify-center shrink-0 text-[9px]">
                      <Bot size={11} />
                    </div>
                    <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl flex items-center space-x-1.5 shadow-xs text-[10px] font-semibold text-slate-400">
                      <Loader2 className="h-3.5 w-3.5 text-indigo-950 animate-spin shrink-0" />
                      <span>Writing tutor guidance...</span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-2 py-2.5 text-[10px] rounded-lg bg-red-55/10 border border-red-100 text-red-700 font-medium text-center">
                  {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Chat submit footer container */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="relative flex items-center"
              >
                <input
                  ref={chatInputRef}
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="Ask a brief learning question..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full text-xs py-2.5 pl-3 pr-10 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-1.5 focus:ring-indigo-550 transition-all font-sans"
                />
                
                <button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="absolute right-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-200 text-white rounded-lg transition"
                >
                  <Send size={11} className="text-white fill-current" />
                </button>
              </form>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Pop Logo Bubble (Trigger Toggle Button) */}
      <motion.button
        id="floating-assistant-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        className="pointer-events-auto h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-950 via-indigo-900 to-indigo-850 hover:to-indigo-600 text-white shadow-xl hover:shadow-indigo-600/25 flex items-center justify-center relative cursor-pointer group active:scale-95 transition-all outline-none focus:ring-2 focus:ring-indigo-500"
        title="Open Quick Academic Companion"
      >
        <span className="absolute inset-0 rounded-full bg-indigo-500/10 animate-ping opacity-75 group-hover:opacity-100 duration-1000"></span>
        
        {isOpen ? (
          <ChevronDown size={18} className="text-white relative z-10 transition-transform" />
        ) : (
          <Sparkles size={18} className="text-white relative z-10 animate-pulse" />
        )}

        {/* Small subtle green online badge notifier */}
        {!isOpen && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full z-20"></span>
        )}
      </motion.button>

    </div>
  );
}
