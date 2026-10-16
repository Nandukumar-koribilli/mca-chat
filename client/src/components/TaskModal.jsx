import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('English Literature');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setSubject(task.subject || 'English Literature');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setProgressPercent(task.progressPercent || 0);
    } else {
      setTitle('');
      setDescription('');
      setSubject('English Literature');
      setStatus('todo');
      setPriority('medium');
      setDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
      setProgressPercent(0);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title,
      description,
      subject,
      status,
      priority,
      dueDate,
      progressPercent: Number(progressPercent),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl sm:rounded-4xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-black/[0.05] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-dark">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read poem & answer questions"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              >
                <option value="English Literature">English Literature</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Math">Math</option>
                <option value="Biology">Biology</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physics">Physics</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  setStatus(newStatus);
                  if (newStatus === 'done') setProgressPercent(100);
                  if (newStatus === 'todo') setProgressPercent(0);
                  if (newStatus === 'in_progress' && progressPercent === 0) setProgressPercent(50);
                }}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-brand-dark">
                Progress: {progressPercent}%
              </label>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progressPercent}
              onChange={(e) => setProgressPercent(e.target.value)}
              className="w-full accent-brand-purple cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Description (Optional)
            </label>
            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional notes or assignment brief..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl text-sm font-semibold bg-brand-dark text-white hover:bg-black shadow-pill transition-all"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
