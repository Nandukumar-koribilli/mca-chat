import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const ScheduleModal = ({ isOpen, onClose, onSave, item = null }) => {
  const [time, setTime] = useState('8:30 AM');
  const [lesson, setLesson] = useState('Math');
  const [teacher, setTeacher] = useState('Mrs. Goodman');
  const [location, setLocation] = useState('B3, Room 124');
  const [dayOfWeek, setDayOfWeek] = useState('Monday');

  useEffect(() => {
    if (item) {
      setTime(item.time || '8:30 AM');
      setLesson(item.lesson || 'Math');
      setTeacher(item.teacher || 'Mrs. Goodman');
      setLocation(item.location || 'B3, Room 124');
      setDayOfWeek(item.dayOfWeek || 'Monday');
    } else {
      setTime('8:30 AM');
      setLesson('Math');
      setTeacher('Mrs. Goodman');
      setLocation('B3, Room 124');
      setDayOfWeek('Monday');
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!time.trim() || !lesson.trim() || !teacher.trim() || !location.trim()) return;

    onSave({
      time,
      lesson,
      teacher,
      location,
      dayOfWeek,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl sm:rounded-4xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-black/[0.05] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-dark">
            {item ? 'Edit Class Schedule' : 'Add Class Schedule'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Time (e.g. 8:30 AM) *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="8:30 AM"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Day of Week
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Lesson / Subject *
              </label>
              <input
                type="text"
                required
                value={lesson}
                onChange={(e) => setLesson(e.target.value)}
                placeholder="e.g. Math, ELA, Biology"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Teacher *
              </label>
              <input
                type="text"
                required
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
                placeholder="e.g. Mrs. Goodman"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Classroom / Location *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. B3, Room 124"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
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
              {item ? 'Save Changes' : 'Add Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
