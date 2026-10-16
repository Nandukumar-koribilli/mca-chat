import React, { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import api from '../services/api';
import { getSocket } from '../services/socket';
import { LayoutGrid, Calendar, CheckSquare, MessageSquare, FileEdit } from 'lucide-react';


export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({ tasks: 3, chat: 12, notes: 2 });
  const socket = getSocket();

  const fetchUnreadCounts = async () => {
    try {
      const [convRes, tasksRes, notesRes] = await Promise.all([
        api.get('/conversations'),
        api.get('/tasks'),
        api.get('/notes'),
      ]);

      const totalUnreadChat = (convRes.data.conversations || []).reduce(
        (sum, c) => sum + (c.unreadCount || 0),
        0
      );

      const activeTasks = (tasksRes.data.tasks || []).filter((t) => t.status !== 'done').length;
      const pinnedNotes = (notesRes.data.notes || []).filter((n) => n.isPinned).length;

      setUnreadCounts({
        chat: totalUnreadChat ?? 0,
        tasks: activeTasks ?? 0,
        notes: pinnedNotes ?? 0,
      });
    } catch (err) {
      // Keep reference default counts from image
    }
  };

  useEffect(() => {
    fetchUnreadCounts();

    if (socket) {
      socket.on('conversation_updated', fetchUnreadCounts);
      socket.on('new_message', fetchUnreadCounts);
      return () => {
        socket.off('conversation_updated', fetchUnreadCounts);
        socket.off('new_message', fetchUnreadCounts);
      };
    }
  }, [socket]);

  const mobileNavItems = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutGrid },
    { name: 'Schedule', to: '/schedule', icon: Calendar },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare, badge: unreadCounts.tasks },
    { name: 'Chat', to: '/chat', icon: MessageSquare, badge: unreadCounts.chat },
    { name: 'Notes', to: '/notes', icon: FileEdit, badge: unreadCounts.notes },
  ];

  return (
    <div className="min-h-screen bg-canvas text-brand-dark flex">
      {/* Sidebar (Fixed on desktop, drawer on mobile) */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        unreadCounts={unreadCounts}
      />

      {/* Main Content Area with safe padding for mobile bottom bar */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen transition-all">
        <div className="flex-1 p-3.5 sm:p-5 lg:p-7 pb-24 lg:pb-7 max-w-[1500px] w-full mx-auto">
          <Header
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenSearch={() => window.location.assign('/chat')}
          />
          <main>
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (iPhone / Android Thumb Friendly) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-black/[0.06] py-2 px-3 z-40 lg:hidden flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-[max(env(safe-area-inset-bottom),8px)]">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-2xl relative transition-all min-w-[56px] ${
                  isActive
                    ? 'text-brand-dark font-bold'
                    : 'text-gray-400 hover:text-gray-600 font-medium'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-brand-canvas scale-110' : ''}`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-brand-dark' : 'text-gray-400'}`} />
                  </div>
                  <span className="text-[10px] mt-0.5 tracking-tight">{item.name}</span>
                  {item.badge > 0 && (
                    <span className="absolute top-0 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-purple text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
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
  );
};
