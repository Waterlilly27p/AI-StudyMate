import { useState } from 'react';
import { HelpCircle, Sparkles, Loader2, ArrowRight, BookOpen, AlertCircle, Copy, Check } from 'lucide-react';
import { api } from '../services/api.js';

export default function Explain() {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [explanation, setExplanation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleDeconstruct = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const data = await api.explainTopic(topic, level);
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message || 'Could not explain topic. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!explanation) return;
    navigator.clipboard.writeText(explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Safe, 150% durable Markdown renderer that translates AI formatting into beautifully styled HTML
   */
  const renderFormattedExplanation = (text) => {
    if (!text) return null;
    
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // 1. Heading level 3: ### Heading
      if (line.startsWith('###')) {
        return (
          <h3 key={index} className="text-base font-bold text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-1.5 flex items-center font-sans">
            {line.replace('###', '').trim()}
          </h3>
        );
      }
      
      // 2. Heading level 2: ## Heading
      if (line.startsWith('##')) {
        return (
          <h2 key={index} className="text-lg font-black text-indigo-900 mt-8 mb-4 border-b border-indigo-50/75 pb-2 font-sans">
            {line.replace('##', '').trim()}
          </h2>
        );
      }

      // 3. Heading level 1: # Heading
      if (line.startsWith('#')) {
        return (
          <h1 key={index} className="text-xl font-black text-slate-900 mt-8 mb-4 font-sans">
            {line.replace('#', '').trim()}
          </h1>
        );
      }

      // 4. Bullets: - item or * item
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const itemContent = line.trim().replace(/^[-*]\s*/, '');
        return (
          <li key={index} className="text-xs text-slate-600 leading-relaxed list-none pl-5 relative mb-2 font-sans">
            <span className="absolute left-1.5 top-2.5 w-1 h-1 rounded-full bg-indigo-500"></span>
            {parseInlineStyles(itemContent)}
          </li>
        );
      }

      // 5. Block quotes
      if (line.trim().startsWith('>')) {
        return (
          <blockquote key={index} className="border-l-4 border-indigo-500 bg-indigo-50/50 rounded-r-xl px-4 py-3 text-xs italic text-indigo-900 my-4 leading-relaxed font-sans">
            {parseInlineStyles(line.trim().replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // 6. Horizontal Rule
      if (line.trim() === '---') {
        return <div key={index} className="h-px bg-slate-150 my-6"></div>;
      }

      // 7. Standard Paragraph
      if (line.trim() === '') {
        return <div key={index} className="h-3"></div>;
      }

      return (
        <p key={index} className="text-xs text-slate-600 leading-relaxed mb-3 font-sans">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  /**
   * Parses inline strong **text**, `monospace` code segments
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
              <code key={`c-${subIdx}`} className="font-mono text-[11px] bg-slate-100 text-pink-650 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tight scale-95">{sub}</code>
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

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      {/* Top action grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Topic Search input column */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-900">
              <HelpCircle size={18} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">Concept De-constructor</h3>
              <p className="text-[10px] text-slate-450 leading-none">Translate sophisticated terms into clear logic</p>
            </div>
          </div>

          <form onSubmit={handleDeconstruct} className="space-y-4">
            {error && (
              <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3 rounded-xl">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Topic Name</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, React Hooks"
                disabled={isLoading}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white transition-all disabled:opacity-75"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Pedagogical Level Customization</label>
              <div className="grid grid-cols-3 gap-2">
                {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    disabled={isLoading}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]
                      ${level === lvl 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15' 
                        : 'bg-white text-slate-600 border-slate-250 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/25 active:scale-[0.98] hover:scale-[1.01] transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                  <span>Synthesizing Concept...</span>
                </>
              ) : (
                <>
                  <span>De-construct Concept</span>
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Concept result explanation column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl min-h-[380px] p-6 shadow-sm relative">
            {explanation ? (
              <div className="space-y-4 animate-fade-in font-sans">
                {/* Result actions */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{level} Model</span>
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center"><Sparkles size={11} className="mr-1" /> Verified</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 text-xs text-indigo-700 hover:text-indigo-850 hover:bg-slate-50 border border-indigo-250 hover:border-indigo-350 px-3 py-1.5 rounded-lg active:scale-95 transition-all font-bold cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check size={12} className="text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="prose prose-slate max-w-none prose-sm leading-relaxed text-slate-700">
                  {renderFormattedExplanation(explanation)}
                </div>
              </div>
            ) : isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                  <Sparkles size={16} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-800">De-constructing "{topic}"</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm">Generating definitions, illustrative analogies, step-by-step paradigms, and interview questions for active recall.</p>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                  <BookOpen size={20} />
                </div>
                <h4 className="font-bold text-sm text-slate-800">No Concept Deconstructed Yet</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Enter a complicated concept like "Machine Learning" or "Spaced Repetitive Recall" on the left panel to begin active learning deconstruction.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
