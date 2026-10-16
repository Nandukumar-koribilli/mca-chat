import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, User, Trash2, Edit2 } from 'lucide-react';
import api from '../services/api';
import { ScheduleModal } from '../components/ScheduleModal';

export const SchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/schedule?dayOfWeek=${selectedDay}`);
      setSchedule(res.data.schedule || []);
    } catch (err) {
      console.error('Failed to load schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDay]);

  const handleSaveSchedule = async (data) => {
    try {
      if (selectedItem) {
        await api.patch(`/schedule/${selectedItem._id}`, data);
      } else {
        await api.post('/schedule', { ...data, dayOfWeek: selectedDay });
      }
      setModalOpen(false);
      setSelectedItem(null);
      fetchSchedule();
    } catch (err) {
      console.error('Save schedule error:', err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm('Remove this class from your timetable?')) return;
    try {
      await api.delete(`/schedule/${id}`);
      fetchSchedule();
    } catch (err) {
      console.error('Delete schedule error:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
            Class Schedule & Timetable
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Keep track of lecture timings, classroom locations, and professors.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedItem(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Class</span>
        </button>
      </div>

      {/* Day Selector Pills */}
      <div className="bg-white rounded-3xl p-3 shadow-card border border-black/[0.04] flex items-center gap-2 overflow-x-auto custom-scrollbar">
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`px-5 py-2.5 rounded-2.5xl text-xs font-bold transition-all whitespace-nowrap ${
              selectedDay === day
                ? 'bg-brand-dark text-white shadow-pill'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Table Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-gray-400 font-semibold border-b border-gray-100">
                <th className="pb-3.5 font-normal">Time</th>
                <th className="pb-3.5 font-normal">Lesson / Course</th>
                <th className="pb-3.5 font-normal">Teacher / Professor</th>
                <th className="pb-3.5 font-normal">Classroom / Location</th>
                <th className="pb-3.5 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    Loading timetable...
                  </td>
                </tr>
              ) : schedule.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-brand-muted">
                    No classes scheduled for {selectedDay}. Click Add Class above to create one.
                  </td>
                </tr>
              ) : (
                schedule.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 font-bold text-brand-dark whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-purple" />
                        <span>{row.time}</span>
                      </div>
                    </td>
                    <td className="py-4 text-brand-dark font-bold whitespace-nowrap">
                      {row.lesson}
                    </td>
                    <td className="py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {row.teacherAvatar ? (
                          <img
                            src={row.teacherAvatar}
                            alt={row.teacher}
                            className="w-7 h-7 rounded-full object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-brand-purple/20 text-brand-purple font-bold text-xs flex items-center justify-center">
                            {row.teacher.charAt(0)}
                          </div>
                        )}
                        <span className="text-gray-700">{row.teacher}</span>
                      </div>
                    </td>
                    <td className="py-4 text-gray-500 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{row.location}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setSelectedItem(row);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-dark transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(row._id)}
                          className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ScheduleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveSchedule}
        item={selectedItem}
      />
    </div>
  );
};
