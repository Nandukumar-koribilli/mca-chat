import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, MessageSquare, CheckSquare, Sparkles, ArrowRight, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (username) => {
    setError('');
    setLoading(true);
    try {
      await login(username, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.message === 'Network Error'
            ? 'Cannot reach backend server. Make sure server is running on port 5000.'
            : 'Login failed. Please check credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-brand-dark flex flex-col justify-between selection:bg-brand-purple/20">
      {/* Top Navbar */}
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-dark text-[#A2F08D] flex items-center justify-center font-bold text-xl shadow-sm">
            <span>A</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">EduConnect</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-2.5xl text-xs font-bold text-gray-700 hover:text-black hover:bg-white/80 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-2.5xl text-xs font-bold bg-brand-dark hover:bg-black text-white shadow-pill transition-all"
          >
            Create Account
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-12 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.04] shadow-sm mb-6 text-xs font-bold text-brand-purple">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <span>Next-Generation College Student & MCA Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.15] text-brand-dark max-w-3xl">
          Your Complete Student Dashboard & Real-Time Campus Network.
        </h1>

        <p className="mt-5 text-sm sm:text-base text-brand-muted max-w-2xl leading-relaxed">
          Manage assignments, organize colorful lecture conspects, track weekly timetables, and collaborate with your MCA classmates via real-time Socket.IO chat.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/register"
            className="flex items-center gap-2 px-8 py-3.5 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-sm font-bold shadow-pill transition-all hover:scale-105 active:scale-95"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-3.5 rounded-2.5xl bg-white hover:bg-gray-50 border border-black/[0.06] text-brand-dark text-sm font-bold shadow-card transition-all"
          >
            Sign In to Dashboard
          </Link>
        </div>

        {/* 1-Click Demo Profiles (For Instant Evaluation) */}
        <div className="mt-12 p-6 bg-white rounded-4xl border border-black/[0.04] shadow-card max-w-2xl w-full">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-500 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Demo Login (Reference Accounts from Database)</span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Kate Malone', role: 'Class 9A / MCA', user: 'katemalone' },
              { name: 'Priya Sharma', role: 'MCA Classmate', user: 'priya456' },
              { name: 'Arjun Verma', role: 'MCA Classmate', user: 'arjun123' },
              { name: 'Nandu Kumar', role: 'Admin Student', user: 'nandu' },
            ].map((p) => (
              <button
                key={p.user}
                onClick={() => handleQuickLogin(p.user)}
                className="p-3 rounded-2.5xl bg-gray-50 hover:bg-brand-purple/10 border border-gray-100 text-left transition-all group"
              >
                <p className="text-xs font-bold text-brand-dark group-hover:text-brand-purple">{p.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">@{p.user}</p>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-3">
            Default test password: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">password123</code>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-brand-muted border-t border-black/[0.04]">
        EduConnect © 2025. Built with React, Vite, Node.js, Express, MongoDB Atlas, and Socket.IO.
      </footer>
    </div>
  );
};
