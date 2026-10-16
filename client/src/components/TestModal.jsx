import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const TestModal = ({ isOpen, onClose, onSave, test = null }) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Math');
  const [testDate, setTestDate] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [location, setLocation] = useState('Hall B, Room 101');
  const [description, setDescription] = useState('');
  const [preparationNotes, setPreparationNotes] = useState('');

  useEffect(() => {
    if (test) {
      setTitle(test.title || '');
      setSubject(test.subject || 'Math');
      setTestDate(test.testDate ? new Date(test.testDate).toISOString().split('T')[0] : '');
      setDurationMinutes(test.durationMinutes || 60);
      setLocation(test.location || 'Hall B, Room 101');
      setDescription(test.description || '');
      setPreparationNotes(test.preparationNotes || '');
    } else {
      setTitle('');
      setSubject('Math');
      setTestDate(new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]);
      setDurationMinutes(60);
      setLocation('Hall B, Room 101');
      setDescription('');
      setPreparationNotes('');
    }
  }, [test, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !testDate) return;

    onSave({
      title,
      subject,
      testDate,
      durationMinutes: Number(durationMinutes),
      location,
      description,
      preparationNotes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl sm:rounded-4xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-black/[0.05] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-dark">
            {test ? 'Edit Test / Exam' : 'Schedule New Test'}
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
              Test Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Midterm Discrete Mathematics"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Subject *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Math, Algorithms, etc."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Test Date *
              </label>
              <input
                type="date"
                required
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Main Hall"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Preparation Notes / Topics
            </label>
            <textarea
              rows="3"
              value={preparationNotes}
              onChange={(e) => setPreparationNotes(e.target.value)}
              placeholder="Chapters 4-7, practice mock test papers..."
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
              {test ? 'Save Changes' : 'Schedule Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
