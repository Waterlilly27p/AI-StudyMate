import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Loader2, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Award, 
  Play, 
  RefreshCw, 
  ListRestart 
} from 'lucide-react';
import { api } from '../services/api.js';

export default function Quiz() {
  const location = useLocation();
  const stateNoteId = location.state?.noteId;
  const stateNoteTitle = location.state?.noteTitle;

  // Configuration States
  const [topic, setTopic] = useState('');
  const [noteId, setNoteId] = useState(stateNoteId || '');
  const [questionCount, setQuestionCount] = useState(5);
  const [questionType, setQuestionType] = useState('Multiple Choice');
  const [notesList, setNotesList] = useState([]);

  // Engine States
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active quiz playing states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [scoreCount, setScoreCount] = useState(0);
  const [userAnswersList, setUserAnswersList] = useState([]);
  const [finishedQuiz, setFinishedQuiz] = useState(false);

  useEffect(() => {
    async function loadNotes() {
      try {
        const notes = await api.getNotes();
        setNotesList(notes);
      } catch (err) {
        console.error('Error fetching list of locker notes:', err);
      }
    }
    loadNotes();
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim() && !noteId) {
      setError('Please choose either a note document or enter a study topic to test.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setActiveQuiz(null);
    setFinishedQuiz(false);
    setCurrentIdx(0);
    setScoreCount(0);
    setIsAnswered(false);
    setSelectedAnswer(null);
    setTypedAnswer('');
    setUserAnswersList([]);

    try {
      const quizData = await api.generateQuiz(topic, noteId, questionCount, questionType);
      setActiveQuiz(quizData);
    } catch (err) {
      setError(err.message || 'Error occurred generating quiz parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (isAnswered || !activeQuiz) return;
    
    const activeQuestion = activeQuiz.questions[currentIdx];
    let isCorrect = false;
    let answerValue = '';

    if (activeQuestion.options && activeQuestion.options.length > 0) {
      if (!selectedAnswer) return;
      isCorrect = selectedAnswer.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase();
      answerValue = selectedAnswer;
    } else {
      if (!typedAnswer.trim()) return;
      isCorrect = typedAnswer.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase();
      answerValue = typedAnswer.trim();
    }

    if (isCorrect) {
      setScoreCount(prev => prev + 1);
    }

    setUserAnswersList(prev => [...prev, answerValue]);
    setIsAnswered(true);
  };

  const handleNext = async () => {
    if (!activeQuiz) return;

    if (currentIdx + 1 < activeQuiz.questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setTypedAnswer('');
      setIsAnswered(false);
    } else {
      // Completed last question, submit attempt statistics
      setIsLoading(true);
      try {
        const finalScore = scoreCount;
        const finalTotal = activeQuiz.questions.length;
        await api.submitQuizAttempt(activeQuiz.id, finalScore, finalTotal, userAnswersList);
      } catch (err) {
        console.error('Failed to submit automated quiz attempt score:', err);
      } finally {
        setIsLoading(false);
        setFinishedQuiz(true);
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedAnswer(null);
    setTypedAnswer('');
    setIsAnswered(false);
    setScoreCount(0);
    setUserAnswersList([]);
    setFinishedQuiz(false);
  };

  const handleExitQuiz = () => {
    setActiveQuiz(null);
    setFinishedQuiz(false);
  };

  const activeQuestion = activeQuiz ? activeQuiz.questions[currentIdx] : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left pane: quiz configurations */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500">
                <BookOpen size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800">Quiz Generator Lab</h3>
                <p className="text-[10px] text-slate-400 leading-none">Practice and test retrieval recall</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="flex items-start space-x-2 text-xs text-red-650 bg-red-50 border border-red-100 p-3 rounded-xl">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Source note materials selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Locker Document Source</label>
                <select
                  value={noteId}
                  onChange={(e) => {
                    setNoteId(e.target.value);
                    if (e.target.value) setTopic(''); // Reset generic topic input
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

              {/* Generic topic backup */}
              {!noteId && (
                <div className="animate-fade-in text-xs">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Subject Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Classical Mechanics, Organic Compounds"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    disabled={isLoading}
                    className="w-full text-xs px-3.5 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50"
                  />
                </div>
              )}

              {/* Question Count Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Question Volume</label>
                <div className="grid grid-cols-3 gap-2">
                  {[5, 10, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setQuestionCount(count)}
                      disabled={isLoading}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition duration-150 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${questionCount === count ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                    >
                      {count} items
                    </button>
                  ))}
                </div>
              </div>

              {/* Format selection */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Assessment Format</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Multiple Choice', 'True/False', 'Short Answer'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setQuestionType(type)}
                      disabled={isLoading}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${questionType === type ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/15' : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}
                    >
                      {type}
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
                    <span>Formulating quiz items...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} className="fill-current" />
                    <span>Begin Practice Quiz</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right pane: quiz game stage */}
        <div className="lg:col-span-2 font-sans">
          {activeQuiz && !finishedQuiz && activeQuestion ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Top header navigation */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 leading-tight truncate max-w-sm">{activeQuiz.title}</h4>
                  <p className="text-[10px] text-indigo-650 font-bold tracking-wider mt-1 uppercase">{questionType} Practice Mode</p>
                </div>
                <button
                  onClick={handleExitQuiz}
                  className="text-xs text-slate-400 hover:text-slate-800 transition py-1 px-2.5 rounded-lg border border-slate-150"
                >
                  Exit Quiz
                </button>
              </div>

              {/* Slide item progress bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-slate-400">
                  <span>Question {currentIdx + 1} of {activeQuiz.questions.length}</span>
                  <span>Accuracy: {Math.round((scoreCount / (currentIdx || 1)) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-650 rounded-full transition-all duration-3000"
                    style={{ width: `${((currentIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question visual segment content */}
              <div className="space-y-4">
                <h3 className="font-bold text-sm text-slate-800 leading-relaxed bg-slate-50 border border-slate-150/50 p-4 rounded-xl font-sans">
                  {activeQuestion.question}
                </h3>

                {/* CONDITIONAL OPTIONS INPUT: MC or TrueFalse */}
                {activeQuestion.options && activeQuestion.options.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5">
                    {activeQuestion.options.map((opt, i) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase();
                      
                      let cardStyle = 'border-slate-150 bg-white hover:bg-slate-50/50';
                      if (isSelected) cardStyle = 'border-indigo-600 bg-indigo-50/20 text-indigo-700 ring-1 ring-indigo-600';
                      
                      if (isAnswered) {
                        if (isCorrect) cardStyle = 'border-emerald-300 bg-emerald-50/35 text-emerald-950 ring-1 ring-emerald-500';
                        else if (isSelected) cardStyle = 'border-red-300 bg-red-50/35 text-red-950 ring-1 ring-red-500';
                        else cardStyle = 'border-slate-150 bg-white opacity-60';
                      }

                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleSelectOption(opt)}
                          disabled={isAnswered}
                          className={`w-full text-left p-3.5 rounded-xl border-2 text-xs font-semibold cursor-pointer transition flex items-center justify-between ${cardStyle} disabled:cursor-default`}
                        >
                          <div className="flex items-center space-x-3 pr-2">
                            <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[10px] border ${isSelected ? 'bg-indigo-600 text-white border-indigo-600 animate-pulse' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span className="leading-tight">{opt}</span>
                          </div>

                          {isAnswered && isCorrect && <CheckCircle size={15} className="text-emerald-600 shrink-0" />}
                          {isAnswered && isSelected && !isCorrect && <XCircle size={15} className="text-red-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // CONDITIONAL SHORT ANSWER INPUT
                  <div className="space-y-3 font-sans">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Your written answer response</label>
                    <input
                      type="text"
                      placeholder="Type your answer short keyword..."
                      value={typedAnswer}
                      onChange={(e) => setTypedAnswer(e.target.value)}
                      disabled={isAnswered}
                      className="w-full text-xs p-3.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white bg-slate-50/50"
                    />

                    {isAnswered && (
                      <div className={`p-4 rounded-xl text-xs flex items-start space-x-2.5 border ${typedAnswer.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase() ? 'bg-emerald-50/30 border-emerald-150 text-emerald-950' : 'bg-red-50/20 border-red-150 text-red-950'}`}>
                        {typedAnswer.trim().toLowerCase() === activeQuestion.answer.trim().toLowerCase() ? (
                          <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-bold">Correct keyword value:</p>
                          <p className="font-mono mt-1 text-[11px] bg-white/70 px-1.5 py-0.5 border inline-block rounded border-slate-200 font-extrabold uppercase select-text leading-none">{activeQuestion.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question footer submission/next indicators */}
              <div className="flex items-center justify-end pt-4 border-t border-slate-100">
                {!isAnswered ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={activeQuestion.options && activeQuestion.options.length > 0 ? !selectedAnswer : !typedAnswer.trim()}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-extrabold py-3 px-5 rounded-xl text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    <span>Check Accuracy</span>
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-5 rounded-xl text-xs shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] transition-all cursor-pointer"
                  >
                    <span>{currentIdx + 1 < activeQuiz.questions.length ? 'Next Question' : 'Submit Score Sheet'}</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          ) : finishedQuiz && activeQuiz ? (
            // SCORE SUMMARY CARD VIEW
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6 flex flex-col items-center animate-fade-in font-sans">
              
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-center justify-center shadow-sm">
                <Award size={26} />
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Assessment Completed!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">These training metrics have been successfully logged to your private study safe.</p>
              </div>

              {/* Progress Circle score wrapper */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="64" cy="64" r="50" fill="transparent" stroke="#1e1b4b" strokeWidth="8" 
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - scoreCount / activeQuiz.questions.length)}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute flex flex-col items-center text-center leading-none">
                  <span className="text-2xl font-black text-slate-800">{scoreCount} / {activeQuiz.questions.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-wider">Score Value</span>
                </div>
              </div>

              <div className="text-xs">
                <span className="font-extrabold text-[#111827] text-sm">Passing Score accuracy rate: </span>
                <span className={`font-black text-sm block md:inline ${scoreCount / activeQuiz.questions.length >= 0.7 ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {Math.round((scoreCount / activeQuiz.questions.length) * 100)}% ({scoreCount / activeQuiz.questions.length >= 0.7 ? 'Excellent Recalled!' : 'Keep practicing!'})
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleRestart}
                  className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-600/20 active:scale-[0.98] hover:scale-[1.01] transition-all"
                >
                  <RefreshCw size={12} />
                  <span>Restart Quiz</span>
                </button>
                <button
                  onClick={handleExitQuiz}
                  className="flex items-center space-x-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-slate-705 font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer active:scale-[0.98] transition-all"
                >
                  <ListRestart size={12} />
                  <span>Different Quiz</span>
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[380px] flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl border-2 border-indigo-100 border-t-indigo-600 animate-spin"></div>
                <Sparkles size={16} className="absolute inset-0 m-auto text-indigo-600 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">Formulating randomized quiz items...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">Assembling custom question pools, formulating options, and checking with your study templates.</p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl min-h-[380px] flex flex-col items-center justify-center p-6 text-center font-sans animate-fade-in">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mb-4 shadow-sm">
                <BookOpen size={20} />
              </div>
              <h4 className="font-bold text-sm text-slate-800">No Assessment Active</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">Choose an existing note summary file from your study safe or enter a concept on the left pane to initiate a custom practice quiz session.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
