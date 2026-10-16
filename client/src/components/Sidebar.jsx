import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Calendar,
  CheckSquare,
  GraduationCap,
  BookOpen,
  MessageSquare,
  FileEdit,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose, unreadCounts = {} }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { name: 'Schedule', to: '/schedule', icon: Calendar },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare, badge: unreadCounts.tasks || 3 },
    { name: 'Tests', to: '/tests', icon: GraduationCap },
    { name: 'Reports', to: '/reports', icon: BookOpen },
    { name: 'Chat', to: '/chat', icon: MessageSquare, badge: unreadCounts.chat || 12 },
    { name: 'Notes', to: '/notes', icon: FileEdit, badge: unreadCounts.notes || 2 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container Card */}
      <aside
        className={`fixed top-4 bottom-4 left-4 z-50 w-64 bg-white rounded-4xl shadow-card border border-black/[0.04] p-5 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'
        }`}
      >
        <div>
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-2 pt-1 pb-7">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#292A2E] text-[#A2F08D] flex items-center justify-center font-bold text-xl shadow-sm">
                <span className="font-mono">A</span>
              </div>
              <span className="text-xl font-bold text-brand-dark tracking-tight">
                EduConnect
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-xl hover:bg-gray-100 lg:hidden text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-4 py-3 rounded-2.5xl transition-all duration-200 text-sm font-semibold ${
                      isActive
                        ? 'bg-brand-dark text-white shadow-pill'
                        : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3.5">
                        <Icon
                          className={`w-5 h-5 transition-transform group-hover:scale-105 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-brand-dark'
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-brand-purple text-white'
                              : 'bg-brand-purple/20 text-brand-purple-text'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions: Settings & Logout */}
        <div className="pt-4 border-t border-gray-100 space-y-1">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center gap-3.5 px-4 py-3 rounded-2.5xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-brand-dark text-white shadow-pill'
                  : 'text-brand-muted hover:text-brand-dark hover:bg-gray-50'
              }`
            }
          >
            <Settings className="w-5 h-5 text-gray-400 group-hover:text-brand-dark" />
            <span>Settings</span>
          </NavLink>

          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-3.5 px-4 py-3 rounded-2.5xl text-sm font-semibold text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-red-600" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
