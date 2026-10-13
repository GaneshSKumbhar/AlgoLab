import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createAccount, setCreateAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? '/visualizer';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(null);
    try {
      await signIn(username, password, createAccount);
      navigate(destination, { replace: true });
    } catch (reason: unknown) {
      const message = reason as { response?: { data?: { detail?: string } } };
      setError(message.response?.data?.detail ?? 'Could not sign in. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <form onSubmit={submit} className="glass w-full max-w-md p-7 space-y-5 border border-primary-700/30">
        <div className="text-center"><LockKeyhole className="mx-auto text-primary-400 mb-3" size={30} /><h1 className="text-2xl font-bold text-white">{createAccount ? 'Create an account' : 'Welcome back'}</h1><p className="text-sm text-gray-400 mt-2">Sign in to run algorithms, benchmarks, and advisor requests.</p></div>
        <label className="block text-sm text-gray-300">Username<input value={username} onChange={e => setUsername(e.target.value)} pattern="[A-Za-z0-9_]+" minLength={3} maxLength={32} required className="input-field mt-1" placeholder="e.g. ganesh" /></label>
        <label className="block text-sm text-gray-300">Password<input value={password} onChange={e => setPassword(e.target.value)} type="password" minLength={8} required className="input-field mt-1" placeholder="At least 8 characters" /></label>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button disabled={loading} className="btn-primary w-full justify-center py-3">{createAccount ? <UserPlus size={16} /> : <LogIn size={16} />}{loading ? 'Please wait...' : createAccount ? 'Create account' : 'Sign in'}</button>
        <button type="button" onClick={() => { setCreateAccount(v => !v); setError(null); }} className="w-full text-sm text-primary-400 hover:text-primary-300">{createAccount ? 'Already have an account? Sign in' : 'New here? Create an account'}</button>
      </form>
    </div>
  );
}
