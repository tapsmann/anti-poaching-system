import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("thandeka.ncube@zimparks.co.zw");
  const [password, setPassword] = useState("ranger123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Unable to sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-earth-50 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-earth-200">
        <div className="flex items-center gap-3 mb-7">
          <div className="p-3 rounded-xl bg-zim-700 text-gold-400">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zim-800">ZimParks Operations</h1>
            <p className="text-sm text-gray-500">Anti-poaching command centre</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-zim-800 mb-1" htmlFor="email">
            Ranger email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-earth-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zim-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-zim-800 mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-earth-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-zim-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full justify-center disabled:opacity-60 flex items-center gap-2"
        >
          {loading && <Loader2 className="animate-spin" size={18} />}
          {loading ? "Signing in..." : "Sign in"}
        </button>

        <div className="mt-4 flex justify-between text-sm">
          <Link className="text-zim-700 underline hover:text-zim-800" to="/register">
            Create ranger account
          </Link>
          <Link className="text-zim-700 underline hover:text-zim-800" to="/reset-password">
            Forgot password?
          </Link>
        </div>

        <p className="mt-3 text-xs text-gray-500 text-center">
          Seed account: thandeka.ncube@zimparks.co.zw / ranger123
        </p>
      </form>
    </main>
  );
};

export default Login;