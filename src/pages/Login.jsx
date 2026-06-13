import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { LogIn, KeyRound, Mail, AlertCircle, Loader2, BookOpen, ArrowLeft } from 'lucide-react';
import { googleSignIn, initAuth } from '../services/firebase.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = initAuth();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const result = await googleSignIn();
      if (result && result.user) {
        await api.googleLogin(result.user.email, result.user.displayName || 'Google User');
        navigate('/dashboard');
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled.');
        console.log('User closed the popup');
      } else {
        console.error('Google login failed:', err);
        setError('Google Sign In failed or was cancelled.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await api.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials and try again.');
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
          id="btn-login-back-to-home"
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
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none font-sans">Welcome back</h2>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-300 font-medium font-sans">
          Sign in to access your personal study locker and notes index
        </p>
      </div>

      {/* Main Form container Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 z-10 relative">
        <div className="bg-white dark:bg-[#1c1d26] py-8 px-6 sm:px-10 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl shadow-slate-100/30 dark:shadow-none">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Error alerts row */}
            {error && (
              <div className="flex items-start space-x-2.5 p-3.5 rounded-xl text-xs font-medium bg-red-50 border border-red-100 text-red-600 animate-shake">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-slate-705 dark:text-slate-300 uppercase tracking-wider mb-2">
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
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a59d3] focus:border-[#5a59d3] bg-slate-55/50 focus:bg-white dark:bg-[#12131a] transition-all disabled:opacity-75"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-xs font-bold text-slate-705 dark:text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("Please use standard password registration or register a new user.")}
                  className="text-xs font-bold text-[#5655d0] dark:text-[#8f8ff5] hover:underline transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound size={16} />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#5a59d3] focus:border-[#5a59d3] bg-slate-55/50 focus:bg-white dark:bg-[#12131a] transition-all disabled:opacity-75"
                />
              </div>
            </div>

            {/* Submit button row */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center space-x-2 bg-[#5a59d3] hover:bg-[#4e4dc5] disabled:bg-[#5a59d3]/60 text-white font-extrabold py-3.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 active:scale-[0.99] hover:scale-[1.01] cursor-pointer disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
            
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-[#1c1d26] text-slate-500">Or continue with</span>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center bg-white dark:bg-[#12131a] border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3.5 mt-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm"
            >
              {isGoogleLoading ? (
                 <Loader2 className="h-5 w-5 animate-spin text-[#5a59d3]" />
              ) : (
                <>
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </form>

          {/* Prompt for New User */}
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Not registered?{' '}
              <Link to="/register" className="font-bold text-[#5655d0] dark:text-[#a7a6ff] hover:underline transition decoration-2 underline-offset-2">
                Create a Student account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
