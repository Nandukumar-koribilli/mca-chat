import React, { useState } from 'react';
import { Search, Bell, ChevronDown, MoreVertical, Menu, LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ onOpenSidebar, onOpenSearch }) => {
  const { user, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between pb-4 sm:pb-6 pt-1 gap-2">
      {/* Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 lg:hidden">
        <button
          onClick={onOpenSidebar}
          aria-label="Open menu"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border border-black/[0.05] shadow-sm flex items-center justify-center text-brand-dark active:scale-95 transition-transform"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base sm:text-lg font-bold tracking-tight">EduConnect</span>
      </div>

      {/* Right Action Cluster Matching Reference Image */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Dark Rounded Search Button */}
        <button
          onClick={() => (onOpenSearch ? onOpenSearch() : navigate('/chat'))}
          title="Search classmates or tasks"
          aria-label="Search"
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-2.5xl bg-brand-dark hover:bg-brand-charcoal text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm"
        >
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Violet Rounded Notification Bell Button */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            title="Notifications"
            aria-label="Notifications"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl sm:rounded-2.5xl bg-brand-purple hover:bg-brand-purple-hover text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-sm relative"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 bg-[#A2F08D] rounded-full border-2 border-brand-purple"></span>
          </button>

          {/* Notification dropdown */}
          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-card-hover border border-black/[0.06] p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold">Notifications</span>
                <span className="text-xs font-semibold text-brand-purple bg-brand-purple-light px-2 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="py-2 space-y-2 text-xs">
                <div className="p-2.5 rounded-2xl bg-brand-canvas hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-brand-dark">Priya Sharma</p>
                  <p className="text-brand-muted">Sent you a message in MCA Cohort Discussion</p>
                </div>
                <div className="p-2.5 rounded-2xl bg-brand-canvas hover:bg-gray-100 transition-colors">
                  <p className="font-semibold text-brand-dark">Math Midterm Test</p>
                  <p className="text-brand-muted">Upcoming on May 15, 2025 at 10:00 AM</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Matching Reference Image */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="h-10 sm:h-12 bg-white hover:bg-gray-50 border border-black/[0.04] rounded-2xl sm:rounded-2.5xl px-2 sm:px-3 flex items-center gap-2 sm:gap-3 shadow-card transition-all"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-dark text-white font-bold text-xs flex items-center justify-center">
                {user?.displayName?.charAt(0) || 'U'}
              </div>
            )}

            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-brand-dark leading-tight">
                {user?.displayName || 'Kate Malone'}
              </p>
              <p className="text-[11px] text-brand-muted font-medium leading-tight">
                {user?.className || 'Class 9A'}
              </p>
            </div>

            <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-3xl shadow-card-hover border border-black/[0.06] p-2 z-50">
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/settings');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-dark hover:bg-gray-50 rounded-2xl transition-colors"
              >
                <UserIcon className="w-4 h-4 text-brand-muted" />
                Profile & Settings
              </button>
              <button
                onClick={async () => {
                  setProfileOpen(false);
                  await logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-2xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>

        {/* Three Dots More Menu Button (Desktop only, mobile accesses via bottom nav/profile) */}
        <button
          onClick={() => navigate('/settings')}
          className="hidden sm:flex w-12 h-12 rounded-2.5xl bg-white hover:bg-gray-50 border border-black/[0.04] shadow-card text-brand-muted hover:text-brand-dark items-center justify-center transition-colors"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
