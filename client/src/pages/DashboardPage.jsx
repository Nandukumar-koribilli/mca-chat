import React, { useState, useEffect } from 'react';
import { Plus, MoreHorizontal, ChevronDown, CheckCircle2, Clock, Circle } from 'lucide-react';
import api from '../services/api';
import { TaskModal } from '../components/TaskModal';
import { NoteModal } from '../components/NoteModal';
import { ScheduleModal } from '../components/ScheduleModal';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [activeTaskFilter, setActiveTaskFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, notesRes, schedRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/notes'),
        api.get('/schedule'),
      ]);
      setTasks(tasksRes.data.tasks || []);
      setNotes(notesRes.data.notes || []);
      setSchedule(schedRes.data.schedule || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateOrUpdateTask = async (taskData) => {
    try {
      if (selectedTask) {
        await api.patch(`/tasks/${selectedTask._id}`, taskData);
      } else {
        await api.post('/tasks', taskData);
      }
      setTaskModalOpen(false);
      setSelectedTask(null);
      fetchData();
    } catch (err) {
      console.error('Save task error:', err);
    }
  };

  const handleToggleTaskStatus = async (task) => {
    const nextStatus = task.status === 'done' ? 'todo' : task.status === 'todo' ? 'in_progress' : 'done';
    try {
      await api.patch(`/tasks/${task._id}`, { status: nextStatus });
      fetchData();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleCreateOrUpdateNote = async (noteData) => {
    try {
      if (selectedNote) {
        await api.patch(`/notes/${selectedNote._id}`, noteData);
      } else {
        await api.post('/notes', noteData);
      }
      setNoteModalOpen(false);
      setSelectedNote(null);
      fetchData();
    } catch (err) {
      console.error('Save note error:', err);
    }
  };

  const handleAddSchedule = async (schedData) => {
    try {
      await api.post('/schedule', schedData);
      setScheduleModalOpen(false);
      fetchData();
    } catch (err) {
      console.error('Add schedule error:', err);
    }
  };

  // Filter tasks based on selected tab
  const filteredTasks = tasks.filter((task) => {
    if (activeTaskFilter === 'all') return true;
    return task.status === activeTaskFilter;
  });

  const getStatusBadge = (status) => {
    if (status === 'in_progress') {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FEF4E8] text-[#D97706]">
          In progress
        </span>
      );
    }
    if (status === 'done') {
      return (
        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#E7F9EE] text-[#16A34A]">
          Done
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EEEAFC] text-[#6356E5]">
        To do
      </span>
    );
  };

  const formatDate = (d) => {
    if (!d) return 'May 14, 2025';
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* 2-Column Responsive Grid Matching Reference Image */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* CENTER COLUMN: "My tasks" Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
              My tasks
            </h2>
            <button
              onClick={() => {
                setSelectedTask(null);
                setTaskModalOpen(true);
              }}
              className="w-10 h-10 rounded-2.5xl border border-gray-200 flex items-center justify-center text-brand-dark hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
              title="Add task"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Pills Matching Reference Image */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 custom-scrollbar">
            {[
              { id: 'all', label: 'All task' },
              { id: 'todo', label: 'To do' },
              { id: 'in_progress', label: 'In progress' },
              { id: 'done', label: 'Done' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTaskFilter(tab.id)}
                className={`px-4 py-2 rounded-2.5xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeTaskFilter === tab.id
                    ? 'bg-brand-dark text-white shadow-pill'
                    : 'bg-gray-100/90 text-gray-600 hover:bg-gray-200/80 hover:text-brand-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task Items List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 text-brand-muted">
                <p className="text-sm font-medium">No tasks in this category.</p>
                <button
                  onClick={() => setTaskModalOpen(true)}
                  className="mt-3 text-xs font-bold text-brand-purple hover:underline"
                >
                  + Add your first task
                </button>
              </div>
            ) : (
              filteredTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  onClick={() => handleToggleTaskStatus(task)}
                  className="group p-4 rounded-3xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-bold text-brand-dark ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </h3>
                        {getStatusBadge(task.status)}
                      </div>

                      <p className="text-xs text-brand-muted mt-1 font-medium">
                        {task.subject}
                      </p>

                      <div className="flex items-center justify-between mt-2 text-[11px] text-gray-400">
                        <span>{formatDate(task.dueDate)}</span>
                        <span>
                          {task.commentsCount > 0 ? `${task.commentsCount} comments` : 'No comments'}
                        </span>
                      </div>

                      {/* Diagonal Striped Progress Bar for In-Progress Tasks (Exact match to reference!) */}
                      {task.status === 'in_progress' && (
                        <div className="w-full h-3 rounded-full striped-progress border border-[#A2F08D]/60 mt-3 relative overflow-hidden shadow-inner">
                          <div
                            className="h-full bg-transparent"
                            style={{ width: `${task.progressPercent || 48}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer View All Tasks Button */}
          <div className="mt-6 pt-2 text-center border-t border-gray-100">
            <button
              onClick={() => navigate('/tasks')}
              className="px-6 py-2.5 rounded-2.5xl text-xs font-bold text-gray-700 hover:text-black border border-gray-200/80 hover:bg-gray-50 transition-all shadow-sm"
            >
              View all tasks
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: "My notes" and "My schedule" */}
        <div className="lg:col-span-6 space-y-6">
          {/* 1. "My notes" Section */}
          <div className="bg-transparent">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-extrabold text-brand-dark tracking-tight">
                My notes
              </h2>
              <button
                onClick={() => {
                  setSelectedNote(null);
                  setNoteModalOpen(true);
                }}
                className="w-10 h-10 rounded-2.5xl bg-white border border-gray-200/70 flex items-center justify-center text-brand-dark hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
                title="Add note"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Note Cards Grid Matching Reference Screenshot Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.length > 0 ? (
                notes.slice(0, 2).map((note, index) => {
                  const isFirst = index === 0;
                  return (
                    <div
                      key={note._id}
                      onClick={() => {
                        setSelectedNote(note);
                        setNoteModalOpen(true);
                      }}
                      className={`rounded-4xl p-6 min-h-[220px] flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all cursor-pointer relative ${
                        note.color === 'lavender' || (!isFirst && note.color !== 'green')
                          ? 'bg-[#9C94FB] text-white'
                          : 'bg-[#A2F08D] text-brand-green-dark'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-bold text-sm tracking-tight">
                            {note.title}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNote(note);
                              setNoteModalOpen(true);
                            }}
                            className="p-1 rounded-full hover:bg-black/10 transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs leading-relaxed font-medium line-clamp-5 opacity-90">
                          {note.content}
                        </p>
                      </div>

                      <div className="pt-4 text-[11px] opacity-75 font-semibold">
                        {formatDate(note.createdAt)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Fallback Reference Cards */}
                  <div
                    onClick={() => setNoteModalOpen(true)}
                    className="rounded-4xl p-6 min-h-[220px] flex flex-col justify-between shadow-card bg-[#A2F08D] text-brand-green-dark cursor-pointer hover:shadow-card-hover transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm tracking-tight">Math conspect</h3>
                        <MoreHorizontal className="w-4 h-4 opacity-70" />
                      </div>
                      <p className="text-xs leading-relaxed font-medium">
                        A linear equation is an equation of the form: ax+b=cax + b = cax+b=c, where xxx is the variable, aaa, bbb, and ccc are constants, and a \neq 0a = 0.
                      </p>
                    </div>
                    <div className="pt-4 text-[11px] opacity-75 font-semibold">May 05, 2025</div>
                  </div>

                  <div
                    onClick={() => setNoteModalOpen(true)}
                    className="rounded-4xl p-6 min-h-[220px] flex flex-col justify-between shadow-card bg-[#9C94FB] text-white cursor-pointer hover:shadow-card-hover transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-sm tracking-tight">Biology conspect</h3>
                        <MoreHorizontal className="w-4 h-4 opacity-80" />
                      </div>
                      <p className="text-xs leading-relaxed font-medium opacity-90">
                        A cell is the basic structural, functional, and biological unit of all living organisms. It is the smallest unit capable of performing life functions.
                      </p>
                    </div>
                    <div className="pt-4 text-[11px] opacity-80 font-semibold">Apr 29, 2025</div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. "My schedule" Section Matching Reference Timetable */}
          <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
            <div className="flex items-center justify-between mb-4 sm:mb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
                My schedule
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScheduleModalOpen(true)}
                  className="w-9 h-9 rounded-2xl border border-gray-200 flex items-center justify-center text-brand-dark hover:bg-gray-50"
                  title="Add class"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <div className="px-3 py-1.5 rounded-2xl border border-gray-200/80 bg-gray-50/50 flex items-center gap-1.5 text-xs font-bold text-brand-dark cursor-pointer hover:bg-gray-100">
                  <span>May 14, Mon</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Mobile Schedule Card View (Phone Friendly, No Horizontal Scroll Needed) */}
            <div className="sm:hidden space-y-2.5">
              {schedule.length === 0 ? (
                <p className="py-6 text-center text-xs text-gray-400">
                  No schedule entries. Click + to add your timetable.
                </p>
              ) : (
                schedule.map((row, idx) => (
                  <div
                    key={row._id || idx}
                    className="p-3 rounded-2xl bg-gray-50/70 border border-gray-100/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {row.teacherAvatar ? (
                        <img
                          src={row.teacherAvatar}
                          alt={row.teacher}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-brand-purple/20 text-brand-purple font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {row.teacher.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-dark truncate">{row.lesson}</p>
                        <p className="text-[11px] text-gray-500 truncate">{row.teacher}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-bold text-brand-purple-text block">{row.time}</span>
                      <span className="text-[10px] text-gray-400 block">{row.location}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Timetable Table Matching Columns */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-gray-400 font-semibold border-b border-gray-100">
                    <th className="pb-3 font-normal">Time</th>
                    <th className="pb-3 font-normal">Lesson</th>
                    <th className="pb-3 font-normal">Teacher</th>
                    <th className="pb-3 font-normal text-right">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 font-medium">
                  {schedule.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-gray-400">
                        No schedule entries. Click + to add your timetable.
                      </td>
                    </tr>
                  ) : (
                    schedule.map((row, idx) => (
                      <tr key={row._id || idx} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3.5 font-bold text-brand-dark whitespace-nowrap">
                          {row.time}
                        </td>
                        <td className="py-3.5 text-gray-700 whitespace-nowrap">
                          {row.lesson}
                        </td>
                        <td className="py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            {row.teacherAvatar ? (
                              <img
                                src={row.teacherAvatar}
                                alt={row.teacher}
                                className="w-6 h-6 rounded-full object-cover border border-gray-100"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-brand-purple/20 text-brand-purple font-bold text-[10px] flex items-center justify-center">
                                {row.teacher.charAt(0)}
                              </div>
                            )}
                            <span className="text-gray-700">{row.teacher}</span>
                          </div>
                        </td>
                        <td className="py-3.5 text-right text-gray-500 whitespace-nowrap">
                          {row.location}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
        onSave={handleCreateOrUpdateTask}
        task={selectedTask}
      />

      <NoteModal
        isOpen={noteModalOpen}
        onClose={() => setNoteModalOpen(false)}
        onSave={handleCreateOrUpdateNote}
        note={selectedNote}
      />

      <ScheduleModal
        isOpen={scheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        onSave={handleAddSchedule}
      />
    </div>
  );
};
