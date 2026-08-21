import React, { useCallback, useEffect, useState } from 'react';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('thandeka.ncube@zimparks.co.zw');
  const [password, setPassword] = useState('ranger123');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to sign in. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-earth-200">
        <div className="flex items-center gap-3 mb-7">
          <div className="p-3 rounded-xl bg-zim-700 text-gold-400"><ShieldCheck size={28} /></div>
          <div>
            <h1 className="text-2xl font-bold text-zim-800">ZimParks Operations</h1>
            <p className="text-sm text-gray-500">Anti-poaching command centre</p>
          </div>
        </div>
        {error && <p className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700"><AlertTriangle size={18} />{error}</p>}
        <label className="block text-sm font-medium text-zim-800 mb-1" htmlFor="email">Ranger email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mb-4 w-full rounded-xl border border-earth-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zim-500" />
        <label className="block text-sm font-medium text-zim-800 mb-1" htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mb-6 w-full rounded-xl border border-earth-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zim-500" />
        <button disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60" type="submit">
          {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
        <div className="mt-4 flex justify-between text-sm"><Link className="text-zim-700 underline" to="/register">Create ranger account</Link><Link className="text-zim-700 underline" to="/reset-password">Forgot password?</Link></div>
        <p className="mt-3 text-xs text-gray-500">Seed account: thandeka.ncube@zimparks.co.zw / ranger123</p>
      </form>
    </main>
  );
};

export default Login;
