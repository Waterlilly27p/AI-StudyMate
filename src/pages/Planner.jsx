import { useState } from 'react';
import { Calendar, Loader2, Target, CalendarDays, CheckCircle } from 'lucide-react';
import { api, getToken } from '../services/api.js';

export default function Planner() {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('7');
  const [level, setLevel] = useState('Beginner');
  const [hoursPerDay, setHoursPerDay] = useState('2');
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError(null);
    setPlan(null);

    try {
      // Create a planner endpoint in api service
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ topic, duration, level, hoursPerDay })
      });

      if (!response.ok) {
        throw new Error('Failed to generate study plan');
      }

      const data = await response.json();
      setPlan(data.plan);
    } catch (err) {
      setError(err.message || 'Error communicating with AI planner.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 flex flex-col md:flex-row gap-6">
      
      {/* Left Column: Form */}
      <div className="w-full md:w-1/3 flex flex-col gap-6 shrink-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 border border-pink-100">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Generate Plan</h2>
              <p className="text-xs text-slate-500 font-medium">AI-powered schedule</p>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Goal / Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Learn React, AP Biology"
                disabled={isLoading}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white transition-all disabled:opacity-75"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Timeframe (Days)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isLoading}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="3">3 Days (Cram)</option>
                <option value="7">1 Week</option>
                <option value="14">2 Weeks</option>
                <option value="30">1 Month</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  disabled={isLoading}
                  className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermed</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 font-sans">Hrs/Day</label>
                <select
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(e.target.value)}
                  disabled={isLoading}
                  className="block w-full px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="1">1 hr</option>
                  <option value="2">2 hrs</option>
                  <option value="4">4 hrs</option>
                  <option value="8">8 hrs</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3.5 px-4 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-300 text-white font-bold rounded-xl text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center cursor-pointer"
            >
               {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Generating Plan...
                  </>
                ) : (
                  <>
                    <Target size={16} className="mr-2" />
                    Create Roadmap
                  </>
                )}
            </button>
            {error && <p className="text-red-500 text-xs text-center font-medium mt-2">{error}</p>}
          </form>
        </div>
      </div>

      {/* Right Column: Output */}
      <div className="w-full md:w-2/3 flex flex-col">
        {plan ? (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.title}</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">{plan.summary}</p>
               </div>
            </div>

            <div className="space-y-6">
              {plan.days.map((day, idx) => (
                <div key={idx} className="relative pl-6 pb-6 border-l-2 border-slate-100 last:border-0 last:pb-0">
                  <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-pink-400"></div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Day {day.day}</span>
                    <h4 className="text-base font-bold text-slate-800">{day.theme}</h4>
                  </div>
                  <ul className="space-y-3 mt-4">
                    {day.tasks.map((task, tidx) => (
                      <li key={tidx} className="flex gap-3 text-sm text-slate-600">
                        <CheckCircle size={16} className="text-slate-300 shrink-0 mt-0.5" />
                        <div>
                           <span className="font-semibold text-slate-800">{task.title}:</span> {task.description}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[400px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-center p-8">
             <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-4">
                <CalendarDays size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-700">No Plan Generated</h3>
             <p className="text-sm text-slate-500 max-w-sm mt-2 font-medium">
               Enter your study topic, timeline, and intensity to get a step-by-step personalized schedule.
             </p>
          </div>
        )}
      </div>

    </div>
  );
}
