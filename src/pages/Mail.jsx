import { useState, useEffect } from 'react';
import { Mail as MailIcon, RefreshCcw, Loader2, AlertCircle } from 'lucide-react';
import { initAuth, googleSignIn, getAccessToken, logout } from '../services/firebase.js';

export default function Mail() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        fetchMessages(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setError('');
    try {
      const result = await googleSignIn();
      if (result) {
        setNeedsAuth(false);
        fetchMessages(result.accessToken);
      }
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled.');
        console.log('User closed the popup');
      } else {
        console.error('Login failed:', err);
        setError('Authentication failed or was cancelled. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchMessages = async (token) => {
    setLoading(true);
    setError('');
    try {
      const t = token || await getAccessToken();
      if (!t) {
        setNeedsAuth(true);
        return;
      }
      
      const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || 'Failed to fetch messages');
      }

      if (data.messages && data.messages.length > 0) {
        const messageDetails = await Promise.all(
          data.messages.map(async (msg) => {
            const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`, {
              headers: { Authorization: `Bearer ${t}` },
            });
            const msgData = await msgRes.json();
            const subjectHeader = msgData.payload?.headers?.find(h => h.name === 'Subject');
            const fromHeader = msgData.payload?.headers?.find(h => h.name === 'From');
            return {
              id: msg.id,
              snippet: msgData.snippet || '',
              subject: subjectHeader ? subjectHeader.value : '(No Subject)',
              from: fromHeader ? fromHeader.value : '(Unknown Sender)',
            };
          })
        );
        setMessages(messageDetails);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error loading emails');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 font-sans text-slate-800 bg-slate-50 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <MailIcon className="text-indigo-600 h-8 w-8" />
              Inbox Feed
            </h1>
            <p className="text-slate-500 mt-2">Real-time educational alerts and updates via Gmail.</p>
          </div>
          {!needsAuth && (
            <button 
              onClick={() => fetchMessages()}
              className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              title="Refresh"
            >
              <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {needsAuth ? (
          <div className="bg-white rounded-3xl p-10 md:p-16 shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex justify-center items-center mb-6">
              <MailIcon className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Gmail</h2>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">
              Sign in with your Google account to securely view your recent emails and real-time study notifications directly in the dashboard.
            </p>
            
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="gsi-material-button disabled:opacity-50 hover:bg-[#F1F5F9] focus:bg-[#E2E8F0] active:bg-[#E2E8F0] flex items-center border border-slate-300 rounded overflow-hidden max-w-[400px] w-full h-[40px] px-3 transition-colors bg-white cursor-pointer"
            >
              <div className="mr-3">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-[18px] h-[18px] block">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="text-[#3c4043] font-sans font-medium text-sm flex-grow text-center pr-3">
                {isLoggingIn ? 'Connecting...' : 'Sign in with Google'}
              </span>
            </button>
            <p className="text-xs text-slate-400 mt-6 max-w-sm">We only request read-only access to display your latest emails. Your data is never stored on our servers.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            {loading ? (
              <div className="py-20 flex flex-col items-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mb-4" />
                <p>Syncing latest emails...</p>
              </div>
            ) : messages.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <div key={msg.id} className="py-5 px-2 hover:bg-slate-50 transition-colors rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex justify-center items-center shrink-0 border border-indigo-100/50">
                      <MailIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 cursor-pointer">
                         <span className="font-bold text-slate-900 truncate">{msg.from.replace(/<.*>/, '')}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-800 truncate mb-1">{msg.subject}</h4>
                      <p className="text-sm text-slate-500 truncate" dangerouslySetInnerHTML={{ __html: msg.snippet }} />
                    </div>
                    <a 
                      href={`https://mail.google.com/mail/u/0/#inbox/${msg.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 shrink-0 bg-indigo-50 text-indigo-600 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Open in Gmail
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-20 flex flex-col items-center text-slate-400 text-center">
                 <MailIcon className="w-12 h-12 mb-4 opacity-50" />
                 <p className="text-lg font-medium text-slate-600">Inbox is empty</p>
                 <p className="text-sm">You're all caught up!</p>
              </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
              <button 
                onClick={() => {
                  logout();
                  setNeedsAuth(true);
                  setMessages([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Sign out of Google
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
