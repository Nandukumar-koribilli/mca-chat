import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const expired = searchParams.get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError('');
    setLoading(true);

    try {
      await login(username.trim(), password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (err.message === 'Network Error' ? 'Cannot reach server at http://localhost:5000. Please start the backend server.' : 'Invalid username or password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (user, pass = 'password123') => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);
    try {
      await login(user, pass);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (err.message === 'Network Error' ? 'Backend server is not running on port 5000.' : 'Demo login failed. Please check credentials.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-4xl p-8 shadow-card border border-black/[0.04]">
        {/* Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-brand-dark text-[#A2F08D] flex items-center justify-center font-bold text-xl shadow-sm">
            <span>A</span>
          </div>
          <span className="text-xl font-extrabold tracking-tight">EduConnect</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Welcome Back</h1>
          <p className="text-xs text-brand-muted mt-1">Sign in with your student username and password.</p>
        </div>

        {expired && (
          <div className="mb-4 p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Your session expired. Please sign in again.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. katemalone"
                className="w-full pl-10 pr-4 py-3 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-3 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-pill transition-all disabled:opacity-50 mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Buttons */}
        <div className="mt-6 pt-5 border-t border-gray-100">
          <p className="text-[11px] font-bold text-gray-400 text-center mb-2.5">
            1-Click Demo Login
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleDemoLogin('katemalone')}
              className="py-2 px-3 rounded-2xl bg-gray-50 hover:bg-brand-purple/10 border border-gray-100 text-xs font-bold text-brand-dark text-left"
            >
              Kate Malone
            </button>
            <button
              onClick={() => handleDemoLogin('priya456')}
              className="py-2 px-3 rounded-2xl bg-gray-50 hover:bg-brand-purple/10 border border-gray-100 text-xs font-bold text-brand-dark text-left"
            >
              Priya Sharma
            </button>
            <button
              onClick={() => handleDemoLogin('arjun123')}
              className="py-2 px-3 rounded-2xl bg-gray-50 hover:bg-brand-purple/10 border border-gray-100 text-xs font-bold text-brand-dark text-left"
            >
              Arjun Verma
            </button>
            <button
              onClick={() => handleDemoLogin('nandu')}
              className="py-2 px-3 rounded-2xl bg-gray-50 hover:bg-brand-purple/10 border border-gray-100 text-xs font-bold text-brand-dark text-left"
            >
              Nandu Kumar
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-brand-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-purple hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};
