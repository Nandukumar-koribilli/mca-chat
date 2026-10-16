import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const NoteModal = ({ isOpen, onClose, onSave, note = null }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('green');
  const [category, setCategory] = useState('Math');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
      setColor(note.color || 'green');
      setCategory(note.category || 'Math');
      setIsPinned(note.isPinned || false);
    } else {
      setTitle('');
      setContent('');
      setColor('green');
      setCategory('Math');
      setIsPinned(false);
    }
  }, [note, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSave({
      title,
      content,
      color,
      category,
      isPinned,
    });
  };

  const colors = [
    { id: 'green', name: 'Mint Green', class: 'bg-[#A2F08D]' },
    { id: 'lavender', name: 'Lavender', class: 'bg-[#9C94FB]' },
    { id: 'amber', name: 'Amber', class: 'bg-[#FDE68A]' },
    { id: 'rose', name: 'Rose', class: 'bg-[#FECDD3]' },
    { id: 'sky', name: 'Sky Blue', class: 'bg-[#BAE6FD]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl sm:rounded-4xl w-full max-w-lg p-5 sm:p-6 shadow-2xl border border-black/[0.05] max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-brand-dark">
            {note ? 'Edit Note' : 'Create New Note'}
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
              Note Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Math conspect"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Category / Subject
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Math, Biology, MCA Project"
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Card Color
            </label>
            <div className="flex items-center gap-3 pt-1">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-9 h-9 rounded-2xl ${c.class} transition-transform ${
                    color === c.id
                      ? 'ring-4 ring-brand-purple ring-offset-2 scale-110'
                      : 'hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-dark mb-1">
              Content *
            </label>
            <textarea
              rows="4"
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter note or formula content..."
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-purple focus:bg-white"
            ></textarea>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPinned"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-brand-purple focus:ring-brand-purple"
            />
            <label htmlFor="isPinned" className="text-xs font-semibold text-brand-dark cursor-pointer">
              Pin to top of notes
            </label>
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
              {note ? 'Save Changes' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
