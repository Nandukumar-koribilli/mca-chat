import React, { useState, useEffect } from 'react';
import { Plus, Search, CheckCircle2, Clock, Trash2, Edit2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { TaskModal } from '../components/TaskModal';
import { getCachedTasks, saveCachedTasks } from '../services/localDb';

export const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from phone SQLite/IndexedDB cache on mount
  useEffect(() => {
    getCachedTasks().then((cached) => {
      if (cached && cached.length > 0) {
        setTasks(cached);
        setLoading(false);
      }
    });
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks?status=${filter}&q=${encodeURIComponent(search)}`);
      const fetchedTasks = res.data.tasks || [];
      setTasks(fetchedTasks);
      saveCachedTasks(fetchedTasks);
    } catch (err) {
      console.warn('Failed to fetch tasks from server, using local phone cache:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filter, search]);

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        await api.patch(`/tasks/${selectedTask._id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      setModalOpen(false);
      setSelectedTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Save task error:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Delete task error:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    try {
      await api.patch(`/tasks/${task._id}`, { status: nextStatus });
      fetchTasks();
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
            Tasks & Assignments
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Track coursework deadlines, project milestones, and study priorities.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTask(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-card border border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'All Tasks' },
            { id: 'todo', label: 'To Do' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'done', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-2.5xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-brand-dark text-white shadow-pill'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or subject..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="col-span-full py-16 text-center text-brand-muted bg-white rounded-4xl border border-gray-100 p-8">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-brand-dark">No tasks found</h3>
            <p className="text-xs text-gray-400 mt-1">
              {search ? 'Try adjusting your search criteria.' : 'Create a new task to organize your study.'}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

            return (
              <div
                key={task._id}
                className="bg-white rounded-3xl p-6 shadow-card border border-black/[0.04] flex flex-col justify-between hover:shadow-card-hover transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                        task.status === 'done'
                          ? 'bg-[#E7F9EE] text-[#16A34A]'
                          : task.status === 'in_progress'
                          ? 'bg-[#FEF4E8] text-[#D97706]'
                          : 'bg-[#EEEAFC] text-[#6356E5]'
                      }`}
                    >
                      {task.status === 'in_progress' ? 'In progress' : task.status === 'done' ? 'Done' : 'To do'}
                    </span>

                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg ${
                        task.priority === 'high'
                          ? 'bg-red-50 text-red-600'
                          : task.priority === 'medium'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <h3
                    onClick={() => handleToggleStatus(task)}
                    className={`font-bold text-sm text-brand-dark cursor-pointer hover:text-brand-purple transition-colors ${
                      task.status === 'done' ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {task.title}
                  </h3>

                  <p className="text-xs text-brand-muted mt-1 font-medium">{task.subject}</p>

                  {task.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">{task.description}</p>
                  )}

                  {/* Striped progress bar if in_progress */}
                  {task.status === 'in_progress' && (
                    <div className="w-full h-2.5 rounded-full striped-progress border border-[#A2F08D]/60 mt-3 relative overflow-hidden">
                      <div
                        className="h-full bg-transparent"
                        style={{ width: `${task.progressPercent || 50}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-bold' : 'text-gray-400'}`}>
                    {isOverdue && <AlertCircle className="w-3.5 h-3.5" />}
                    <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedTask(task);
                        setModalOpen(true);
                      }}
                      className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-dark transition-colors"
                      title="Edit task"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTask}
        task={selectedTask}
      />
    </div>
  );
};
