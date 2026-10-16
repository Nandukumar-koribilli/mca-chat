import { Note } from '../models/Note.js';

export const getNotes = async (req, res) => {
  try {
    const { q, category } = req.query;
    const filter = { ownerId: req.userId };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }

    const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
    return res.status(200).json({ success: true, notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return res.status(500).json({ message: 'Error retrieving notes.' });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, color, isPinned, category } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Note title is required.' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Note content is required.' });
    }

    const note = await Note.create({
      ownerId: req.userId,
      title: title.trim(),
      content: content.trim(),
      color: color || 'green',
      isPinned: Boolean(isPinned),
      category: category?.trim() || 'General',
    });

    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('Create note error:', error);
    return res.status(500).json({ message: 'Error creating note.' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, ownerId: req.userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    const { title, content, color, isPinned, category } = req.body;

    if (title !== undefined) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (category !== undefined) note.category = category.trim();

    await note.save();

    return res.status(200).json({ success: true, note });
  } catch (error) {
    console.error('Update note error:', error);
    return res.status(500).json({ message: 'Error updating note.' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });

    if (!note) {
      return res.status(404).json({ message: 'Note not found or access denied.' });
    }

    return res.status(200).json({ success: true, message: 'Note deleted successfully.' });
  } catch (error) {
    console.error('Delete note error:', error);
    return res.status(500).json({ message: 'Error deleting note.' });
  }
};
