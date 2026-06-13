import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { User, Mail, KeyRound, AlertCircle, Loader2, UserPlus, BookOpen, ArrowLeft } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Structural validations
    if (!name || !email || !password) {
      setError('Please fill in all requested fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must contain at least 8 characters for security.');
      return;
    }

    // Direct email simple format check
    if (!email.includes('@') || !email.includes('.')) {
      setError('Please provide a valid email format (e.g. student@domain.com).');
      return;
    }

    setIsLoading(true);
    try {
      await api.register(name, email, password);
      // Automatically redirect to the interactive dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. This account may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-[#12131a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      
      {/* Return to Landing Page Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <Link 
          to="/" 
          id="btn-register-back-to-home"
          className="flex items-center gap-2 px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-[#1c1d26] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-705 dark:text-slate-205 border border-slate-200 dark:border-slate-800 font-extrabold tracking-tight shadow-sm active:scale-95 transition-all w-fit"
        >
          <ArrowLeft size={13} className="text-[#5a59d3]" />
          <span>Go to Home Page</span>
        </Link>
      </div>

      {/* Decorative Interactive Background Glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-[#5a59d3]/12 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-15%] w-[45%] h-[45%] rounded-full bg-gradient-to-tr from-indigo-500/10 via-[#8b5cf6]/5 to-transparent blur-3xl pointer-events-none" />

      {/* Grid Pattern overlay for tech aesthetic */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000004_1px,transparent_1px),linear-gradient(to_bottom,#00000004_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header Logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 relative">
        <Link to="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#5a59d3] flex items-center justify-center shadow-md">
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">AI StudyMate</span>
        </Link>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none font-sans">Create your account</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-300 font-medium">
          Start summarizing notebooks, testing quizzes, and learning faster today
        </p>
      </div>

      {/* Main Registration Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10 relative">
        <div className="bg-white dark:bg-[#1c1d26] py-8 px-6 sm:px-10 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-100/30 dark:shadow-none">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error messaging bar */}
            {error && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl text-xs font-medium bg-red-50 border border-red-100 text-red-600 animate-shake">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Name input field */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-705 dark:text-slate-305 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a59d3] focus:border-[#5a59d3] bg-slate-55/50 focus:bg-white dark:bg-[#12131a] transition-all disabled:opacity-75"
                />
              </div>
            </div>

            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-705 dark:text-slate-305 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="student@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a59d3] focus:border-[#5a59d3] bg-slate-55/50 focus:bg-white dark:bg-[#12131a] transition-all disabled:opacity-75"
                />
              </div>
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-slate-705 dark:text-slate-305 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a59d3] focus:border-[#5a59d3] bg-slate-55/50 focus:bg-white dark:bg-[#12131a] transition-all disabled:opacity-75"
                />
              </div>
            </div>

            {/* Submit registry button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-[#5a59d3] hover:bg-[#4e4dc5] disabled:bg-[#5a59d3]/60 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.99] hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Creating Locker...</span>
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Register Free</span>
                </>
              )}
            </button>
          </form>

          {/* Prompt for Existing session */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/85 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#5655d0] dark:text-[#a7a6ff] hover:underline transition decoration-2 underline-offset-2">
                Sign In instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
