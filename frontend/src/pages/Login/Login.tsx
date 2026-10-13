import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpenCheck, Eye, EyeOff, LockKeyhole, LogIn, ShieldCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createAccount, setCreateAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const destination = (location.state as { from?: string } | null)?.from ?? '/';

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true); setError(null);
    try {
      await signIn(username, password, createAccount);
      navigate(destination, { replace: true });
    } catch (reason: unknown) {
      const response = reason as { response?: { data?: { detail?: string } } };
      setError(response.response?.data?.detail ?? 'We could not sign you in. Please check your details and try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:py-12 flex items-center">
      <div className="max-w-5xl w-full mx-auto grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-2xl border border-primary-700/30 bg-surface-800 shadow-2xl shadow-black/30">
        <section className="relative overflow-hidden p-8 sm:p-12 bg-gradient-to-br from-primary-900 via-primary-800 to-surface-900">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent-500/20 blur-3xl" />
          <div className="relative"><div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center mb-8"><BookOpenCheck className="text-primary-200" size={26} /></div><p className="text-primary-200 text-xs uppercase tracking-[0.22em] font-semibold">AlgoLab workspace</p><h1 className="text-3xl sm:text-4xl font-bold text-white mt-3 leading-tight">Learn algorithms by running them.</h1><p className="mt-4 text-primary-100/80 leading-relaxed">Create a personal local account to run your own inputs, compare performance, and use the Paradigm Advisor.</p><div className="mt-9 space-y-4">{[['1', 'Choose a problem', 'Start with a problem category or an algorithm.'], ['2', 'Test your own input', 'Replace the example values with your own data.'], ['3', 'See every step', 'Play the execution trace and inspect the metrics.']].map(([number, title, text]) => <div key={number} className="flex gap-3"><span className="w-7 h-7 flex-shrink-0 rounded-full bg-white/10 border border-white/20 text-primary-100 text-sm font-bold flex items-center justify-center">{number}</span><div><h2 className="text-sm font-semibold text-white">{title}</h2><p className="text-sm text-primary-100/70 mt-0.5">{text}</p></div></div>)}</div></div>
        </section>
        <section className="p-7 sm:p-10 bg-surface-800"><div className="flex items-center gap-3 mb-7"><div className="w-10 h-10 rounded-lg bg-primary-600/15 border border-primary-600/30 flex items-center justify-center"><LockKeyhole className="text-primary-400" size={20} /></div><div><p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Secure local access</p><h2 className="text-xl font-bold text-white">{createAccount ? 'Create your account' : 'Welcome back'}</h2></div></div><form onSubmit={submit} className="space-y-5"><label className="block"><span className="text-sm font-medium text-gray-300">Username</span><span className="block text-xs text-gray-500 mt-1">Letters, numbers, and underscores only.</span><input value={username} onChange={e => setUsername(e.target.value)} pattern="[A-Za-z0-9_]+" minLength={3} maxLength={32} required autoComplete="username" className="input-field mt-2" placeholder="e.g. ganesh" /></label><label className="block"><span className="text-sm font-medium text-gray-300">Password</span><div className="relative mt-2"><input value={password} onChange={e => setPassword(e.target.value)} type={showPassword ? 'text' : 'password'} minLength={8} required autoComplete={createAccount ? 'new-password' : 'current-password'} className="input-field pr-11" placeholder="At least 8 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(value => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-200">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{error && <div role="alert" className="rounded-lg border border-red-700/50 bg-red-900/20 px-3 py-2.5 text-sm text-red-300">{error}</div>}<button disabled={loading} className="btn-primary w-full justify-center py-3">{createAccount ? <UserPlus size={17} /> : <LogIn size={17} />}{loading ? 'Please wait...' : createAccount ? 'Create account and continue' : 'Sign in to AlgoLab'}</button></form><button type="button" onClick={() => { setCreateAccount(value => !value); setError(null); }} className="mt-5 w-full text-sm text-primary-400 hover:text-primary-300">{createAccount ? 'Already have an account? Sign in' : 'First time here? Create an account'}</button><div className="mt-7 pt-5 border-t border-surface-600 flex gap-2 text-xs text-gray-500"><ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />Your password is hashed and your account is stored only in this local AlgoLab installation.</div></section>
      </div>
    </div>
  );
}
