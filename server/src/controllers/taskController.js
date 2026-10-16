import { Task } from '../models/Task.js';

export const getTasks = async (req, res) => {
  try {
    const { status, q } = req.query;
    const filter = { ownerId: req.userId };

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ message: 'Error retrieving tasks.' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, subject, status, priority, dueDate, progressPercent } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Task title is required.' });
    }

    const task = await Task.create({
      ownerId: req.userId,
      title: title.trim(),
      description: description?.trim() || '',
      subject: subject?.trim() || 'General',
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      progressPercent: progressPercent !== undefined ? Number(progressPercent) : (status === 'done' ? 100 : (status === 'in_progress' ? 45 : 0)),
    });

    return res.status(201).json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ message: 'Error creating task.' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, ownerId: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied.' });
    }

    const { title, description, subject, status, priority, dueDate, progressPercent, commentsCount } = req.body;

    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description.trim();
    if (subject !== undefined) task.subject = subject.trim();
    if (status !== undefined) {
      task.status = status;
      if (status === 'done' && progressPercent === undefined) task.progressPercent = 100;
      if (status === 'todo' && progressPercent === undefined) task.progressPercent = 0;
    }
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = new Date(dueDate);
    if (progressPercent !== undefined) task.progressPercent = Number(progressPercent);
    if (commentsCount !== undefined) task.commentsCount = Number(commentsCount);

    await task.save();

    return res.status(200).json({ success: true, task });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ message: 'Error updating task.' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, ownerId: req.userId });

    if (!task) {
      return res.status(404).json({ message: 'Task not found or access denied.' });
    }

    return res.status(200).json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ message: 'Error deleting task.' });
  }
};
