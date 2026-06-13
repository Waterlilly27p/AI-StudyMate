import { useEffect, useState } from 'react';
import { 
  Award, 
  Clock, 
  CalendarDays,
  Activity as ActivityIcon,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area
} from 'recharts';
import { api } from '../services/api.js';

export default function Profile() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = api.getCurrentUser();

  useEffect(() => {
    async function loadProgress() {
      try {
        const data = await api.getProgressSummary();
        setStats(data);
      } catch (err) {
        console.error('Error loading progress statistics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-400 font-medium font-sans">Compiling performance index tables...</span>
        </div>
      </div>
    );
  }

  const statistics = stats?.statistics || {
    notesSummarized: 0,
    quizzesGenerated: 0,
    flashcardsCreated: 0,
    quizAttemptsCount: 0,
    averageQuizScore: 0
  };

  const weeklyActivityData = stats?.charts?.weeklyActivity || [];
  const quizPerformanceData = stats?.charts?.quizPerformance || [];

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-slate-50 font-sans">
      
      {/* Top profile greetings card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-150 flex items-center justify-center text-indigo-950 font-black text-xl shadow-inner">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <h2 className="font-extrabold text-[#111827] text-base leading-tight flex items-center font-sans">
              <span>{currentUser?.name || 'Learner Name'}</span>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-950 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded ml-2 inline-block">Active Learner</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-sans">Study account created: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex justify-between md:justify-end gap-x-8 md:gap-x-12 w-full md:w-auto text-left md:text-right md:border-l border-slate-150 pt-4 md:pt-0 pl-0 md:pl-8">
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Streak</span>
            <span className="text-lg font-black text-indigo-600 leading-none mt-1 block">{statistics.currentStreak || 0} Days</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Private safe files</span>
            <span className="text-lg font-black text-slate-800 leading-none mt-1 block">{statistics.notesSummarized} files</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Average test grade</span>
            <span className="text-lg font-black text-emerald-600 leading-none mt-1 block">{statistics.averageQuizScore}%</span>
          </div>
        </div>
      </div>

      {/* Grid: Charts visualizers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: WEEKLY STUDY ACTIVITY FREQUENCY */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center font-sans">
              <ActivityIcon size={14} className="mr-2 text-indigo-650 shrink-0" />
              <span>Weekly Study Activity (Actions Count)</span>
            </h3>
            <span className="text-[10px] text-indigo-950 font-bold tracking-wider uppercase bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded leading-none">Last 7 Days</span>
          </div>

          <div className="h-48 text-xs font-medium">
            {weeklyActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivityData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} width={20} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '11px' }} 
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="actions" fill="#1e1b4b" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-normal text-xs uppercase tracking-widest bg-slate-50 border rounded-xl border-slate-150">
                No activity statistics present
              </div>
            )}
          </div>
        </div>

        {/* CHART 2: QUIZ ACCURACY PERFORMANCE LEVEL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
              <Award size={14} className="mr-2 text-amber-500 shrink-0" />
              <span>Quiz accuracy logs (Percentage score)</span>
            </h3>
            <span className="text-[10px] text-amber-700 font-bold tracking-wider uppercase bg-amber-50 border border-amber-100 px-2 py-0.5 rounded leading-none">Last 5 Quizzes</span>
          </div>

          <div className="h-48 text-xs font-medium">
            {quizPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={quizPerformanceData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e1b4b" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#1e1b4b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={10} width={25} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '11px' }} 
                  />
                  <Area type="monotone" dataKey="score" stroke="#1e1b4b" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic font-normal text-xs uppercase tracking-widest bg-slate-50 border rounded-xl border-slate-150">
                No test scores recorded yet
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Historical logs tracking milestones */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 font-sans">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
          <CalendarDays size={14} className="mr-2 text-indigo-950 shrink-0" />
          <span>Full Activity & History Log</span>
        </h3>

        {stats?.recentActivities && stats.recentActivities.length > 0 ? (
          <div className="border border-slate-150 rounded-xl overflow-x-auto text-xs">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-150 font-sans">
                  <th className="py-3 px-4">Milestone Activity</th>
                  <th className="py-3 px-4">Operation type</th>
                  <th className="py-3 px-4">Summary Description</th>
                  <th className="py-3 px-4 text-right">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-slate-650 bg-white font-sans">
                {stats.recentActivities.map((act) => {
                  const stamp = new Date(act.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr key={act.id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="py-3.5 px-4 font-bold text-slate-800">{act.title}</td>
                      <td className="py-3.5 px-4 uppercase font-bold text-[10px] tracking-wider">
                        <span className={`px-2.5 py-0.5 border rounded-full font-extrabold ${
                          act.type === 'quiz' ? 'bg-amber-50 text-amber-750 border-amber-100' :
                          act.type === 'flashcards' ? 'bg-purple-50 text-purple-755 border-purple-100' :
                          act.type === 'summarize' ? 'bg-emerald-50 text-emerald-755 border-emerald-100' :
                          act.type === 'chat' ? 'bg-blue-50 text-blue-755 border-blue-100' :
                          'bg-indigo-50 text-indigo-755 border-indigo-100'
                        }`}>
                          {act.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 truncate max-w-xs">{act.details}</td>
                      <td className="py-3.5 px-4 text-right text-slate-400 font-semibold">{stamp}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 font-sans">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400 mx-auto mb-3">
              <Clock size={18} />
            </div>
            <h4 className="text-xs font-bold text-slate-700">No activity logged</h4>
            <p className="text-[11px] text-slate-400 mt-1">Your study achievements and operations will log chronologically right here.</p>
          </div>
        )}
      </div>

    </div>
  );
}
