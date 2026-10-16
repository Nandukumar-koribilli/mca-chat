import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle, Clock, AlertTriangle, BookOpen, Calendar, TrendingUp } from 'lucide-react';
import api from '../services/api';

export const ReportsPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/summary');
        setSummary(res.data.summary);
      } catch (err) {
        console.error('Failed to load productivity report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-gray-400">
        Calculating productivity statistics...
      </div>
    );
  }

  const statCards = [
    {
      title: 'Completion Rate',
      value: `${summary?.completionRate || 0}%`,
      subtitle: `${summary?.completedTasks || 0} of ${summary?.totalTasks || 0} tasks done`,
      icon: TrendingUp,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Tasks In Progress',
      value: summary?.inProgressTasks || 0,
      subtitle: 'Currently being worked on',
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'Overdue Items',
      value: summary?.overdueTasks || 0,
      subtitle: 'Require immediate attention',
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
    },
    {
      title: 'Upcoming Tests',
      value: summary?.upcomingTests || 0,
      subtitle: 'Exams and lab quizzes scheduled',
      icon: Calendar,
      color: 'bg-brand-purple-light text-brand-purple-text',
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
          Productivity & Academic Reports
        </h1>
        <p className="text-xs text-brand-muted mt-1">
          Real-time analytics computed directly from your tasks, notes, and exam schedules.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-3xl p-6 shadow-card border border-black/[0.04] flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-gray-500">{card.title}</span>
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-3xl font-extrabold text-brand-dark tracking-tight">
                  {card.value}
                </div>
                <div className="text-xs text-gray-400 mt-1 font-medium">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subject Workload Breakdown */}
      <div className="bg-white rounded-4xl p-7 shadow-card border border-black/[0.04]">
        <h2 className="text-lg font-bold text-brand-dark mb-5">
          Workload Breakdown by Subject
        </h2>

        {summary?.subjectStats?.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No subject activity recorded yet.
          </p>
        ) : (
          <div className="space-y-4">
            {summary?.subjectStats?.map((subj) => (
              <div key={subj.subject} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-brand-dark">{subj.subject}</span>
                  <span className="text-gray-400 font-medium">
                    {subj.completed} / {subj.total} completed ({subj.rate}%)
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-brand-purple rounded-full transition-all duration-500"
                    style={{ width: `${subj.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
