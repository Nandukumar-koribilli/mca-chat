import React, { useState, useEffect } from 'react';
import { Plus, Search, Pin, Trash2, Edit2, Bookmark } from 'lucide-react';
import api from '../services/api';
import { NoteModal } from '../components/NoteModal';
import { getCachedNotes, saveCachedNotes } from '../services/localDb';

export const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load from phone SQLite/IndexedDB cache on mount
  useEffect(() => {
    getCachedNotes().then((cached) => {
      if (cached && cached.length > 0) {
        setNotes(cached);
        setLoading(false);
      }
    });
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await api.get(`/notes?q=${encodeURIComponent(search)}&category=${selectedCategory}`);
      const fetchedNotes = res.data.notes || [];
      setNotes(fetchedNotes);
      saveCachedNotes(fetchedNotes);
    } catch (err) {
      console.warn('Failed to fetch notes from server, using local phone cache:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [search, selectedCategory]);

  const handleSaveNote = async (noteData) => {
    try {
      if (selectedNote) {
        await api.patch(`/notes/${selectedNote._id}`, noteData);
      } else {
        await api.post('/notes', noteData);
      }
      setModalOpen(false);
      setSelectedNote(null);
      fetchNotes();
    } catch (err) {
      console.error('Save note error:', err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error('Delete note error:', err);
    }
  };

  const handleTogglePin = async (note) => {
    try {
      await api.patch(`/notes/${note._id}`, { isPinned: !note.isPinned });
      fetchNotes();
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  };

  const getColorClasses = (color) => {
    switch (color) {
      case 'lavender':
        return 'bg-[#9C94FB] text-white';
      case 'amber':
        return 'bg-[#FDE68A] text-amber-950';
      case 'rose':
        return 'bg-[#FECDD3] text-rose-950';
      case 'sky':
        return 'bg-[#BAE6FD] text-sky-950';
      case 'green':
      default:
        return 'bg-[#A2F08D] text-brand-green-dark';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-3xl sm:rounded-4xl p-4 sm:p-7 shadow-card border border-black/[0.04] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-dark tracking-tight">
            Study Notes & Conspects
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Capture formulas, lecture conspects, and revision flashcards in colorful cards.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedNote(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 sm:py-3 rounded-2.5xl bg-brand-dark hover:bg-black text-white text-xs font-bold transition-all shadow-pill self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 shadow-card border border-black/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {['all', 'Math', 'Biology', 'Project', 'General'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2.5xl text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-brand-dark text-white shadow-pill'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'All Notes' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes content..."
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-gray-50 border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-purple"
          />
        </div>
      </div>

      {/* Notes Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            Loading notes...
          </div>
        ) : notes.length === 0 ? (
          <div className="col-span-full py-16 text-center text-brand-muted bg-white rounded-4xl border border-gray-100 p-8">
            <Bookmark className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <h3 className="text-sm font-bold text-brand-dark">No notes yet</h3>
            <p className="text-xs text-gray-400 mt-1">
              Create your first note card to quickly reference key formulas and concepts.
            </p>
          </div>
        ) : (
          notes.map((note) => (
            <div
              key={note._id}
              className={`rounded-4xl p-6 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between min-h-[240px] relative ${getColorClasses(
                note.color
              )}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm tracking-tight">{note.title}</h3>
                    {note.isPinned && (
                      <Pin className="w-3.5 h-3.5 fill-current opacity-80" />
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-80">
                    <button
                      onClick={() => handleTogglePin(note)}
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      title={note.isPinned ? 'Unpin' : 'Pin note'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setModalOpen(true);
                      }}
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      title="Edit note"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="p-1 rounded-full hover:bg-black/10 transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs leading-relaxed font-medium opacity-90 whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between text-[11px] opacity-75 font-semibold">
                <span>{note.category}</span>
                <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <NoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveNote}
        note={selectedNote}
      />
    </div>
  );
};
