import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authApi } from '../api/endpoints';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const request = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await authApi.requestPasswordReset(email);
      setMessage(data.message);
      if (data.reset_token) setToken(data.reset_token);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not request reset.');
    }
  };

  const reset = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const { data } = await authApi.resetPassword(token, password);
      setMessage(data.message);
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not reset password.');
    }
  };

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-earth-200">
        <h1 className="text-2xl font-bold text-zim-800">Reset password</h1>
        
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
        
        <form onSubmit={request}>
          <label className="block mt-4 text-sm font-medium">
            Account email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2.5"
            />
          </label>
          <button className="btn-primary mt-3 w-full justify-center">Request reset</button>
        </form>
        
        {token && (
          <form onSubmit={reset} className="mt-6 border-t pt-5">
            <label className="block text-sm font-medium">
              Reset token
              <input
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <label className="block mt-3 text-sm font-medium">
              New password
              <input
                required
                minLength="8"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-xl border px-3 py-2.5"
              />
            </label>
            <button className="btn-primary mt-3 w-full justify-center">Set new password</button>
          </form>
        )}
        
        <p className="mt-4 text-sm">
          <Link className="text-zim-700 underline" to="/login">Back to sign in</Link>
        </p>
      </div>
    </main>
  );
}
