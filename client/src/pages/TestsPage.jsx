import React, { useState, useEffect } from 'react';
import { Plus, GraduationCap, Calendar, Clock, MapPin, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { TestModal } from '../components/TestModal';

export const TestsPage = () => {
  const [tests, setTests] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/tests');
      setTests(res.data.tests || []);
    } catch (err) {
      console.error('Failed to load tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSaveTest = async (testData) => {
    try {
      if (selectedTest) {
        await api.patch(`/tests/${selectedTest._id}`, testData);
      } else {
        await api.post('/tests', testData);
      }
      setModalOpen(false);
      setSelectedTest(null);
      fetchTests();
    } catch (err) {
      console.error('Save test error:', err);
    }
  };

  const handleDeleteTest = async (id) => {
    if (!confirm('Are you sure you want to delete this test?')) return;
    try {
      await api.delete(`/tests/${id}`);
      fetchTests();
    } catch (err) {
      console.error('Delete test error:', err);
    }
  };

  const handleToggleStatus = async (test) => {
    const nextStatus = test.status === 'completed' ? 'upcoming' : 'completed';
    try {
      await api.patch(`/tests/${test._id}`, { status: nextStatus });
      fetchTests();
    } catch (err) {
      console.error('Update test status error:', err);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
            Tests & Examination Tracker
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Stay ahead of upcoming quizzes, midterms, and lab viva examinations.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTest(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule Test</span>
        </button>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            Loading scheduled tests...
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full py-16 text-center text-brand-muted bg-white rounded-4xl border border-gray-100 p-8">
            <GraduationCap className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-brand-dark">No upcoming tests</h3>
            <p className="text-xs text-gray-400 mt-1">
              Add your upcoming exams to keep track of revision notes and dates.
            </p>
          </div>
        ) : (
          tests.map((test) => {
            const isCompleted = test.status === 'completed';
            const dateStr = new Date(test.testDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={test._id}
                className="bg-white rounded-3xl p-6 shadow-card border border-black/[0.04] flex flex-col justify-between hover:shadow-card-hover transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-[#E7F9EE] text-[#16A34A]'
                          : 'bg-brand-purple-light text-brand-purple-text'
                      }`}
                    >
                      {test.subject}
                    </span>

                    <button
                      onClick={() => handleToggleStatus(test)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        isCompleted
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Mark Done'}
                    </button>
                  </div>

                  <h3
                    className={`font-bold text-base text-brand-dark mb-2 ${
                      isCompleted ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {test.title}
                  </h3>

                  <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{test.durationMinutes} minutes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{test.location}</span>
                    </div>
                  </div>

                  {test.preparationNotes && (
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs text-gray-600">
                      <p className="font-bold text-[11px] text-brand-dark mb-0.5">Prep Notes:</p>
                      <p className="line-clamp-3">{test.preparationNotes}</p>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-end gap-1">
                  <button
                    onClick={() => {
                      setSelectedTest(test);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-brand-dark transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTest(test._id)}
                    className="p-1.5 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <TestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTest}
        test={selectedTest}
      />
    </div>
  );
};
