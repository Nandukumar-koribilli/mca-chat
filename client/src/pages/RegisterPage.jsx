import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [className, setClassName] = useState('MCA 2nd Sem');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register({
        username: username.trim(),
        displayName: displayName.trim() || username.trim(),
        className: className.trim(),
        password,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try a different username.');
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
          <h1 className="text-2xl font-extrabold text-brand-dark tracking-tight">Create Account</h1>
          <p className="text-xs text-brand-muted mt-1">Join your college and MCA classmates on EduConnect.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. rahul_mca"
                className="w-full pl-10 pr-4 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Full Name / Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Class / Cohort
            </label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. MCA 2nd Sem"
              className="w-full px-4 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Confirm *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2.5xl bg-gray-50 border border-gray-200/80 text-xs font-medium focus:ring-2 focus:ring-brand-purple focus:bg-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold shadow-pill transition-all disabled:opacity-50 mt-4"
          >
            {loading ? 'Creating Account...' : 'Complete Registration & Open Dashboard'}
          </button>
        </form>

        <p className="text-center text-xs text-brand-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-brand-purple hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
